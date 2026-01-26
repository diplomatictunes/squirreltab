import browser from 'webextension-polyfill'
import CustomSync from '@/common/service/custom-sync'
import tabsHelper from '@/common/tabs'
import manager from './bridge'
import _ from 'lodash'

// 1. Define reactive state using Runes
let state = $state({
  lists: [],
  opts: {},
  aiLoading: null,
  syncing: false
});

// 2. Initialization logic
const initStore = async () => {
  const data = await browser.storage.local.get(['lists', 'opts'])
  state.lists = data.lists || [];
  state.opts = data.opts || {};
}

initStore();

// Keep state in sync with extension storage
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes.lists) state.lists = changes.lists.newValue || [];
    if (changes.opts) state.opts = changes.opts.newValue || [];
  }
});

/**
 * Sync Logic
 */

const debouncedPush = _.debounce(async (listsData) => {
  state.syncing = true;
  try {
    // Note: To avoid 'connection refused' loops, 
    // ensure your FastAPI server is running on :3000
    for (const list of listsData) {
      await CustomSync.upload(list);
    }
    console.debug('FastAPI Sync Complete');
  } catch (err) {
    console.error('FastAPI Sync Failed:', err);
  } finally {
    state.syncing = false;
  }
}, 2000);

// 3. Watcher for sync (Replaces lists.subscribe)
$effect.root(() => {
  $effect(() => {
    if (state.lists.length > 0) {
      // Use $state.snapshot to send a clean object to the API 
      // instead of the reactive proxy
      debouncedPush($state.snapshot(state.lists));
    }
  });
});

/**
 * Exported Interface
 */

// Derived properties (Runes replace 'derived' stores)
export const syncStore = {
  // Getters for reactivity
  get lists() { return state.lists; },
  get opts() { return state.opts; },
  get aiLoading() { return state.aiLoading; },
  get syncing() { return state.syncing; },

  get pinnedLists() {
    return state.lists.filter(l => l.pinned);
  },

  get taggedLists() {
    const tagged = {};
    state.lists.forEach(l => {
      (l.tags || []).forEach(t => {
        if (!tagged[t]) tagged[t] = [];
        tagged[t].push(l);
      });
    });
    return tagged;
  },

  // Actions
  async categorizeList(listId) {
    const list = state.lists.find(l => l._id === listId);
    if (!list) return;

    state.aiLoading = list._id;
    try {
      const result = await CustomSync.AI.categorize(list.tabs);
      if (result.category) {
        manager.updateListById(list._id, { category: result.category });
      }
      if (result.tags) {
        manager.updateListById(list._id, { tags: result.tags });
      }
      return result;
    } finally {
      state.aiLoading = null;
    }
  },

  async restoreList(listId, inNewWindow = false) {
    const list = state.lists.find(l => l._id === listId);
    if (!list) return;

    await tabsHelper.restoreTabs(list.tabs, inNewWindow);
    manager.removeListById(listId);
  },

  updateList(listId, updates) { manager.updateListById(listId, updates); },
  removeList(listId) { manager.removeListById(listId); },
  pinList(listId, pinned) { manager.updateListById(listId, { pinned }); },
  changeColor(listId, color) { manager.updateListById(listId, { color }); }
};