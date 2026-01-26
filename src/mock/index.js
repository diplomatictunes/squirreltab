// Basic Mock for Chrome Extension API
const storage = {};

const mockBrowser = {
  runtime: {
    getURL: (path) => window.location.origin + '/' + (path || ''),
    id: 'mock-extension-id',
    onMessage: { addListener: () => { } },
    sendMessage: () => Promise.resolve(),
    getManifest: () => ({ version: '0.0.0' }),
  },
  tabs: {
    query: async () => {
      // Return some dummy tabs
      return [
        { id: 1, title: 'Google', url: 'https://google.com', favIconUrl: 'https://www.google.com/favicon.ico', pinned: false, highlighted: true, windowId: 1 },
        { id: 2, title: 'GitHub', url: 'https://github.com', favIconUrl: 'https://github.com/favicon.ico', pinned: false, highlighted: false, windowId: 1 },
        { id: 3, title: 'Svelte', url: 'https://svelte.dev', favIconUrl: 'https://svelte.dev/favicon.png', pinned: true, highlighted: false, windowId: 1 },
        { id: 4, title: 'Twitter', url: 'https://twitter.com', favIconUrl: '', pinned: false, highlighted: false, windowId: 1 },
      ];
    },
    create: async (props) => {
      console.log('Mock: Creating tab', props);
      return { id: Math.floor(Math.random() * 1000), ...props };
    },
    update: async (id, props) => {
      console.log('Mock: Updating tab', id, props);
      return { id, ...props };
    },
    remove: async (ids) => {
      console.log('Mock: Removing tabs', ids);
    },
    onActivated: { addListener: () => { } },
    onUpdated: { addListener: () => { } },
    onRemoved: { addListener: () => { } },
    onMoved: { addListener: () => { } },
  },
  windows: {
    getCurrent: async () => ({ id: 1 }),
    getAll: async () => ([{ id: 1 }]),
    create: async () => ({ id: 2, tabs: [] }),
  },
  storage: {
    local: {
      get: async (keys) => {
        if (!keys) return storage;
        if (typeof keys === 'string') keys = [keys];
        const result = {};
        if (Array.isArray(keys)) {
          keys.forEach(k => result[k] = storage[k]);
        } else {
          // object with default values
          Object.keys(keys).forEach(k => result[k] = storage[k] || keys[k]);
        }
        return JSON.parse(JSON.stringify(result)); // Deep clone
      },
      set: async (items) => {
        Object.assign(storage, items);
        // Persist to localStorage for DX
        localStorage.setItem('mock_storage', JSON.stringify(storage));
        // Trigger onChanged
        if (mockBrowser.storage.onChanged.listeners) {
          const changes = {};
          Object.keys(items).forEach(k => {
            changes[k] = { newValue: items[k] };
          });
          mockBrowser.storage.onChanged.listeners.forEach(l => l(changes, 'local'));
        }
      },
      remove: async (keys) => {
        if (typeof keys === 'string') keys = [keys];
        keys.forEach(k => delete storage[k]);
        localStorage.setItem('mock_storage', JSON.stringify(storage));
      },
      clear: async () => {
        Object.keys(storage).forEach(key => delete storage[key]);
        localStorage.removeItem('mock_storage');
      }
    },
    onChanged: {
      listeners: [],
      addListener: (cb) => mockBrowser.storage.onChanged.listeners.push(cb),
      removeListener: (cb) => {
        mockBrowser.storage.onChanged.listeners = mockBrowser.storage.onChanged.listeners.filter(l => l !== cb);
      }
    }
  },
  i18n: {
    getMessage: (key) => {
      const messages = {
        ui_my_tab_lists: 'My Tab Lists',
        ui_clean_all: 'Clean All',
        ui_tabs: 'Tabs',
        ui_created: 'Created',
        ui_untitled_list: 'Untitled List',
        ui_unpin: 'Unpin',
        ui_pin: 'Pin',
        ui_restore_all: 'Restore All',
        ui_nightmode: 'Night Mode',
        ext_name: 'IceTab Dev',
        ext_desc: 'Development Mode'
      };
      return messages[key] || key;
    },
    getUILanguage: () => 'en'
  },
  commands: {
    getAll: async () => []
  }
};

// Initialize storage from localStorage
try {
  const saved = localStorage.getItem('mock_storage');
  if (saved) Object.assign(storage, JSON.parse(saved));
} catch (e) {
  console.warn('Failed to load mock storage', e);
}

// Expose globally
window.browser = mockBrowser;
window.chrome = mockBrowser;

export default mockBrowser;
