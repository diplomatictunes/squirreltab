<script>
  import { syncStore } from "../../store/syncStore.svelte.js";
  import browser from "webextension-polyfill";
  import SyncStatusBadge from "../sync/SyncStatusBadge.svelte";

  let { onToggleDrawer } = $props();

  let nightmode = $derived(syncStore.opts.nightmode || false);
  let searchQuery = $state("");

  function toggleNightMode() {
    browser.storage.local.get("opts").then((data) => {
      const opts = data.opts || {};
      opts.nightmode = !nightmode;
      browser.storage.local.set({ opts });
    });
  }

  function handleSearch(event) {
    searchQuery = event.target.value;
  }
</script>

<nav class="toolbar">
  <div class="toolbar-left">
    <button class="menu-btn" onclick={onToggleDrawer} title="Open menu">
      <i class="fas fa-bars"></i>
    </button>

    <div class="brand">
      <i class="fas fa-squirrel brand-icon"></i>
      <span class="brand-name">SquirrlTab</span>
    </div>
  </div>

  <div class="toolbar-center">
    <div class="search-container">
      <i class="fas fa-search search-icon"></i>
      <input
        type="text"
        placeholder="Search your hoard..."
        value={searchQuery}
        oninput={handleSearch}
        class="search-input"
      />
      {#if searchQuery}
        <button
          class="clear-search"
          onclick={() => (searchQuery = "")}
          aria-label="Clear search"
        >
          <i class="fas fa-times"></i>
        </button>
      {/if}
    </div>
  </div>

  <div class="toolbar-right">
    <button
      class="icon-btn"
      onclick={toggleNightMode}
      title={nightmode ? "Light mode" : "Dark mode"}
    >
      <i class="fas fa-{nightmode ? 'sun' : 'moon'}"></i>
    </button>

    <div class="sync-wrapper">
      <SyncStatusBadge />
    </div>

    <button class="icon-btn" title="Settings">
      <i class="fas fa-cog"></i>
    </button>

    <button class="icon-btn" title="More options">
      <i class="fas fa-ellipsis-v"></i>
    </button>
  </div>
</nav>

<style>
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    background: #1a1b1e;
    border-bottom: 1px solid #2c2e33;
    padding: 0 16px;
    gap: 16px;
    flex-shrink: 0;
  }

  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .toolbar-center {
    flex: 1;
    max-width: 500px;
  }

  /* Menu Button */
  .menu-btn {
    background: transparent;
    border: none;
    color: #909296;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 1.125rem;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .menu-btn:hover {
    background: #25262b;
    color: #e4e4e7;
  }

  .menu-btn:active {
    transform: scale(0.95);
  }

  /* Brand */
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-icon {
    color: #ff922b;
    font-size: 1.25rem;
  }

  .brand-name {
    font-size: 1.125rem;
    font-weight: 700;
    color: #e4e4e7;
    letter-spacing: -0.02em;
  }

  /* Search */
  .search-container {
    position: relative;
    display: flex;
    align-items: center;
    background: #25262b;
    border: 1px solid #2c2e33;
    border-radius: 10px;
    padding: 0 12px;
    transition: all 0.2s;
  }

  .search-container:focus-within {
    background: #2c2e33;
    border-color: #3c3e44;
    box-shadow: 0 0 0 3px rgba(255, 146, 43, 0.1);
  }

  .search-icon {
    color: #5c5f66;
    font-size: 0.875rem;
    margin-right: 8px;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    color: #e4e4e7;
    font-size: 0.875rem;
    padding: 10px 0;
    outline: none;
  }

  .search-input::placeholder {
    color: #5c5f66;
  }

  .clear-search {
    background: transparent;
    border: none;
    color: #5c5f66;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .clear-search:hover {
    background: #3c3e44;
    color: #909296;
  }

  /* Icon Buttons */
  .icon-btn {
    background: transparent;
    border: none;
    color: #909296;
    cursor: pointer;
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 0.9rem;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-btn:hover {
    background: #25262b;
    color: #e4e4e7;
  }

  .icon-btn:active {
    transform: scale(0.95);
  }

  /* Sync Indicator */
  .sync-wrapper {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .brand-name {
      display: none;
    }

    .toolbar-center {
      max-width: 300px;
    }
  }
</style>
