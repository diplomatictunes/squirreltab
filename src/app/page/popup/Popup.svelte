<script>
  import { onMount } from "svelte";
  import tabs from "@/common/tabs";
  import { sendStashCurrentTabIntent } from "@/common/intents";
  import { getRuntimeSource } from "@/common/runtimeContext";

  import SyncStatusBadge from "../../component/sync/SyncStatusBadge.svelte";
  import Snackbar from "../../component/main/Snackbar.svelte";

  let isStashing = $state(false);

  // In a real app, this would react to actual sync state
  // For now, we mock the dynamic time update if needed or just keep static as per requirement "Single-line sync status"

  async function handleStashCurrent() {
    isStashing = true;
    try {
      // Use intent if preferred for current tab (as in DetailList)
      await sendStashCurrentTabIntent(getRuntimeSource());
      // window.close() is removed here as it might prevent seeing the success state,
      // but usually users want it to close. If it fails, they'll see the error in snackbar.
      setTimeout(() => window.close(), 1000);
    } catch (e) {
      console.error(e);
    } finally {
      isStashing = false;
    }
  }

  async function handleStashAll() {
    isStashing = true;
    try {
      await tabs.storeAllTabs();
      window.close();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleStashLeft() {
    try {
      await tabs.storeLeftTabs();
      window.close();
    } catch (e) {}
  }

  async function handleStashRight() {
    try {
      await tabs.storeRightTabs();
      window.close();
    } catch (e) {}
  }

  function openStashList() {
    tabs.openlists();
  }

  function openSettings() {
    chrome.runtime.openOptionsPage();
  }
</script>

<div class="popup">
  <!-- Status Header -->
  <header class="status-bar">
    <SyncStatusBadge />
  </header>

  <!-- Main Action -->
  <main class="hero-section">
    <button
      class="stash-btn primary"
      onclick={handleStashCurrent}
      disabled={isStashing}
    >
      <span class="btn-text">Stash this tab</span>
    </button>
  </main>

  <!-- Secondary Actions -->
  <div class="secondary-actions">
    <button class="action-chip" onclick={handleStashAll} title="Stash all tabs">
      Stash all tabs
    </button>
    <div class="split-actions">
      <button
        class="action-chip"
        onclick={handleStashLeft}
        title="Stash tabs to the left"
      >
        Stash left
      </button>
      <button
        class="action-chip"
        onclick={handleStashRight}
        title="Stash tabs to the right"
      >
        Stash right
      </button>
    </div>
  </div>

  <footer class="nav-footer">
    <button class="nav-link" onclick={openStashList}>Open stash list</button>
    <button class="nav-link" onclick={openSettings}>Settings</button>
  </footer>

  <Snackbar />
</div>

<style>
  :global(body) {
    width: 300px; /* Standard popup width */
    height: 400px;
    margin: 0;
    overflow: hidden; /* Requirement: Popup must never scroll */
    background-color: #141517;
    color: #e4e4e7;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Helvetica, Arial, sans-serif;
  }

  .popup {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 16px;
    box-sizing: border-box;
  }

  /* Typography Hierarchy */
  /* Size 1: Standard (14px) */
  /* Size 2: Small (12px) */

  .status-bar {
    text-align: center;
    margin-bottom: 24px;
    opacity: 0.6;
  }

  .status-text {
    font-family: "SF Mono", "Roboto Mono", monospace;
    font-size: 12px;
    letter-spacing: 0.5px;
  }

  .hero-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .stash-btn {
    width: 100%;
    height: 48px;
    border: none;
    border-radius: 8px; /* Slightly rounded, not full pill */
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stash-btn.primary {
    background: #e4e4e7;
    color: #141517;
  }

  .stash-btn.primary:hover {
    background: #ffffff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
  }

  .stash-btn.primary:active {
    transform: translateY(0);
  }

  .secondary-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 32px;
  }

  .split-actions {
    display: flex;
    gap: 8px;
  }

  .action-chip {
    flex: 1;
    background: transparent;
    border: 1px solid #27272a;
    color: #a1a1aa;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
  }

  .action-chip:hover {
    background: #27272a;
    color: #e4e4e7;
    border-color: #3f3f46;
  }

  .nav-footer {
    display: flex;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid #27272a;
  }

  .nav-link {
    background: none;
    border: none;
    color: #71717a;
    font-size: 12px;
    cursor: pointer;
    padding: 4px 0;
    transition: color 0.2s;
  }

  .nav-link:hover {
    color: #e4e4e7;
  }
</style>
