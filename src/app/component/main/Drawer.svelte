<script>
  import { syncStore } from "../../store/syncStore.svelte.js";
  import { fade, fly } from "svelte/transition";
  import { SYNC_PHASES } from "@/common/constants";
  import { sendStashCurrentTabIntent } from "@/common/intents";
  import { getRuntimeSource, isPopupContext } from "@/common/runtimeContext";

  let { open = $bindable(false), onSetView } = $props();

  const setView = (view) => {
    if (onSetView) onSetView(view);
    open = false;
  };

  let taggedLists = $derived(syncStore.taggedLists);
  let syncMeta = $derived(syncStore.syncStatus);
  let stashLoading = $state(false);
  const runtimeSource = getRuntimeSource();
  const popupContext = isPopupContext();

  const formatSyncedTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  let statusLabel = $derived(() => {
    if (syncMeta.syncing) return "Syncing...";
    if (syncMeta.phase === SYNC_PHASES.OFFLINE) return "Offline mode";
    if (syncMeta.phase === SYNC_PHASES.AUTH_ERROR) return "Sync auth required";
    if (syncMeta.phase === SYNC_PHASES.SERVER_ERROR) return syncMeta.error?.message || "Sync failed";
    if (syncMeta.phase === SYNC_PHASES.LOCAL_ONLY) return "Local changes pending";
    if (syncMeta.phase === SYNC_PHASES.NEVER_SYNCED) return "Not synced yet";
    if (syncMeta.lastSyncedAt) return `Synced ${formatSyncedTime(syncMeta.lastSyncedAt)}`;
    return "Idle";
  });

  // Popup UI must never perform async tab, storage, or sync work; delegate via runtime messaging only.
  const handleQuickStash = () => {
    if (!popupContext || stashLoading) return;
    stashLoading = true;
    sendStashCurrentTabIntent(runtimeSource)
      .catch((error) => {
        console.error("[SquirrlTab] Failed to dispatch stash intent from popup:", error);
      })
      .finally(() => {
        stashLoading = false;
      });
  };
</script>

{#if open}
  <div
    class="overlay"
    role="button"
    tabindex="0"
    onclick={() => (open = false)}
    onkeydown={(e) => e.key === "Escape" && (open = false)}
    transition:fade={{ duration: 200 }}
  ></div>

  <aside class="drawer" transition:fly={{ x: -280, duration: 300, opacity: 1 }}>
    <!-- Drawer Header -->
    <header class="drawer-header">
      <div class="logo-section">
        <i class="fas fa-squirrel logo-icon"></i>
        <div class="logo-text">
          <span class="logo-title">SquirrlTab</span>
          <span class="logo-subtitle">Winter Storage</span>
        </div>
      </div>
    </header>

    {#if popupContext}
      <!-- Quick Actions -->
      <section class="quick-actions">
        <button class="action-btn primary" onclick={handleQuickStash} disabled={stashLoading}>
          <i class={`fas ${stashLoading ? "fa-spinner fa-spin" : "fa-plus"}`}></i>
          <span>{stashLoading ? "Stashing..." : "Stash This Tab"}</span>
        </button>
      </section>
    {/if}

    <!-- Navigation -->
    <nav class="nav-section">
      <ul class="nav-list">
        <li>
          <button class="nav-item" onclick={() => setView("all")}>
            <i class="fas fa-th-large"></i>
            <span>All Stashes</span>
          </button>
        </li>
        <li>
          <button class="nav-item" onclick={() => setView("pinned")}>
            <i class="fas fa-thumbtack"></i>
            <span>Pinned</span>
          </button>
        </li>
      </ul>
    </nav>

    <div class="divider"></div>

    <!-- Categories Section -->
    <section class="categories-section">
      <div class="section-header">
        <span class="section-label">Categories</span>
      </div>

      <ul class="nav-list">
        {#each Object.keys(taggedLists) as tag}
          <li>
            <button
              class="nav-item category"
              onclick={() => setView(`tag:${tag}`)}
            >
              <i class="fas fa-tag"></i>
              <span>{tag}</span>
              <span class="count">{taggedLists[tag].length}</span>
            </button>
          </li>
        {:else}
          <li class="empty-hint">
            <i class="fas fa-info-circle"></i>
            <span>No tags stashed yet</span>
          </li>
        {/each}
      </ul>
    </section>

    <div class="spacer"></div>

    <!-- Footer Section -->
    <footer class="drawer-footer">
      <button class="nav-item secondary" onclick={() => setView("options")}>
        <i class="fas fa-cog"></i>
        <span>Settings</span>
      </button>

    <div class="sync-status">
      <div
        class="status-indicator"
        class:online={syncMeta.phase === SYNC_PHASES.SYNCED && !syncMeta.localOnly}
        class:offline={syncMeta.phase === SYNC_PHASES.OFFLINE}
        class:error={syncMeta.phase === SYNC_PHASES.SERVER_ERROR || syncMeta.phase === SYNC_PHASES.AUTH_ERROR}
        class:syncing={syncMeta.syncing}
        class:local={syncMeta.localOnly || syncMeta.phase === SYNC_PHASES.LOCAL_ONLY}
      >
        <span class="status-dot"></span>
        <span class="status-text">{statusLabel}</span>
      </div>
    </div>
  </footer>
</aside>
{/if}

<style>
  /* Overlay */
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 1000;
  }

  /* Drawer */
  .drawer {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    background: #1a1b1e;
    z-index: 1001;
    display: flex;
    flex-direction: column;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);
    border-right: 1px solid #2c2e33;
  }

  /* Drawer Header */
  .drawer-header {
    padding: 20px;
    border-bottom: 1px solid #2c2e33;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .logo-icon {
    color: #ff922b;
    font-size: 1.75rem;
    filter: drop-shadow(0 2px 4px rgba(255, 146, 43, 0.3));
  }

  .logo-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .logo-title {
    font-weight: 700;
    font-size: 1.125rem;
    color: #e4e4e7;
    letter-spacing: -0.02em;
  }

  .logo-subtitle {
    font-size: 0.75rem;
    color: #5c5f66;
    font-weight: 500;
  }

  /* Quick Actions */
  .quick-actions {
    padding: 16px;
  }

  .action-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #ff922b 0%, #ff6b35 100%);
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(255, 146, 43, 0.3);
  }

  .action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 146, 43, 0.4);
  }

  .action-btn:active {
    transform: translateY(0);
  }

  /* Navigation */
  .nav-section,
  .categories-section,
  .nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .nav-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: #c1c2c5;
    font-size: 0.9rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .nav-item i {
    width: 18px;
    font-size: 0.9rem;
    color: #5c5f66;
    transition: all 0.2s;
  }

  .nav-item span {
    flex: 1;
  }

  .nav-item:hover {
    background: #25262b;
    color: #e4e4e7;
  }

  .nav-item:hover i {
    color: #909296;
  }

  .nav-item.category:hover i {
    color: #ff922b;
  }

  .nav-item.secondary {
    color: #909296;
  }

  .count {
    background: #2c2e33;
    color: #909296;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 24px;
    text-align: center;
  }

  /* Section Headers */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 12px 8px;
  }

  .section-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #5c5f66;
    font-weight: 600;
  }

  .categories-section .section-label {
    padding: 16px 12px 8px;
  }

  /* Empty Hint */
  .empty-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    font-size: 0.8rem;
    color: #5c5f66;
    font-style: italic;
  }

  .empty-hint i {
    font-size: 0.875rem;
  }

  /* Divider */
  .divider {
    height: 1px;
    background: #2c2e33;
    margin: 12px 16px;
  }

  /* Spacer */
  .spacer {
    flex: 1;
  }

  /* Footer */
  .drawer-footer {
    padding: 16px;
    border-top: 1px solid #2c2e33;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .sync-status {
    padding: 8px 12px;
  }

  .status-indicator {
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
    background: #5c5f66;
    transition: all 0.3s;
  }

  .status-indicator.online .status-dot {
    background: #40c057;
    box-shadow: 0 0 8px rgba(64, 192, 87, 0.4);
  }

  .status-indicator.offline .status-dot {
    background: #fa5252;
    box-shadow: 0 0 8px rgba(250, 82, 82, 0.4);
  }

  .status-indicator.syncing {
    color: #ff922b;
  }

  .status-indicator.error {
    color: #fa5252;
  }

  .status-indicator.local .status-dot {
    background: #ffa94d;
    box-shadow: 0 0 8px rgba(255, 169, 77, 0.4);
  }

  .status-text {
    font-weight: 500;
  }
</style>
