import browser from 'webextension-polyfill'
import CustomSync, { SyncError } from '@/common/service/custom-sync'
import storage from '@/common/storage'
import { createNewTabList } from '@/common/list'
import { SYNC_PHASES } from '@/common/constants'
import { logSyncEvent } from '@/common/sync-logger'
import tabsHelper from '@/common/tabs'
import manager from './bridge'
import _ from 'lodash'

const RETRY_DELAY = 10000

const getListTimestamp = list => list?.updatedAt || list?.time || 0
const buildSignature = lists => (lists || []).map(list => `${list._id}:${getListTimestamp(list)}:${list.tabs?.length || 0}`).join('|')
const computeVersion = lists => (lists || []).reduce((acc, list) => Math.max(acc, getListTimestamp(list)), 0)
const parseRemoteVersion = value => {
  if (!value) return 0
  if (typeof value === 'number') return value
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const mapRemoteList = remote =>
  createNewTabList({
    _id: remote.remote_id,
    title: remote.title,
    tabs: remote.tabs || [],
    tags: remote.tags || [],
    category: remote.category || '',
    time: remote.time || Date.now(),
    pinned: remote.pinned,
    color: remote.color || '',
    updatedAt: remote.updated_at || remote.time || Date.now(),
  })

let pendingPayload = null
let retryTimer = null

let state = $state({
  lists: [],
  opts: {},
  aiLoading: null,
  syncing: false,
  snackbar: { status: false, msg: '' },
  initialized: false,
  lastSyncSuccess: null,
  syncPhase: SYNC_PHASES.NEVER_SYNCED,
  syncError: null,
  localOnly: false,
  lastSyncedAt: null,
  lastSyncedSignature: '',
  remoteVersion: 0,
  pendingRetry: null,
})

const normalizeSyncError = error => {
  if (error instanceof SyncError) {
    const phaseMap = {
      offline: SYNC_PHASES.OFFLINE,
      auth: SYNC_PHASES.AUTH_ERROR,
      server: SYNC_PHASES.SERVER_ERROR,
    }
    return {
      code: error.code || 'unknown',
      message: error.message,
      status: error.status,
      phase: phaseMap[error.code] || SYNC_PHASES.SERVER_ERROR,
    }
  }
  return {
    code: 'unknown',
    message: error?.message || 'Unexpected sync failure',
    status: null,
    phase: SYNC_PHASES.SERVER_ERROR,
  }
}

const scheduleRetry = () => {
  if (!state.pendingRetry || retryTimer) return
  logSyncEvent('retry_scheduled', {
    delayMs: RETRY_DELAY,
    reason: state.pendingRetry?.reason || 'unknown',
  })
  retryTimer = setTimeout(() => {
    retryTimer = null
    if (!state.pendingRetry) return
    pendingPayload = state.pendingRetry
    pushStateToServer(state.pendingRetry)
  }, RETRY_DELAY)
}

const pushStateToServer = async payload => {
  if (!payload) return
  state.syncing = true
  state.syncPhase = SYNC_PHASES.SYNCING
  try {
    const response = await CustomSync.syncState(payload.lists)
    const remoteVersion = parseRemoteVersion(response?.updated_at) || computeVersion(payload.lists)
    state.lastSyncedSignature = payload.signature
    state.remoteVersion = remoteVersion
    state.lastSyncedAt = Date.now()
    state.lastSyncSuccess = true
    state.syncPhase = SYNC_PHASES.SYNCED
    state.syncError = null
    state.localOnly = false
    state.pendingRetry = null
    pendingPayload = null
    logSyncEvent('push_success', {
      listCount: payload.lists?.length || 0,
      signature: payload.signature,
      reason: payload.reason,
      remoteVersion,
    })
    if (retryTimer) {
      clearTimeout(retryTimer)
      retryTimer = null
    }
  } catch (error) {
    const normalized = normalizeSyncError(error)
    state.lastSyncSuccess = false
    state.syncPhase = normalized.phase
    state.syncError = normalized
    state.localOnly = true
    state.pendingRetry = payload
    scheduleRetry()
    logSyncEvent('push_failed', {
      code: normalized.code,
      phase: normalized.phase,
      message: normalized.message,
      listCount: payload?.lists?.length || 0,
      reason: payload?.reason,
    })
    console.error('[SquirrlTab] Sync failed:', error)
  } finally {
    state.syncing = false
  }
}

const debouncedPush = _.debounce(() => {
  if (!pendingPayload) return
  pushStateToServer(pendingPayload)
}, 1200)

const scheduleSync = (reason = 'change', { immediate = false, listsOverride = null, signatureOverride = null, force = false } = {}) => {
  if (!state.initialized) return
  const lists = listsOverride || $state.snapshot(state.lists)
  const signature = signatureOverride || buildSignature(lists)
  if (!force && signature === state.lastSyncedSignature) return
  pendingPayload = { lists, signature, reason }
  state.localOnly = true
  if ([SYNC_PHASES.SYNCED, SYNC_PHASES.IDLE, SYNC_PHASES.NEVER_SYNCED].includes(state.syncPhase)) {
    state.syncPhase = SYNC_PHASES.LOCAL_ONLY
  }
  if (immediate) {
    debouncedPush.cancel()
    pushStateToServer(pendingPayload)
  } else {
    debouncedPush()
  }
}

const hydrateFromRemote = async () => {
  state.syncing = true
  state.syncPhase = SYNC_PHASES.SYNCING
  logSyncEvent('hydrate_started')
  try {
    const response = await CustomSync.download()
    const remoteLists = Array.isArray(response?.lists) ? response.lists : []
    const normalizedRemote = remoteLists.map(mapRemoteList)
    const remoteVersion = parseRemoteVersion(response?.updated_at) || computeVersion(normalizedRemote)
    const localSnapshot = $state.snapshot(state.lists)
    const localVersion = computeVersion(localSnapshot)
    state.remoteVersion = remoteVersion

    if (remoteVersion > localVersion) {
      const signature = buildSignature(normalizedRemote)
      state.lastSyncedSignature = signature
      state.remoteVersion = remoteVersion
      state.lastSyncSuccess = true
      state.localOnly = false
      state.syncError = null
      await storage.setLists(normalizedRemote)
      state.lastSyncedAt = Date.now()
       state.syncPhase = SYNC_PHASES.SYNCED
       logSyncEvent('hydrate_success', {
         action: 'downloaded',
         remoteLists: normalizedRemote.length,
         localLists: localSnapshot.length,
         remoteVersion,
         localVersion,
       })
    } else if (localVersion > remoteVersion && localSnapshot.length) {
      state.localOnly = true
      state.syncPhase = SYNC_PHASES.LOCAL_ONLY
      logSyncEvent('hydrate_success', {
        action: 'upload_scheduled',
        remoteLists: normalizedRemote.length,
        localLists: localSnapshot.length,
        remoteVersion,
        localVersion,
      })
      scheduleSync('remote-behind', { immediate: true, listsOverride: localSnapshot, signatureOverride: buildSignature(localSnapshot) })
    } else {
      state.localOnly = false
      state.syncPhase = SYNC_PHASES.SYNCED
      logSyncEvent('hydrate_success', {
        action: 'unchanged',
        remoteLists: normalizedRemote.length,
        localLists: localSnapshot.length,
        remoteVersion,
        localVersion,
      })
    }
  } catch (error) {
    const normalized = normalizeSyncError(error)
    state.syncPhase = normalized.phase
    state.syncError = normalized
    state.lastSyncSuccess = false
    state.localOnly = true
    logSyncEvent('hydrate_failed', {
      code: normalized.code,
      phase: normalized.phase,
      message: normalized.message,
    })
    console.error('[SquirrlTab] Failed to hydrate remote state:', error)
  } finally {
    state.syncing = false
  }
}

const initStore = async (retries = 3) => {
  let shouldFinalize = true
  try {
    const data = await browser.storage.local.get(['lists', 'opts'])
    state.lists = Array.isArray(data.lists) ? data.lists : []
    state.opts = data.opts || {}
    state.lastSyncedSignature = buildSignature(state.lists)
    state.remoteVersion = computeVersion(state.lists)
    state.lastSyncSuccess = null
    state.localOnly = false
    state.syncError = null
    state.syncPhase = SYNC_PHASES.IDLE
  } catch (error) {
    console.error('[SquirrlTab] Failed to initialize store:', error)
    if (retries > 0) {
      shouldFinalize = false
      setTimeout(() => initStore(retries - 1), 500)
      return
    }
    state.lists = []
    state.opts = {}
    state.lastSyncSuccess = false
    state.localOnly = true
    state.syncPhase = SYNC_PHASES.LOCAL_ONLY
  } finally {
    if (shouldFinalize) {
      state.initialized = true
      hydrateFromRemote()
    }
  }
}

initStore()

browser.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return
  if (changes.lists) {
    const newLists = changes.lists.newValue
    state.lists = Array.isArray(newLists) ? newLists : []
    console.log('[SquirrlTab] Lists updated from storage:', state.lists.length)
  }
  if (changes.opts) {
    state.opts = changes.opts.newValue || {}
    console.log('[SquirrlTab] Options updated from storage')
  }
})

$effect.root(() => {
  $effect(() => {
    if (!state.initialized) return
    const snapshot = $state.snapshot(state.lists)
    const signature = buildSignature(snapshot)
    scheduleSync('change', { listsOverride: snapshot, signatureOverride: signature })
  })
})

export const syncStore = {
  get lists() {
    return state.lists
  },
  get opts() {
    return state.opts
  },
  get aiLoading() {
    return state.aiLoading
  },
  get syncing() {
    return state.syncing
  },
  get snackbar() {
    return state.snackbar
  },
  get initialized() {
    return state.initialized
  },
  get lastSyncSuccess() {
    return state.lastSyncSuccess
  },
  get syncStatus() {
    return {
      phase: state.syncPhase,
      syncing: state.syncing,
      error: state.syncError,
      lastSyncedAt: state.lastSyncedAt,
      localOnly: state.localOnly,
      pendingRetry: Boolean(state.pendingRetry),
      lastSyncSuccess: state.lastSyncSuccess,
    }
  },
  updateSnackbar(payload) {
    if (typeof payload === 'string') {
      state.snackbar = { status: true, msg: payload }
    } else {
      state.snackbar = payload
    }
  },
  get pinnedLists() {
    return state.lists.filter(list => list.pinned)
  },
  get taggedLists() {
    const tagged = {}
    state.lists.forEach(list => {
      (list.tags || []).forEach(tag => {
        if (!tagged[tag]) tagged[tag] = []
        tagged[tag].push(list)
      })
    })
    return tagged
  },
  async categorizeList(listId) {
    const list = state.lists.find(l => l._id === listId)
    if (!list) return

    state.aiLoading = list._id
    try {
      const result = await CustomSync.AI.categorize(list.tabs)
      if (result.category) {
        manager.updateListById(list._id, { category: result.category })
      }
      if (result.tags) {
        manager.updateListById(list._id, { tags: result.tags })
      }
      return result
    } catch (error) {
      console.error('[SquirrlTab] Categorization failed:', error)
      throw error
    } finally {
      state.aiLoading = null
    }
  },
  async restoreList(listId, inNewWindow = false) {
    const list = state.lists.find(l => l._id === listId)
    if (!list) {
      console.warn('[SquirrlTab] Cannot restore list: not found', listId)
      return false
    }
    try {
      if (inNewWindow) await tabsHelper.restoreListInNewWindow(list)
      else await tabsHelper.restoreTabs(list.tabs)
      if (!list.pinned) {
        await manager.removeListById(listId)
      }
      return true
    } catch (error) {
      console.error('[SquirrlTab] Failed to restore list:', error)
      throw error
    }
  },
  updateList(listId, updates) {
    manager.updateListById(listId, updates)
  },
  removeList(listId) {
    manager.removeListById(listId)
  },
  pinList(listId, pinned) {
    manager.updateListById(listId, { pinned })
  },
  changeColor(listId, color) {
    manager.updateListById(listId, { color })
  },
  manualRetry() {
    const hadPending = Boolean(state.pendingRetry)
    logSyncEvent('manual_retry', { hadPending })
    if (state.pendingRetry) {
      if (retryTimer) {
        clearTimeout(retryTimer)
        retryTimer = null
      }
      const payload = state.pendingRetry
      state.pendingRetry = null
      pushStateToServer(payload)
      return
    }
    const snapshot = $state.snapshot(state.lists)
    scheduleSync('manual-retry', {
      immediate: true,
      listsOverride: snapshot,
      signatureOverride: buildSignature(snapshot),
      force: true,
    })
  },
  async cleanAll() {
    const ids = state.lists.map(l => l._id)
    for (const id of ids) {
      manager.removeListById(id)
    }
  },
  async stashCurrentTab() {
    try {
      await tabsHelper.storeCurrentTab()
      this.updateSnackbar('Current tab stashed')
      return true
    } catch (error) {
      console.error('[SquirrlTab] Failed to stash current tab:', error)
      this.updateSnackbar('Unable to stash current tab')
      throw error
    }
  },
}
