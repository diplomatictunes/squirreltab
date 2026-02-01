import storage from './storage'
import {createNewTabList} from './list'
import listManager from './listManager'
import {ILLEGAL_URLS} from './constants'


const getAllInWindow = windowId => chrome.tabs.query({windowId})

const APP_TAB_ID_KEY = 'appTabIds' // Define a key for storing app tab IDs in storage

const openTabLists = async () => {
  const currentWindow = await chrome.windows.getCurrent()
  const windowId = currentWindow.id
  const tabListsUrl = chrome.runtime.getURL('index.html#/app/')

  // Retrieve stored appTabIds from local storage
  const storedData = await chrome.storage.local.get(APP_TAB_ID_KEY)
  const appTabIds = storedData[APP_TAB_ID_KEY] || {}

  if (windowId in appTabIds) {
    const tabs = await getAllInWindow(windowId)
    const tab = tabs.find(t => t.id === appTabIds[windowId])
    if (tab && tab.url.startsWith(tabListsUrl)) {
      // If the tab exists and is the correct URL, activate it
      return chrome.tabs.update(tab.id, { active: true })
    }
    // If tab doesn't exist or URL is wrong, remove it from tracking
    delete appTabIds[windowId]
    await chrome.storage.local.set({ [APP_TAB_ID_KEY]: appTabIds })
  }

  // Create a new tab and store its ID
  const createdTab = await chrome.tabs.create({ url: tabListsUrl })
  appTabIds[windowId] = createdTab.id
  await chrome.storage.local.set({ [APP_TAB_ID_KEY]: appTabIds })
}

const openAboutPage = () => {
  window.open(chrome.runtime.getURL('index.html#/app/about'))
}

const getSelectedTabs = () => chrome.tabs.query({highlighted: true, currentWindow: true})

const getAllTabsInCurrentWindow = async () => {
  const currentWindow = await chrome.windows.getCurrent()
  return getAllInWindow(currentWindow.id)
}

const groupTabsInCurrentWindow = async () => {
  const tabs = await getAllTabsInCurrentWindow()
  const result = { left: [], right: [], inter: [], all: tabs }
  let currentIsRight = false
  for (const tab of tabs) {
    if (tab.highlighted) {
      currentIsRight = true
      result.inter.push(tab)
    } else if (currentIsRight) result.right.push(tab)
    else result.left.push(tab)
  }
  result.twoSide = result.left.concat(result.right)
  return result
}

const isLegalURL = url => ILLEGAL_URLS.every(prefix => !url.startsWith(prefix))
const storeTabs = async (tabs, listIndex) => {
  const appUrl = chrome.runtime.getURL('')
  tabs = tabs.filter(i => !i.url.startsWith(appUrl))

  const opts = await storage.getOptions()
  if (opts.ignorePinned) tabs = tabs.filter(i => !i.pinned)
  if (opts.excludeIllegalURL) tabs = tabs.filter(i => isLegalURL(i.url))
  if (tabs.length === 0) return

  // 🔹 always start from persisted state
  const lists = await storage.getLists()

  if (listIndex == null) {
    const newList = createNewTabList({ tabs })
    if (opts.pinNewList) newList.pinned = true
    lists.unshift(newList)
  } else {
    const list = lists[listIndex]
    tabs.forEach(tab => list.tabs.push(tab))
  }

  // 🔴 THIS is the critical line
  await storage.setLists(lists)

  return chrome.tabs.remove(tabs.map(i => i.id))
}
const storeCurrentTab = async listIndex => {
  const tabs = await chrome.tabs.query({active: true, currentWindow: true})
  if (!tabs || tabs.length === 0) throw new Error('No active tab to stash')
  return storeTabs(tabs, listIndex)
}

const storeLeftTabs = async listIndex => storeTabs((await groupTabsInCurrentWindow()).left, listIndex)
const storeRightTabs = async listIndex => storeTabs((await groupTabsInCurrentWindow()).right, listIndex)
const storeTwoSideTabs = async listIndex => storeTabs((await groupTabsInCurrentWindow()).twoSide, listIndex)

const storeSelectedTabs = async listIndex => {
  const tabs = await getSelectedTabs()
  const allTabs = await getAllTabsInCurrentWindow()
  if (tabs.length === allTabs.length) await openTabLists()
  return storeTabs(tabs, listIndex)
}

const storeAllTabs = async listIndex => {
  const tabs = await getAllTabsInCurrentWindow()
  const opts = await storage.getOptions()
  if (opts.openTabListNoTab) await openTabLists()
  return storeTabs(tabs, listIndex)
}

const storeAllTabInAllWindows = async () => {
  const windows = await chrome.windows.getAll()
  const opts = await storage.getOptions()
  if (opts.openTabListNoTab) await openTabLists()
  const tasks = []
  for (const window of windows) {
    const task = getAllInWindow(window.id).then(storeTabs)
    tasks.push(task)
  }
  return Promise.all(tasks)
}

const restoreTabs = async (tabs, windowId) => {
  const opts = await storage.getOptions()
  let indexOffset = 0
  if (opts.openEnd) {
    const tabs = await getAllTabsInCurrentWindow()
    const {index} = tabs.pop()
    indexOffset = index + 1
  }
  for (let i = 0; i < tabs.length; i += 1) {
    const tab = tabs[i]
    const createdTab = await chrome.tabs.create({
      url: tab.url,
      pinned: tab.pinned,
      index: i + indexOffset,
      windowId,
    })
    if (tab.muted) chrome.tabs.update(createdTab.id, {muted: true})
  }
}

const restoreList = (list, windowId) => restoreTabs(list.tabs, windowId)

const restoreListInNewWindow = async list => {
  const createdWindow = await chrome.windows.create({url: list.tabs.map(i => i.url)})
  list.tabs.forEach((tab, index) => {
    if (tab.muted) chrome.tabs.update(createdWindow.tabs[index].id, {muted: true})
  })
}

const restoreLastestList = async () => {
  const lists = await storage.getLists()
  if (lists.length === 0) return true
  const [lastest] = lists
  await restoreList(lastest)
  if (lastest.pinned) return true
  return listManager.removeListById(lastest._id)
}

export default {
  getSelectedTabs,
  groupTabsInCurrentWindow,
  storeLeftTabs,
  storeRightTabs,
  storeSelectedTabs,
  storeTwoSideTabs,
  storeAllTabs,
  storeAllTabInAllWindows,
  storeCurrentTab,
  restoreTabs,
  restoreList,
  restoreListInNewWindow,
  restoreLastestList,
  openTabLists,
  openAboutPage,
}
