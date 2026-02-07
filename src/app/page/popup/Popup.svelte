<script>
  import { onMount } from "svelte";
  import tabs from "@/common/tabs";
  import { sendStashCurrentTabIntent } from "@/common/intents";
  import { getRuntimeSource } from "@/common/runtimeContext";
  import { syncStore } from "../../store/syncStore.svelte.js";

  import SyncStatusBadge from "../../component/sync/SyncStatusBadge.svelte";
  import Snackbar from "../../component/main/Snackbar.svelte";

  let isStashing = $state(false);

  async function handleStashCurrent() {
    isStashing = true;
    try {
      await sendStashCurrentTabIntent(getRuntimeSource());
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
    } finally {
      isStashing = false;
    }
  }

  async function handleStashSelected() {
    isStashing = true;
    try {
      await tabs.storeSelectedTabs();
      window.close();
    } catch (e) {
      console.error(e);
    } finally {
      isStashing = false;
    }
  }

  async function handleStashLeft() {
    try {
      await tabs.storeLeftTabs();
      window.close();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleStashRight() {
    try {
      await tabs.storeRightTabs();
      window.close();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleStashExceptCurrent() {
    isStashing = true;
    try {
      await tabs.storeExceptCurrentTab();
      window.close();
    } catch (e) {
      console.error(e);
    } finally {
      isStashing = false;
    }
  }

  async function handleStashExceptSelected() {
    isStashing = true;
    try {
      await tabs.storeExceptSelectedTabs();
      window.close();
    } catch (e) {
      console.error(e);
    } finally {
      isStashing = false;
    }
  }

  function openStashList() {
    tabs.openlists();
  }
</script>

<div class="popup-container">
  <div class="header">
    <div class="logo">S</div>
    <div class="brand-name">Stashbase</div>
  </div>

  <div class="actions">
    <button
      class="action-button primary"
      onclick={handleStashCurrent}
      disabled={isStashing}
    >
      Stash This Tab
    </button>
    <button class="action-button primary" onclick={handleStashAll}>
      Stash All Tabs
    </button>

    <div class="action-grid">
      <button
        class="action-button secondary"
        onclick={handleStashSelected}
        title="Stash selected tabs"
      >
        Selected
      </button>
      <button
        class="action-button secondary"
        onclick={handleStashLeft}
        title="Stash tabs to the left"
      >
        Left
      </button>
      <button
        class="action-button secondary"
        onclick={handleStashRight}
        title="Stash tabs to the right"
      >
        Right
      </button>
      <button
        class="action-button secondary"
        onclick={handleStashExceptCurrent}
        title="Stash all except current"
      >
        Not Current
      </button>
      <button
        class="action-button secondary"
        onclick={handleStashExceptSelected}
        title="Stash all except selected"
      >
        Not Selected
      </button>
      <button
        class="action-button secondary list-link"
        onclick={openStashList}
        title="Open your lists"
      >
        My Lists
      </button>
    </div>
  </div>

  <div class="status">
    <SyncStatusBadge />
    <span>•</span>
    {#if syncStore.opts?.aiNameSuggestions}
      <span class="ai-badge">AI Enabled</span>
    {:else}
      <span class="ai-badge disabled">AI Disabled</span>
    {/if}
  </div>

  <Snackbar />
</div>

<svelte:head>
  <link
    href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<style>
  :global(body) {
    width: 300px;
    min-height: 400px;
    margin: 0;
    padding: 0;
    font-family:
      "DM Sans",
      -apple-system,
      sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    overflow: hidden;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --primary-blue: #0066ff;
    --primary-blue-hover: #0052cc;
    --bg-white: #ffffff;
    --border-light: #e4e7eb;
    --text-dark: #1a1d1f;
    --text-gray: #6f767e;
    --success-green: #22c55e;
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .popup-container {
    background: var(--bg-white);
    border-radius: 20px;
    padding: 32px;
    width: 300px;
    min-height: fit-content;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
  }

  .logo {
    width: 40px;
    height: 40px;
    background: var(--text-dark);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Syne", sans-serif;
    font-weight: 700;
    color: white;
    font-size: 20px;
  }

  .brand-name {
    font-family: "Syne", sans-serif;
    font-weight: 700;
    font-size: 18px;
    color: var(--text-dark);
    letter-spacing: -0.02em;
  }

  .action-button {
    width: 100%;
    background: var(--primary-blue);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 16px 24px;
    font-family: "DM Sans", sans-serif;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: var(--shadow-sm);
    margin-bottom: 12px;
  }

  .action-button:hover:not(:disabled) {
    background: var(--primary-blue-hover);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 102, 255, 0.3);
  }

  .action-button.secondary {
    background: #f1f5f9;
    color: var(--text-dark);
    padding: 12px 16px;
    font-size: 13px;
    margin-bottom: 0;
    box-shadow: none;
    border: 1px solid var(--border-light);
  }

  .action-button.secondary:hover:not(:disabled) {
    background: #e2e8f0;
    transform: none;
    box-shadow: var(--shadow-sm);
  }

  .action-button.list-link {
    grid-column: span 2;
    background: var(--text-dark);
    color: white;
    margin-top: 4px;
    border: none;
  }

  .action-button.list-link:hover:not(:disabled) {
    background: #2d2d2d;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .action-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 4px;
  }

  .actions {
    display: flex;
    flex-direction: column;
  }

  .action-button:active {
    transform: translateY(0);
  }

  .action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--border-light);
    font-size: 13px;
    color: var(--text-gray);
  }

  .ai-badge {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .ai-badge.disabled {
    background: #e4e7eb;
    color: #6f767e;
  }
</style>
