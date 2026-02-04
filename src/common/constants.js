export const COLORS = [
  '', 'red', 'pink', 'purple',
  'indigo', 'blue', 'cyan', 'teal',
  'green', 'yellow', 'orange', 'brown',
]

export const ILLEGAL_URLS = ['about:', 'chrome:', 'file:', 'wss:', 'ws:']

export const PICKED_TAB_PROPS = ['url', 'title', 'favIconUrl', 'pinned']
export const PICKED_LIST_RPOPS = ['_id', 'tabs', 'title', 'tags', 'category', 'time', 'pinned', 'expand', 'color', 'updatedAt']
export const SYNCED_LIST_PROPS = ['_id', 'tabs', 'title', 'tags', 'category', 'time', 'pinned', 'color', 'updatedAt']

export const END_FRONT = 'front'
export const END_BACKGROUND = 'background'

export const SYNC_PHASES = {
  IDLE: 'idle',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  AUTH_ERROR: 'auth-error',
  OFFLINE: 'offline',
  SERVER_ERROR: 'server-error',
  NEVER_SYNCED: 'never-synced',
  LOCAL_ONLY: 'local-only',
}

export const ADD_LIST = 'addList'
export const UPDATE_LIST_BY_ID = 'updateListById'
export const REMOVE_LIST_BY_ID = 'removeListById'
export const CHANGE_LIST_ORDER = 'changeListOrderRelatively'

export const SENTRY_DSN = 'https://3a924dd322e24dbca1c28364de767ffc@sentry.io/1307154'

export const RUNTIME_MESSAGES = {
  STASH_CURRENT_TAB: 'STASH_CURRENT_TAB',
  STASH_COMPLETED: 'STASH_COMPLETED',
  STASH_FAILED: 'STASH_FAILED',
}
