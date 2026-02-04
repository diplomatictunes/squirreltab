<script>
  import SyncStatusBadge from "../sync/SyncStatusBadge.svelte";

  let { onToggleDrawer, onOpenSettings } = $props();
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

  <div class="toolbar-right">
    <div class="sync-wrapper">
      <SyncStatusBadge />
    </div>

    <button class="icon-btn" onclick={onOpenSettings} title="Settings">
      <i class="fas fa-cog"></i>
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

  .toolbar-left {
    flex: 1;
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

  }
</style>
