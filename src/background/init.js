/* eslint-disable */
import _ from 'lodash'
import tabs from '../common/tabs'
import options from '../common/options'
import storage from '../common/storage'
import migrate from '../common/migrate'
import { normalizeList } from '../common/list'
import commandHandler from './commandHandler'
import messageHandler from './messageHandler'
import listManager from '../common/listManager'
import { setupContextMenus, dynamicDisableMenu, handleContextMenuClicked } from './contextMenus'
import installedEventHandler from './installedEventHandler'
import { updateBrowserAction, getBrowserActionHandler, getCoverBrowserAction } from './browserAction'


// Global variables for the service worker context
let opts_global = {};
let updateVersion_global = null;

const initOptions = async () => {
  const opts = await storage.getOptions() || {}
  const defaultOptions = options.getDefaultOptions()

  if (_.keys(defaultOptions).some(key => !_.has(opts, key))) {
    _.defaults(opts, defaultOptions)
    await storage.setOptions(opts)
  }

  opts_global = opts;
  return opts
}

const storageChangedHandler = async changes => {
  console.debug('[storage changed]', changes)
  if (changes.opts) {
    opts_global = changes.opts.newValue || options.getDefaultOptions();
  }

  if (changes.lists) {
    if (opts_global.disableDynamicMenu) return
    await setupContextMenus(opts_global)
  }
}

const tabsChangedHandler = async activeInfo => {
  if (opts_global.disableDynamicMenu) return
  const currentCoverBrowserAction = getCoverBrowserAction();
  if (currentCoverBrowserAction) {
    await currentCoverBrowserAction(activeInfo);
  }
  dynamicDisableMenu()
}

const fixDirtyData = async () => {
  const unlock = await listManager.RWLock.lock()
  const { lists } = await chrome.storage.local.get('lists')
  if (lists) {
    const cleanLists = lists.filter(_.isPlainObject).map(normalizeList)
    await chrome.storage.local.set({ lists: cleanLists })
  }
  await unlock()
}

const init = async () => {
  try {
    // await logger.init() // The logger has been temporarily disabled for debugging
    await listManager.init()
    const opts = await initOptions()
    await setupContextMenus(opts)
    if (chrome?.contextMenus?.onClicked && !chrome.contextMenus.onClicked.hasListener(handleContextMenuClicked)) {
      chrome.contextMenus.onClicked.addListener(handleContextMenuClicked)
    }

    chrome.runtime.onInstalled.addListener(async () => {
      const opts = await initOptions();
      await setupContextMenus(opts);
    });
  const isServiceWorker =
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.id &&
    !chrome.extension?.getViews?.({ type: "popup" })?.length;


  // Around line 99
  if (typeof chrome.commands !== 'undefined' && chrome.commands.getAll) {
      chrome.commands.getAll((commands) => {
          // ... existing internal logic if there was any ...
      });
  } else {
      console.log("Commands API not available, skipping initialization of shortcuts.");
  }
    chrome.runtime.onMessageExternal.addListener(commandHandler)
    chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
      // Guard dispatch so malformed payloads or handler bugs cannot crash the service worker.
      try {
        return await messageHandler(msg, sender, sendResponse)
      } catch (error) {
        console.error('[SquirrlTab] message dispatch failed', { msg, error })
        return false
      }
    });
    chrome.runtime.onUpdateAvailable.addListener(detail => { updateVersion_global = detail.version })
    chrome.action.onClicked.addListener(async () => {
      const handler = getBrowserActionHandler(opts_global.browserAction)
      if (handler) {
        await handler()
      }
    });
    chrome.tabs.onActivated.addListener(_.debounce(tabsChangedHandler, 200));
    chrome.storage.onChanged.addListener(storageChangedHandler);



    await migrate()
    await fixDirtyData()

  } catch (error) {
    console.error("A critical error occurred during background script initialization:", error);
  }
}

export default init
