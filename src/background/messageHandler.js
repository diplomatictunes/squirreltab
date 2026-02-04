import tabs from '../common/tabs'
import storage from '../common/storage'
import { sendMessage } from '../common/utils'
import listManager from '../common/listManager'
import { setupContextMenus } from './contextMenus'
import { updateBrowserAction } from './browserAction'
import { ILLEGAL_URLS, RUNTIME_MESSAGES } from '../common/constants'
const getExtensionUrlPrefix = () => chrome.runtime.getURL('')

const isBlockedStashTarget = url => {
  if (!url) return true
  const extensionUrl = getExtensionUrlPrefix()
  if (url.startsWith(extensionUrl)) return true
  return ILLEGAL_URLS.some(prefix => url.startsWith(prefix))
}

const emitStashEvent = (type, payload) => {
  return chrome.runtime.sendMessage({
    type,
    payload,
  }).catch(() => {
    // It's fine if no UI is listening.
  })
}

const handleStashCurrentTabIntent = async (source = 'app') => {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!activeTab || !activeTab.id) {
      throw new Error('NO_ACTIVE_TAB')
    }
    if (isBlockedStashTarget(activeTab.url)) {
      throw new Error('BLOCKED_URL')
    }
    await tabs.storeCurrentTab()
    await emitStashEvent(RUNTIME_MESSAGES.STASH_COMPLETED, {
      source,
      tabId: activeTab.id,
      title: activeTab.title,
      url: activeTab.url,
    })
  } catch (error) {
    await emitStashEvent(RUNTIME_MESSAGES.STASH_FAILED, {
      source,
      reason: error.message || 'UNKNOWN',
    })
    console.error('[SquirrlTab] Failed to stash current tab intent:', error)
  }
}

const messageHandler = async msg => {
  if (!msg) return

  if (msg.type === "REQUEST_SAVE_TAB") {
    await tabs.storeCurrentTab()

    chrome.runtime.sendMessage({
      type: "LISTS_UPDATED",
    })

    return
  }


  if (msg.type === RUNTIME_MESSAGES.STASH_COMPLETED || msg.type === RUNTIME_MESSAGES.STASH_FAILED) {
    return
  }
  if (msg.type === RUNTIME_MESSAGES.STASH_CURRENT_TAB) {
    const source = msg.payload?.source || 'app'
    handleStashCurrentTabIntent(source)
    return
  }
  console.debug('received', msg)
  if (msg.optionsChanged) {
    const changes = msg.optionsChanged
    console.debug('options changed', changes)

    const latestOpts = await storage.getOptions()
    Object.assign(latestOpts, changes)
    await storage.setOptions(latestOpts)

    if (changes.browserAction) updateBrowserAction(changes.browserAction)
    if (['pageContext', 'allContext', 'disableDynamicMenu'].some(k => k in changes)) {
      await setupContextMenus(latestOpts)
    }
    await sendMessage({ optionsChangeHandledStatus: 'success' })
  }
  if (msg.restoreList) {
    const { restoreList } = msg
    const listIndex = restoreList.index
    const lists = await storage.getLists()
    const list = lists[listIndex]
    if (restoreList.newWindow) {
      tabs.restoreListInNewWindow(list)
    } else {
      tabs.restoreList(list)
    }
    if (!list.pinned) {
      listManager.removeListById(list._id)
    }
  }
  if (msg.storeInto) {
    tabs.storeSelectedTabs(msg.storeInto.index)
  }
    if (msg.import) {
    const { lists } = msg.import
    lists.forEach(list => listManager.addList(list))

    chrome.runtime.sendMessage({
      type: "LISTS_UPDATED",
    })
    return
  }
}
export default messageHandler
