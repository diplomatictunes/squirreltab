
export const clearStorage = () => chrome.storage.local.get()
  .then(Object.keys).then(chrome.storage.local.remove)
