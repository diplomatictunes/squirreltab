<script>
  import browser from "webextension-polyfill";
  import { syncStore } from "../../store/syncStore.svelte.js";
  import CustomSync from "@/common/service/custom-sync";
  
  let { onBack } = $props();
  
  // Settings state
  let settings = $state({
    syncBaseUrl: "",
    syncApiKey: "",
    autoSyncEnabled: true,
    autoSyncInterval: 300, // seconds
    confirmBeforeRestore: true,
    defaultRestoreBehavior: "current-window", // "current-window" | "new-window"
    deleteUnpinnedOnRestore: true,
  });
  
  let saveStatus = $state(null); // "saving" | "success" | "error"
  let testStatus = $state(null); // "testing" | "success" | "error"
  let testMessage = $state("");
  
  // Load settings on mount
  $effect(() => {
    loadSettings();
  });
  
  async function loadSettings() {
    const opts = await browser.storage.local.get("opts");
    if (opts.opts) {
      settings.syncBaseUrl = opts.opts.syncBaseUrl || "http://localhost:8000";
      settings.syncApiKey = opts.opts.syncApiKey || "";
      settings.autoSyncEnabled = opts.opts.autoSyncEnabled ?? true;
      settings.autoSyncInterval = opts.opts.autoSyncInterval || 300;
      settings.confirmBeforeRestore = opts.opts.confirmBeforeRestore ?? true;
      settings.defaultRestoreBehavior = opts.opts.defaultRestoreBehavior || "current-window";
      settings.deleteUnpinnedOnRestore = opts.opts.deleteUnpinnedOnRestore ?? true;
    }
  }
  
  async function saveSettings() {
    saveStatus = "saving";
    try {
      const opts = await browser.storage.local.get("opts");
      const updatedOpts = {
        ...(opts.opts || {}),
        syncBaseUrl: settings.syncBaseUrl.trim(),
        syncApiKey: settings.syncApiKey.trim(),
        autoSyncEnabled: settings.autoSyncEnabled,
        autoSyncInterval: settings.autoSyncInterval,
        confirmBeforeRestore: settings.confirmBeforeRestore,
        defaultRestoreBehavior: settings.defaultRestoreBehavior,
        deleteUnpinnedOnRestore: settings.deleteUnpinnedOnRestore,
      };
      
      await browser.storage.local.set({ opts: updatedOpts });
      saveStatus = "success";
      setTimeout(() => {
        saveStatus = null;
      }, 2000);
      
      syncStore.updateSnackbar("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      saveStatus = "error";
      setTimeout(() => {
        saveStatus = null;
      }, 3000);
    }
  }
  
  async function testConnection() {
    testStatus = "testing";
    testMessage = "Testing connection...";
    
    try {
      const opts = await browser.storage.local.get("opts");
      const tempOpts = {
        ...(opts.opts || {}),
        syncBaseUrl: settings.syncBaseUrl.trim(),
        syncApiKey: settings.syncApiKey.trim(),
      };
      await browser.storage.local.set({ opts: tempOpts });
      
      const health = await CustomSync.health();
      testStatus = "success";
      testMessage = "\u2713 Connected to " + (health.service || "sync service") + " v" + (health.version || "?");
      setTimeout(() => {
        testStatus = null;
        testMessage = "";
      }, 5000);
    } catch (error) {
      testStatus = "error";
      if (error.code === "offline") {
        testMessage = "\u2717 Cannot reach server. Check URL and network connection.";
      } else if (error.code === "auth") {
        testMessage = "\u2717 Authentication failed. Check your API key.";
      } else {
        testMessage = "\u2717 " + error.message;
      }
      setTimeout(() => {
        testStatus = null;
        testMessage = "";
      }, 5000);
    }
  }
  
  function resetToDefaults() {
    const confirmed = confirm("Reset all settings to defaults?");
    if (!confirmed) return;
    
    settings.syncBaseUrl = "http://localhost:8000";
    settings.syncApiKey = "";
    settings.autoSyncEnabled = true;
    settings.autoSyncInterval = 300;
    settings.confirmBeforeRestore = true;
    settings.defaultRestoreBehavior = "current-window";
    settings.deleteUnpinnedOnRestore = true;
  }
</script>

<div class="settings-view">
  <header class="settings-header">
    <button class="back-btn" onclick={onBack}>
      <i class="fas fa-arrow-left"></i>
      <span>Back</span>
    </button>
    <h1>Settings</h1>
  </header>
  
  <div class="settings-content">
    <!-- Sync Settings Section -->
    <section class="settings-section">
      <div class="section-header">
        <i class="fas fa-sync section-icon"></i>
        <h2>Sync Configuration</h2>
      </div>
      
      <div class="setting-group">
        <label for="sync-url" class="setting-label">
          Sync Server URL
          <span class="label-hint">The backend service URL for syncing your stashes</span>
        </label>
        <input
          id="sync-url"
          type="url"
          class="setting-input"
          bind:value={settings.syncBaseUrl}
          placeholder="http://localhost:8000"
        />
      </div>
      
      <div class="setting-group">
        <label for="api-key" class="setting-label">
          API Key
          <span class="label-hint">Your authentication key for the sync service</span>
        </label>
        <input
          id="api-key"
          type="password"
          class="setting-input"
          bind:value={settings.syncApiKey}
          placeholder="Enter your API key"
        />
      </div>
      
      <div class="setting-actions">
        <button 
          class="test-btn" 
          onclick={testConnection}
          disabled={testStatus === "testing"}
        >
          <i class={`fas ${testStatus === "testing" ? "fa-spinner fa-spin" : "fa-plug"}`}></i>
          <span>{testStatus === "testing" ? "Testing..." : "Test Connection"}</span>
        </button>
        
        {#if testMessage}
          <div class="test-result" class:success={testStatus === "success"} class:error={testStatus === "error"}>
            {testMessage}
          </div>
        {/if}
      </div>
      
      <div class="setting-group">
        <label class="setting-checkbox">
          <input
            type="checkbox"
            bind:checked={settings.autoSyncEnabled}
          />
          <span>Enable automatic sync</span>
          <span class="checkbox-hint">Automatically sync changes to the server</span>
        </label>
      </div>
      
      {#if settings.autoSyncEnabled}
        <div class="setting-group">
          <label for="sync-interval" class="setting-label">
            Sync Interval
            <span class="label-hint">Time between automatic syncs (seconds)</span>
          </label>
          <input
            id="sync-interval"
            type="number"
            class="setting-input small"
            bind:value={settings.autoSyncInterval}
            min="60"
            max="3600"
            step="60"
          />
          <span class="input-suffix">{Math.floor(settings.autoSyncInterval / 60)} minutes</span>
        </div>
      {/if}
    </section>
    
    <!-- Restore Behavior Section -->
    <section class="settings-section">
      <div class="section-header">
        <i class="fas fa-folder-open section-icon"></i>
        <h2>Restore Behavior</h2>
      </div>
      
      <div class="setting-group">
        <label class="setting-checkbox">
          <input
            type="checkbox"
            bind:checked={settings.confirmBeforeRestore}
          />
          <span>Confirm before restoring</span>
          <span class="checkbox-hint">Show confirmation dialog when restoring stashes</span>
        </label>
      </div>
      
      <div class="setting-group">
        <label for="restore-target" class="setting-label">
          Default restore location
        </label>
        <select
          id="restore-target"
          class="setting-select"
          bind:value={settings.defaultRestoreBehavior}
        >
          <option value="current-window">Current window</option>
          <option value="new-window">New window</option>
        </select>
      </div>
      
      <div class="setting-group">
        <label class="setting-checkbox">
          <input
            type="checkbox"
            bind:checked={settings.deleteUnpinnedOnRestore}
          />
          <span>Delete unpinned stashes after restore</span>
          <span class="checkbox-hint">Pinned stashes are always kept after restore</span>
        </label>
      </div>
    </section>
    
    <!-- About Section -->
    <section class="settings-section">
      <div class="section-header">
        <i class="fas fa-info-circle section-icon"></i>
        <h2>About</h2>
      </div>
      
      <div class="about-content">
        <div class="about-row">
          <span class="about-label">Extension Version</span>
          <span class="about-value">2025.6.10.04</span>
        </div>
        <div class="about-row">
          <span class="about-label">Total Stashes</span>
          <span class="about-value">{syncStore.lists.length}</span>
        </div>
        <div class="about-row">
          <span class="about-label">Total Tabs Saved</span>
          <span class="about-value">
            {syncStore.lists.reduce((sum, list) => sum + (list.tabs?.length || 0), 0)}
          </span>
        </div>
      </div>
    </section>
  </div>
  
  <footer class="settings-footer">
    <button class="reset-btn" onclick={resetToDefaults}>
      <i class="fas fa-undo"></i>
      <span>Reset to Defaults</span>
    </button>
    
    <button 
      class="save-btn" 
      onclick={saveSettings}
      disabled={saveStatus === "saving"}
    >
      <i class={`fas ${saveStatus === "saving" ? "fa-spinner fa-spin" : "fa-save"}`}></i>
      <span>
        {#if saveStatus === "saving"}
          Saving...
        {:else if saveStatus === "success"}
          Saved!
        {:else}
          Save Settings
        {/if}
      </span>
    </button>
  </footer>
</div>

<style>
  .settings-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #141517;
  }
  
  .settings-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    border-bottom: 1px solid #2c2e33;
    background: #1a1b1e;
  }
  
  .back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: #25262b;
    border: 1px solid #2c2e33;
    border-radius: 8px;
    color: #c1c2c5;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .back-btn:hover {
    background: #2c2e33;
    color: #e4e4e7;
  }
  
  .settings-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #e4e4e7;
    margin: 0;
  }
  
  .settings-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }
  
  .settings-section {
    background: #1a1b1e;
    border: 1px solid #2c2e33;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #2c2e33;
  }
  
  .section-icon {
    color: #ff922b;
    font-size: 1.25rem;
  }
  
  .section-header h2 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #e4e4e7;
    margin: 0;
  }
  
  .setting-group {
    margin-bottom: 20px;
  }
  
  .setting-group:last-child {
    margin-bottom: 0;
  }
  
  .setting-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #e4e4e7;
    margin-bottom: 8px;
  }
  
  .label-hint {
    display: block;
    font-size: 0.8125rem;
    font-weight: 400;
    color: #909296;
    margin-top: 4px;
  }
  
  .setting-input,
  .setting-select {
    width: 100%;
    padding: 10px 14px;
    background: #25262b;
    border: 1px solid #2c2e33;
    border-radius: 8px;
    color: #e4e4e7;
    font-size: 0.875rem;
    transition: all 0.2s;
  }
  
  .setting-input:focus,
  .setting-select:focus {
    outline: none;
    background: #2c2e33;
    border-color: #ff922b;
    box-shadow: 0 0 0 3px rgba(255, 146, 43, 0.1);
  }
  
  .setting-input.small {
    width: 120px;
  }
  
  .input-suffix {
    margin-left: 12px;
    font-size: 0.875rem;
    color: #909296;
  }
  
  .setting-checkbox {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    padding: 12px;
    border-radius: 8px;
    transition: background 0.2s;
  }
  
  .setting-checkbox:hover {
    background: #25262b;
  }
  
  .setting-checkbox input[type="checkbox"] {
    margin-top: 2px;
    cursor: pointer;
  }
  
  .setting-checkbox > span:first-of-type {
    flex: 1;
    font-size: 0.875rem;
    font-weight: 500;
    color: #e4e4e7;
  }
  
  .checkbox-hint {
    display: block;
    font-size: 0.8125rem;
    font-weight: 400;
    color: #909296;
    margin-top: 4px;
  }
  
  .setting-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
    flex-wrap: wrap;
  }
  
  .test-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(77, 171, 247, 0.15);
    border: 1px solid rgba(77, 171, 247, 0.3);
    border-radius: 8px;
    color: #4dabf7;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .test-btn:hover:not(:disabled) {
    background: rgba(77, 171, 247, 0.25);
  }
  
  .test-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .test-result {
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .test-result.success {
    background: rgba(64, 192, 87, 0.15);
    color: #40c057;
    border: 1px solid rgba(64, 192, 87, 0.3);
  }
  
  .test-result.error {
    background: rgba(250, 82, 82, 0.15);
    color: #fa5252;
    border: 1px solid rgba(250, 82, 82, 0.3);
  }
  
  .about-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .about-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #25262b;
    border-radius: 8px;
  }
  
  .about-label {
    font-size: 0.875rem;
    color: #909296;
  }
  
  .about-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #e4e4e7;
  }
  
  .settings-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-top: 1px solid #2c2e33;
    background: #1a1b1e;
  }
  
  .reset-btn,
  .save-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .reset-btn {
    background: transparent;
    border: 1px solid #2c2e33;
    color: #909296;
  }
  
  .reset-btn:hover {
    background: #25262b;
    color: #c1c2c5;
  }
  
  .save-btn {
    background: linear-gradient(135deg, #ff922b 0%, #ff6b35 100%);
    border: none;
    color: #ffffff;
  }
  
  .save-btn:hover:not(:disabled) {
    box-shadow: 0 4px 12px rgba(255, 146, 43, 0.4);
    transform: translateY(-1px);
  }
  
  .save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
