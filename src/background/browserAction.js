import tabs from '../common/tabs'

export const updateBrowserAction = async (action) => {
  if (action && action !== 'popup') {
    await chrome.action.setPopup({ popup: '' })
  } else {
    await chrome.action.setPopup({ popup: 'index.html?context=popup' })
  }
}

export const getBrowserActionHandler = (action) => {
  const handlers = {
    'store-selected': tabs.storeSelectedTabs,
    'store-all': tabs.storeAllTabs,
    'show-list': tabs.openlists,
  }
  return handlers[action] || null
}

export const getCoverBrowserAction = () => { }