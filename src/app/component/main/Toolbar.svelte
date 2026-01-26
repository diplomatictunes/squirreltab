<script>
  import { opts, actions } from "../../store/syncStore";
  import __ from "@/common/i18n";

  let { onToggleDrawer } = $props();
  let nightmode = $derived($opts.nightmode || false);
</script>

<nav class="toolbar" class:dark={nightmode}>
  <div class="left">
    <button class="icon-btn" onclick={onToggleDrawer} aria-label="Toggle Drawer">
      <i class="fas fa-bars"></i>
    </button>
    <span class="logo">IceTab</span>
  </div>

  <div class="center">
    <!-- Search could go here if implemented -->
  </div>

  <div class="right">
    <button
      class="icon-btn"
      onclick={actions.cleanAll}
      title={__("ui_clean_all")}
    >
      <i class="fas fa-magic"></i>
    </button>

    <button class="icon-btn" title={__("ui_nightmode")}>
      <i class={nightmode ? "fas fa-sun" : "fas fa-moon"}></i>
    </button>
  </div>
</nav>

<style>
  .toolbar {
    height: 64px;
    background: #3b82f6;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }
  .toolbar.dark {
    background: #1f2937;
  }
  .left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .logo {
    font-size: 1.25rem;
    font-weight: bold;
  }
  .icon-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: background 0.2s;
  }
  .icon-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }
</style>
