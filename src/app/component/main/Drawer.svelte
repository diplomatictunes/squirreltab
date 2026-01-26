<script>
  import { syncStore } from "../../store/syncStore.svelte.js";
  import __ from "@/common/i18n";
  import { fade, fly } from "svelte/transition";

  let { open = $bindable(false), onSetView } = $props();

  const setView = (view) => {
    if (onSetView) onSetView(view);
    open = false;
  };
</script>

{#if open}
  <div
    class="overlay"
    onclick={() => (open = false)}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === "Escape" && (open = false)}
    transition:fade={{ duration: 200 }}
  ></div>

  <aside class="drawer" transition:fly={{ x: -280, duration: 300, opacity: 1 }}>
    <header class="drawer-header">
      <i class="fas fa-squirrel logo-icon"></i>
      <span>SquirrlTab</span>
    </header>

    <nav>
      <ul>
        <li>
          <button onclick={() => setView("all")}>
            <i class="fas fa-archive"></i>
            {__("ui_tab_list")}
          </button>
        </li>
        <li>
          <button onclick={() => setView("pinned")}>
            <i class="fas fa-thumbtack"></i>
            {__("ui_pinned")}
          </button>
        </li>

        <li class="section-label">Categories</li>

        {#each Object.keys(syncStore.taggedLists) as tag}
          <li>
            <button onclick={() => setView(`tag:${tag}`)}>
              <i class="fas fa-tag"></i>
              {tag}
            </button>
          </li>
        {:else}
          <li class="empty-hint">No tags stashed yet</li>
        {/each}

        <li class="divider"></li>

        <li>
          <button onclick={() => setView("options")} class="secondary">
            <i class="fas fa-cog"></i>
            {__("ui_options")}
          </button>
        </li>
      </ul>
    </nav>

    <footer class="drawer-footer">
      <div class="sync-status">
        <span
          class="status-dot {syncStore.lastSyncSuccess ? 'online' : 'error'}"
        ></span>
        {syncStore.lastSyncSuccess ? "Synced" : "Storage Error"}
      </div>
    </footer>
  </aside>
{/if}

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
    z-index: 1000;
  }

  .drawer {
    position: fixed;
    top: 12px;
    left: 12px;
    bottom: 12px;
    width: 260px;
    background: #1a1b1e; /* Deep charcoal */
    z-index: 1001;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    box-shadow: 8px 0 32px rgba(0, 0, 0, 0.5);
    border: 1px solid #2c2e33;
    overflow: hidden;
  }

  .drawer-header {
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 700;
    font-size: 1.1rem;
    color: #fff;
  }

  .logo-icon {
    color: #ff922b; /* Squirrel orange */
  }

  ul {
    list-style: none;
    padding: 0 12px;
    margin: 0;
  }

  .section-label {
    padding: 16px 12px 8px;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #5c5f66;
  }

  li button {
    width: 100%;
    text-align: left;
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.9rem;
    color: #c1c2c5;
    transition: all 0.2s;
  }

  li button:hover {
    background: #25262b;
    color: #fff;
  }

  li button i {
    width: 16px;
    font-size: 0.85rem;
    opacity: 0.7;
  }

  .divider {
    height: 1px;
    background: #2c2e33;
    margin: 16px 12px;
  }

  .empty-hint {
    padding: 12px;
    font-size: 0.8rem;
    color: #5c5f66;
    font-style: italic;
  }

  .drawer-footer {
    margin-top: auto;
    padding: 16px;
    border-top: 1px solid #2c2e33;
  }

  .sync-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: #909296;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .online {
    background: #40c057;
  }
  .error {
    background: #fa5252;
  }
</style>
