import __ from '../common/i18n'
import options from '../common/options'
import tabs from '../common/tabs'

const MENU_ID_SAVE_TAB = 'send-to-tabsquirrel'

const chromeMenus = () => chrome?.contextMenus

const promisify = fn => new Promise(resolve => {
  try {
    fn(() => {
      // Intentionally swallow lastError to avoid crashing init flow.
      if (chrome.runtime?.lastError) {
        console.debug('[contextMenus] API warning:', chrome.runtime.lastError.message)
      }
      resolve()
    })
  } catch (error) {
    console.error('[contextMenus] API call failed:', error)
    resolve()
  }
})

const removeAllMenus = () => {
  const menus = chromeMenus()
  if (!menus) return Promise.resolve()
  return promisify(callback => menus.removeAll(callback))
}

const createMenuItem = details => {
  const menus = chromeMenus()
  if (!menus) return Promise.resolve()
  return promisify(callback => menus.create(details, callback))
}

const updateMenuEnabled = (id, enabled) => {
  const menus = chromeMenus()
  if (!menus) return Promise.resolve()
  return promisify(callback => menus.update(id, { enabled }, callback))
}

const resolveTab = async (tabFromEvent, info) => {
  if (tabFromEvent && tabFromEvent.id) return tabFromEvent
  if (!info?.tabId) return null
  try {
    return await chrome.tabs.get(info.tabId)
  } catch (error) {
    console.warn('[contextMenus] Unable to resolve tab from event:', error)
    return null
  }
}

export const handleContextMenuClicked = async (info, tab) => {
  if (info.menuItemId !== MENU_ID_SAVE_TAB) return
  const targetTab = await resolveTab(tab, info)
  if (!targetTab) return
  try {
    await tabs.storeCurrentTab(targetTab, 'context-menu')
  } catch (error) {
    console.error('[contextMenus] Failed to save tab from context menu:', error)
  }
}

export const dynamicDisableMenu = async () => {
  const menus = chromeMenus()
  if (!menus) return
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const enabled = Boolean(activeTab?.url && !activeTab.url.startsWith('chrome://') && !activeTab.url.startsWith('about:'))
    await updateMenuEnabled(MENU_ID_SAVE_TAB, enabled)
  } catch (error) {
    console.warn('[contextMenus] Unable to evaluate dynamic state:', error)
  }
}

export const setupContextMenus = async (opts = null) => {
  const menus = chromeMenus()
  if (!menus) {
    console.warn('[contextMenus] API unavailable; skipping setup')
    return
  }

  const defaultOptions = options.getDefaultOptions()
  const effectiveOpts = Object.assign({}, defaultOptions, opts || {})

  await removeAllMenus()

  if (!effectiveOpts.pageContext) return

  const contexts = effectiveOpts.allContext ? ['all'] : ['page']
  const title = __('menu_SAVE_TAB_TO_SPINE') || 'Save tab to IceTab'

  await createMenuItem({
    id: MENU_ID_SAVE_TAB,
    title,
    contexts,
  })

  await dynamicDisableMenu()
}

export default {
  setupContextMenus,
  dynamicDisableMenu,
  handleContextMenuClicked,
}
