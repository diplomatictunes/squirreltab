<script>
  import "./index.css";
  import { onMount } from "svelte";
  import { isPopupContext } from "@/common/runtimeContext";
  import Popup from "./page/popup/Popup.svelte";
  import StashList from "./page/main/StashList.svelte";
  import SettingsView from "./page/settings/SettingsView.svelte";
  import Snackbar from "./component/main/Snackbar.svelte";

  const isPopup = isPopupContext();
  let activeView = $state("list"); // 'list' | 'settings'

  onMount(() => {
    // Basic hash routing support
    if (window.location.hash.includes("/options")) {
      activeView = "settings";
    }

    window.addEventListener("hashchange", () => {
      if (window.location.hash.includes("/options")) {
        activeView = "settings";
      } else {
        activeView = "list";
      }
    });
  });

  function toggleSettings() {
    if (activeView === "settings") {
      activeView = "list";
      window.location.hash = "/app/";
    } else {
      activeView = "settings";
      window.location.hash = "/app/options";
    }
  }
</script>

{#if isPopup}
  <Popup />
  <!-- Popup has its own status/handling, doesn't need global Snackbar usually, 
       but if we want error messages to bubble up we can include it. 
       Popup.svelte handles errors visually, so we can omit Snackbar to save space/complexity. 
  -->
{:else}
  <!-- Full Tab Application -->
  <main class="app-container">
    {#if activeView === "settings"}
      <div class="settings-layout">
        <header class="settings-header">
          <button class="back-btn" onclick={toggleSettings}>
            <i class="fas fa-arrow-left"></i> Back to Stashes
          </button>
        </header>
        <SettingsView onBack={toggleSettings} />
      </div>
    {:else}
      <StashList />

      <!-- Subtle Settings Access -->
      <button
        class="settings-fab"
        onclick={toggleSettings}
        title="Settings"
        aria-label="Open Settings"
      >
        <i class="fas fa-cog"></i>
      </button>
    {/if}

    <Snackbar />
  </main>
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    background: #141517;
    color: #e4e4e7;
    overflow-x: hidden; /* Prevent horizontal scroll */
  }

  :global(*) {
    box-sizing: border-box;
  }

  .app-container {
    min-height: 100vh;
    position: relative;
    /* Clean layout, no fixed headers here */
  }

  .settings-layout {
    max-width: 800px;
    margin: 0 auto;
    padding: 32px;
  }

  .settings-header {
    margin-bottom: 24px;
  }

  .back-btn {
    background: none;
    border: none;
    color: #71717a;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0;
  }

  .back-btn:hover {
    color: #e4e4e7;
  }

  .settings-fab {
    position: fixed;
    bottom: 32px;
    right: 32px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: transparent;
    border: 1px solid #27272a;
    color: #71717a;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 100;
  }

  .settings-fab:hover {
    background: #27272a;
    color: #e4e4e7;
    border-color: #3f3f46;
    transform: rotate(45deg);
  }

  /* Scrollbar Polish */
  :global(::-webkit-scrollbar) {
    width: 8px;
    height: 8px;
  }

  :global(::-webkit-scrollbar-track) {
    background: transparent;
  }

  :global(::-webkit-scrollbar-thumb) {
    background: #3c3e44;
    border-radius: 4px;
  }

  :global(::-webkit-scrollbar-thumb:hover) {
    background: #4c4e54;
  }
</style>
