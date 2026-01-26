import listManager from '@/common/listManager'
import browser from 'webextension-polyfill'

// Initialize the listManager for the frontend context
listManager.init()

/**
 * Bridge function to handle listManager mutations in a Svelte-friendly way.
 * This can be used by the Svelte stores to listen for changes from the background
 * or other tabs.
 */
export const listenForChanges = (callback) => {
  // Listen for 'refresh' messages from listManager (via sendMessage)
  const listener = (message) => {
    if (message.refresh || message.listModifed) {
      callback(message)
    }
  }
  browser.runtime.onMessage.addListener(listener)
  return () => browser.runtime.onMessage.removeListener(listener)
}

export default listManager
