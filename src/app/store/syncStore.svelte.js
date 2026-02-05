import browser from 'webextension-polyfill'
import CustomSync, { SyncError } from '@/common/service/custom-sync'
import storage from '@/common/storage'
import { createNewTabList } from '@/common/list'
import { SYNC_PHASES, RUNTIME_MESSAGES } from '@/common/constants'
import { logSyncEvent } from '@/common/sync-logger'
import tabsHelper from '@/common/tabs'
import manager from './bridge'
import _ from 'lodash'
import { filterTabsForPrivacy } from '@/common/aiPrivacy'

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
let autoSyncTimer = null

const isAutoSyncEnabled = opts => opts?.autoSyncEnabled !== false
const getAutoSyncIntervalMs = opts => {
  const intervalSeconds = Number(opts?.autoSyncInterval)
  if (!Number.isFinite(intervalSeconds) || intervalSeconds <= 0) return null
  return intervalSeconds * 1000
}

const clearAutoSyncTimer = () => {
  if (!autoSyncTimer) return
  clearInterval(autoSyncTimer)
  autoSyncTimer = null
}

const setupAutoSyncTimer = () => {
  clearAutoSyncTimer()
  if (!isAutoSyncEnabled(state.opts)) return
  const intervalMs = getAutoSyncIntervalMs(state.opts)
  if (!intervalMs) return
  autoSyncTimer = setInterval(() => {
    if (!state.initialized) return
    scheduleSync('auto-interval')
  }, intervalMs)
}

let state = $state({
  lists: [],
  opts: {},
  aiLoading: null,
  syncing: false,
  snackbar: { status: false, msg: '', type: 'info' }, // Added type
  initialized: false,
  lastSyncSuccess: null,
  syncPhase: SYNC_PHASES.NEVER_SYNCED,
  syncError: null,
  localOnly: false,
  lastSyncedAt: null,
  lastSyncedSignature: '',
  remoteVersion: 0,
  pendingRetry: null,
  duplicateIndex: {},
})

const EMPTY_DUPLICATE_META = Object.freeze({ hasDuplicates: false, count: 0 })

const buildDuplicateIndex = lists => {
  if (!Array.isArray(lists) || lists.length === 0) return {}
  const urlOwners = new Map()
  lists.forEach(list => {
    if (!list || !Array.isArray(list.tabs)) return
    const seenUrls = new Set()
    list.tabs.forEach(tab => {
      const url = tab?.url
      if (!url || seenUrls.has(url)) return
      seenUrls.add(url)
      if (!urlOwners.has(url)) urlOwners.set(url, new Set())
      urlOwners.get(url).add(list._id)
    })
  })
  const duplicateIndex = {}
  lists.forEach(list => {
    if (!list || !Array.isArray(list.tabs)) return
    let count = 0
    const countedUrls = new Set()
    list.tabs.forEach(tab => {
      const url = tab?.url
      if (!url || countedUrls.has(url)) return
      countedUrls.add(url)
      const owners = urlOwners.get(url)
      if (owners && owners.size > 1) {
        count += 1
      }
    })
    duplicateIndex[list._id] = {
      hasDuplicates: count > 0,
      count,
    }
  })
  return duplicateIndex
}

const REFLECTIVE_PHASES = new Set([
  SYNC_PHASES.SYNCED,
  SYNC_PHASES.LOCAL_ONLY,
  SYNC_PHASES.IDLE,
  SYNC_PHASES.NEVER_SYNCED,
])

const reconcileLocalTruth = ({ remoteVersionOverride } = {}) => {
  const resolvedRemoteVersion = typeof remoteVersionOverride === 'number'
    ? remoteVersionOverride
    : computeVersion(state.lists)
  state.remoteVersion = resolvedRemoteVersion
  const signature = buildSignature(state.lists)
  if (!state.initialized) {
    state.duplicateIndex = buildDuplicateIndex(state.lists)
    return { signature, inSync: false }
  }
  const inSync = signature === state.lastSyncedSignature
  state.localOnly = !inSync
  if (!state.syncing && !state.pendingRetry && REFLECTIVE_PHASES.has(state.syncPhase)) {
    state.syncPhase = inSync ? SYNC_PHASES.SYNCED : SYNC_PHASES.LOCAL_ONLY
  }
  state.duplicateIndex = buildDuplicateIndex(state.lists)
  return { signature, inSync }
}

const finalizeSignatureAlignment = ({ remoteVersionOverride } = {}) => {
  const { inSync } = reconcileLocalTruth({ remoteVersionOverride })
  if (state.initialized && inSync) {
    state.lastSyncedAt = Date.now()
    state.lastSyncSuccess = true
  }
}

const removeListSafely = async listId => {
  try {
    await manager.removeListById(listId)
    return true
  } catch (error) {
    console.error('[SquirrlTab] Failed to remove list:', error)
    state.snackbar = { status: true, msg: 'Unable to delete stash', type: 'error' }
    return false
  }
}

const waitForNextTick = () => new Promise(resolve => {
  if (typeof queueMicrotask === 'function') queueMicrotask(resolve)
  else setTimeout(resolve, 0)
})

const normalizeTagValue = tag => {
  if (typeof tag !== 'string') return ''
  const trimmed = tag.trim()
  if (!trimmed) return ''
  return trimmed.length > 120 ? trimmed.slice(0, 120) : trimmed
}

const removeSuggestedTag = (list, tagValue) => {
  if (!list || !Array.isArray(list.aiSuggestedTags)) return []
  return list.aiSuggestedTags.filter(tag => tag !== tagValue)
}

// MV3 popups cold-start before background writes settle. A post-listener re-read
// keeps initialized=false until we confirm storage reflects the latest lists.
const confirmLocalListsHydrated = async baselineSignature => {
  await waitForNextTick()
  const latest = await browser.storage.local.get('lists')
  const latestLists = Array.isArray(latest.lists) ? latest.lists : []
  const latestSignature = buildSignature(latestLists)
  if (latestSignature !== baselineSignature) {
    state.lists = latestLists
    state.lastSyncedSignature = latestSignature
    reconcileLocalTruth()
  }
}

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
    state.syncPhase = SYNC_PHASES.SYNCED
    state.syncError = null
    state.localOnly = false
    state.pendingRetry = null
    pendingPayload = null
    state.lastSyncedSignature = payload.signature
    finalizeSignatureAlignment({ remoteVersionOverride: remoteVersion })
    browser.storage.local.set({ lastSyncedSignature: payload.signature }) // Persist signature
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
    state.snackbar = { status: true, msg: normalized.message, type: 'error' } // Notify error
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
  if (!force && !isAutoSyncEnabled(state.opts)) return
  const lists = listsOverride || $state.snapshot(state.lists)
  const signature = signatureOverride || buildSignature(lists)
  if (!force && signature === state.lastSyncedSignature) return
  pendingPayload = { lists, signature, reason }
  // FIX (Bug 2): Only mark as LOCAL_ONLY if we are not already in an
  // in-flight or error state.  The badge will flip to SYNCING as soon as
  // pushStateToServer actually runs, so we only need a brief LOCAL_ONLY
  // window when transitioning from a stable state.
  if ([SYNC_PHASES.SYNCED, SYNC_PHASES.IDLE, SYNC_PHASES.NEVER_SYNCED].includes(state.syncPhase)) {
    state.localOnly = true
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
  if (!isAutoSyncEnabled(state.opts)) return
  state.syncing = true
  state.syncPhase = SYNC_PHASES.SYNCING
  logSyncEvent('hydrate_started')
  try {
    const response = await CustomSync.download()
    const remoteLists = Array.isArray(response?.lists) ? response.lists : []
    const normalizedRemote = remoteLists.map(mapRemoteList)
    const remoteVersion = parseRemoteVersion(response?.updated_at) || computeVersion(normalizedRemote)
    state.remoteVersion = remoteVersion

    // FIX (Bug 1): Re-read local storage RIGHT NOW instead of relying on
    // the snapshot that was taken before the network round-trip.  A stash
    // operation (or any other write) may have completed while we were
    // waiting for the server to respond.  Using a stale snapshot here would
    // cause us to clobber freshly-stashed tabs with the (older) remote set.
    const freshLocalData = await browser.storage.local.get('lists')
    const localSnapshot = Array.isArray(freshLocalData.lists) ? freshLocalData.lists : []
    const localVersion = computeVersion(localSnapshot)

    if (remoteVersion > localVersion) {
      const signature = buildSignature(normalizedRemote)
      state.lastSyncedSignature = signature
      state.lastSyncSuccess = true
      await storage.setLists(normalizedRemote)
      console.log('[hydrate] setting lists:', normalizedRemote.length)
      state.lists = normalizedRemote
      finalizeSignatureAlignment({ remoteVersionOverride: remoteVersion })
      state.localOnly = false
      state.syncPhase = SYNC_PHASES.SYNCED
      browser.storage.local.set({ lastSyncedSignature: signature }) // Persist signature
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
      scheduleSync('remote-behind', { immediate: true, listsOverride: localSnapshot, signatureOverride: buildSignature(localSnapshot), force: true })
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

    // FORCE LOCAL DATA TO PERSIST
    // This prevents the UI from clearing or hiding the lists 
    // just because the server at localhost:8000 is down.
    if (state.lists.length === 0) {
      const data = await browser.storage.local.get('lists')
      state.lists = Array.isArray(data.lists) ? data.lists : []
      reconcileLocalTruth()
    }

    state.snackbar = { status: true, msg: normalized.message, type: 'error' } // Notify error
    logSyncEvent('hydrate_failed', {
      code: normalized.code,
      phase: normalized.phase,
      message: normalized.message,
    })
    console.error('[SquirrlTab] Failed to hydrate remote state:', error)
  } finally {
    state.syncing = false
    // Ensure initialized is true so the UI knows it's okay to render
    state.initialized = true
  }
}

const initStore = async (retries = 3) => {
  let shouldFinalize = true
  let baselineSignature = ''
  try {
    const data = await browser.storage.local.get(['lists', 'opts', 'lastSyncedSignature'])
    state.lists = Array.isArray(data.lists) ? data.lists : []
    state.opts = data.opts || {}
    state.lastSyncedSignature = data.lastSyncedSignature || '' // Load persisted signature
    baselineSignature = buildSignature(state.lists)
    state.remoteVersion = computeVersion(state.lists)
    state.lastSyncSuccess = null
    state.localOnly = false
    state.syncError = null

    if (isAutoSyncEnabled(state.opts)) {
      if (state.lastSyncedSignature === baselineSignature) {
        state.syncPhase = SYNC_PHASES.SYNCED
      } else {
        state.syncPhase = SYNC_PHASES.LOCAL_ONLY
        state.localOnly = true
      }
    } else {
      state.syncPhase = SYNC_PHASES.NEVER_SYNCED
    }
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
    state.lastSyncedSignature = buildSignature(state.lists)
    baselineSignature = state.lastSyncedSignature
  } finally {
    if (shouldFinalize) {
      if (!baselineSignature) {
        baselineSignature = buildSignature(state.lists)
        state.lastSyncedSignature = baselineSignature
      }
      await confirmLocalListsHydrated(baselineSignature)
      state.initialized = true
      reconcileLocalTruth()
      setupAutoSyncTimer()
      if (isAutoSyncEnabled(state.opts)) {
        hydrateFromRemote()
      }
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
    reconcileLocalTruth()
  }
  if (changes.opts) {
    state.opts = changes.opts.newValue || {}
    console.log('[SquirrlTab] Options updated from storage')
    setupAutoSyncTimer()
  }
  if (changes.lastSyncedSignature) {
    state.lastSyncedSignature = changes.lastSyncedSignature.newValue || ''
    finalizeSignatureAlignment()
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
  get duplicates() {
    return state.duplicateIndex
  },
  getDuplicateMeta(listId) {
    return state.duplicateIndex[listId] || EMPTY_DUPLICATE_META
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
  updateSnackbar(payload, type = 'info') {
    if (typeof payload === 'string') {
      state.snackbar = { status: true, msg: payload, type }
    } else {
      state.snackbar = { ...payload, type: payload.type || 'info' }
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
      const privacy = filterTabsForPrivacy(list.tabs, state.opts?.aiExcludedDomains)
      if (privacy.totalCount > 0 && privacy.allowedCount === 0) {
        state.snackbar = {
          status: true,
          msg: 'AI disabled: all tabs excluded for privacy',
          type: 'info',
        }
        return null
      }
      if (privacy.totalCount === 0) {
        state.snackbar = {
          status: true,
          msg: 'AI unavailable: stash has no tabs',
          type: 'info',
        }
        return null
      }
      const result = await CustomSync.AI.categorize(privacy.allowedTabs)
      if (result.category) {
        manager.updateListById(list._id, { category: result.category })
      }
      if (result.tags) {
        manager.updateListById(list._id, { tags: result.tags })
      }
      return {
        ...result,
        privacyMeta: {
          allowedCount: privacy.allowedCount,
          excludedCount: privacy.excludedCount,
          totalCount: privacy.totalCount,
        },
      }
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
      state.snackbar = { status: true, msg: 'Failed to restore tabs', type: 'error' }
      return false
    }
  },
  updateList(listId, updates) {
    manager.updateListById(listId, updates)
  },
  async acceptAiSuggestion(listId) {
    const list = state.lists.find(l => l._id === listId)
    if (!list?.aiSuggestedTitle) return false
    try {
      const hasRemainingTags = Array.isArray(list.aiSuggestedTags) && list.aiSuggestedTags.length > 0
      await manager.updateListById(listId, {
        title: list.aiSuggestedTitle,
        aiSuggestedTitle: '',
        aiSuggestionMeta: hasRemainingTags ? list.aiSuggestionMeta : null,
      })
      state.snackbar = { status: true, msg: 'AI suggestion applied', type: 'success' }
      return true
    } catch (error) {
      console.error('[SquirrlTab] Failed to accept AI suggestion:', error)
      state.snackbar = { status: true, msg: 'Unable to apply suggestion', type: 'error' }
      return false
    }
  },
  async rejectAiSuggestion(listId) {
    const list = state.lists.find(l => l._id === listId)
    if (!list?.aiSuggestedTitle) return false
    try {
      const hasRemainingTags = Array.isArray(list.aiSuggestedTags) && list.aiSuggestedTags.length > 0
      await manager.updateListById(listId, {
        aiSuggestedTitle: '',
        aiSuggestionMeta: hasRemainingTags ? list.aiSuggestionMeta : null,
      })
      return true
    } catch (error) {
      console.error('[SquirrlTab] Failed to reject AI suggestion:', error)
      state.snackbar = { status: true, msg: 'Unable to dismiss suggestion', type: 'error' }
      return false
    }
  },
  async acceptSuggestedTag(listId, tagValue) {
    const normalizedTag = normalizeTagValue(tagValue)
    if (!normalizedTag) return false
    const list = state.lists.find(l => l._id === listId)
    if (!list) return false
    try {
      const existing = Array.isArray(list.tags) ? list.tags : []
      const merged = Array.from(new Set([...existing, normalizedTag]))
      const remainingSuggestions = removeSuggestedTag(list, normalizedTag)
      const shouldKeepMeta = remainingSuggestions.length > 0 || (list.aiSuggestedTitle && list.aiSuggestedTitle.length > 0)
      await manager.updateListById(listId, {
        tags: merged,
        aiSuggestedTags: remainingSuggestions,
        aiSuggestionMeta: shouldKeepMeta ? list.aiSuggestionMeta : null,
      })
      state.snackbar = { status: true, msg: `Tag "${normalizedTag}" added`, type: 'success' }
      return true
    } catch (error) {
      console.error('[SquirrlTab] Failed to accept tag suggestion:', error)
      state.snackbar = { status: true, msg: 'Unable to add suggested tag', type: 'error' }
      return false
    }
  },
  async rejectSuggestedTag(listId, tagValue) {
    const normalizedTag = normalizeTagValue(tagValue)
    if (!normalizedTag) return false
    const list = state.lists.find(l => l._id === listId)
    if (!list?.aiSuggestedTags?.length) return false
    try {
      const remaining = removeSuggestedTag(list, normalizedTag)
      const shouldKeepMeta = remaining.length > 0 || (list.aiSuggestedTitle && list.aiSuggestedTitle.length > 0)
      await manager.updateListById(listId, {
        aiSuggestedTags: remaining,
        aiSuggestionMeta: shouldKeepMeta ? list.aiSuggestionMeta : null,
      })
      return true
    } catch (error) {
      console.error('[SquirrlTab] Failed to reject tag suggestion:', error)
      state.snackbar = { status: true, msg: 'Unable to dismiss tag suggestion', type: 'error' }
      return false
    }
  },
  async removeList(listId) {
    return removeListSafely(listId)
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
      const removed = await removeListSafely(id)
      if (!removed) break
    }
  },
}

browser.runtime.onMessage.addListener(message => {
  if (!message || !message.type) return
  if (message.type === RUNTIME_MESSAGES.STASH_COMPLETED) {
    syncStore.updateSnackbar('Current tab stashed', 'success')
  }
  if (message.type === RUNTIME_MESSAGES.STASH_FAILED) {
    const reason = message.payload?.reason
    const msg = reason === 'BLOCKED_URL'
      ? 'Cannot stash the SquirrlTab app itself'
      : 'Unable to stash current tab'
    syncStore.updateSnackbar(msg, 'error')
  }
})
