import __ from '../common/i18n'

const installedEventHandler = detail => {
  if (DEBUG) return
  if (detail.reason === chrome.runtime.OnInstalledReason.UPDATE) {
    const updatedNotificationId = 'updated'
    chrome.notifications.onClicked.addListener(id => {
      if (id === updatedNotificationId) {
        chrome.tabs.create({ url: 'https://github.com/elijahcommits/icetab/blob/master/CHANGELOG.md' })
      }
    })
    chrome.notifications.create(updatedNotificationId, {
      type: 'basic',
      iconUrl: 'assets/icons/icon128.png',
      title: __('ui_updated_to_ver') + ' v' + chrome.runtime.getManifest().version,
      message: __('ui_click_view_changelog'),
    })
    setTimeout(() => {
      chrome.notifications.clear(updatedNotificationId)
    }, 5000)
  }
}

export default installedEventHandler
