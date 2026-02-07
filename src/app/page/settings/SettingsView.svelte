<script>
  import browser from "webextension-polyfill";
  import { syncStore } from "../../store/syncStore.svelte.js";
  import CustomSync from "@/common/service/custom-sync";
  import optionsCatalog from "@/common/options";
  import { normalizeDomain } from "@/common/utils";

  let { onBack } = $props();

  const canonicalOptionKeys = Object.keys(optionsCatalog.getDefaultOptions());
  // Only persist canonical option keys so storage never accrues unsupported drift.
  const stripUnsupportedOptionKeys = (raw) => {
    if (!raw) return {};
    const sanitized = {};
    for (const key of canonicalOptionKeys) {
      if (Object.prototype.hasOwnProperty.call(raw, key)) {
        sanitized[key] = raw[key];
      }
    }
    return sanitized;
  };

  // Settings state
  let settings = $state({
    syncBaseUrl: "",
    syncApiKey: "",
    autoSyncEnabled: false,
    autoSyncInterval: 300, // seconds
    aiNameSuggestions: false,
    aiExcludedDomainsInput: "",
  });

  let saveStatus = $state(null); // "saving" | "success" | "error"
  let testStatus = $state(null); // "testing" | "success" | "error"
  let testMessage = $state("");

  // Load settings on mount
  $effect(() => {
    loadSettings();
  });

  const parseExcludedDomainsInput = (raw) => {
    if (typeof raw !== "string") return [];
    const tokens = raw
      .split(/\r?\n/)
      .map((domain) => normalizeDomain(domain))
      .filter(Boolean);
    return Array.from(new Set(tokens));
  };

  const stringifyExcludedDomains = (domains) => {
    if (!Array.isArray(domains) || domains.length === 0) return "";
    return domains.join("\n");
  };

  async function loadSettings() {
    const opts = await browser.storage.local.get("opts");
    const storedOpts = stripUnsupportedOptionKeys(opts.opts);
    settings.syncBaseUrl = storedOpts.syncBaseUrl || "http://localhost:8000";
    settings.syncApiKey = storedOpts.syncApiKey || "";
    settings.autoSyncEnabled = storedOpts.autoSyncEnabled ?? false;
    settings.autoSyncInterval = storedOpts.autoSyncInterval || 300;
    settings.aiNameSuggestions = storedOpts.aiNameSuggestions ?? false;
    settings.aiExcludedDomainsInput = stringifyExcludedDomains(
      storedOpts.aiExcludedDomains || [],
    );
  }

  async function saveSettings() {
    saveStatus = "saving";
    try {
      const opts = await browser.storage.local.get("opts");
      const canonicalExisting = stripUnsupportedOptionKeys(opts.opts);
      const updatedOpts = {
        ...canonicalExisting,
        syncBaseUrl: settings.syncBaseUrl.trim(),
        syncApiKey: settings.syncApiKey.trim(),
        autoSyncEnabled: settings.autoSyncEnabled,
        autoSyncInterval: settings.autoSyncInterval,
        aiNameSuggestions: settings.aiNameSuggestions,
        aiExcludedDomains: parseExcludedDomainsInput(
          settings.aiExcludedDomainsInput,
        ),
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
      const canonicalExisting = stripUnsupportedOptionKeys(opts.opts);
      const tempOpts = {
        ...canonicalExisting,
        syncBaseUrl: settings.syncBaseUrl.trim(),
        syncApiKey: settings.syncApiKey.trim(),
      };
      await browser.storage.local.set({ opts: tempOpts });

      const health = await CustomSync.health();
      testStatus = "success";
      testMessage =
        "\u2713 Connected to " +
        (health.service || "sync service") +
        " v" +
        (health.version || "?");
      setTimeout(() => {
        testStatus = null;
        testMessage = "";
      }, 5000);
    } catch (error) {
      testStatus = "error";
      if (error.code === "offline") {
        testMessage =
          "\u2717 Cannot reach server. Check URL and network connection.";
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
    settings.autoSyncEnabled = false;
    settings.autoSyncInterval = 300;
    settings.aiNameSuggestions = false;
    settings.aiExcludedDomainsInput = "";
  }
</script>

<div class="settings-page">
  <div class="page-header">
    <button class="back-nav" onclick={onBack}>
      <span>←</span>
      Settings
    </button>
  </div>

  <div class="settings-content">
    <!-- Sync Configuration Section -->
    <div class="settings-section">
      <h2 class="section-title">Sync Configuration</h2>

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">Sync server URL</div>
          <input
            type="text"
            class="setting-input"
            bind:value={settings.syncBaseUrl}
            placeholder="http://localhost:8000"
          />
        </div>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">API key</div>
          <input
            type="password"
            class="setting-input"
            bind:value={settings.syncApiKey}
            placeholder="Enter your API key"
          />
        </div>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">Automatic Sync</div>
          <div class="setting-description">
            {#if settings.autoSyncEnabled}
              Syncs every {Math.floor(settings.autoSyncInterval / 60)} minutes
            {:else}
              Disabled
            {/if}
          </div>
        </div>
        <div
          class="toggle-switch"
          class:active={settings.autoSyncEnabled}
          onclick={() => (settings.autoSyncEnabled = !settings.autoSyncEnabled)}
        ></div>
      </div>

      {#if settings.autoSyncEnabled}
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-label">Sync Interval (Seconds)</div>
            <input
              type="number"
              class="setting-input small-input"
              bind:value={settings.autoSyncInterval}
              min="60"
              max="3600"
              step="60"
            />
          </div>
        </div>
      {/if}

      <div style="margin-top: 16px;">
        <button
          class="action-button btn-primary"
          onclick={testConnection}
          disabled={testStatus === "testing"}
        >
          {testStatus === "testing" ? "Testing..." : "Test Connection"}
        </button>

        {#if testMessage}
          <div
            class="test-result"
            class:success={testStatus === "success"}
            class:error={testStatus === "error"}
          >
            {testMessage}
          </div>
        {/if}
      </div>
    </div>

    <!-- AI & Privacy Section -->
    <div class="settings-section">
      <h2 class="section-title">AI & Privacy</h2>

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">Enable AI naming suggestions</div>
          <div class="setting-description">
            AI-generated list names are optional and only run when enabled
          </div>
        </div>
        <div
          class="toggle-switch"
          class:active={settings.aiNameSuggestions}
          onclick={() =>
            (settings.aiNameSuggestions = !settings.aiNameSuggestions)}
        ></div>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">Excluded Domains</div>
          <div class="setting-description">
            Tabs from these domains will never be shared with AI services
          </div>
          <textarea
            class="setting-input"
            rows="4"
            bind:value={settings.aiExcludedDomainsInput}
            placeholder="example.com&#10;internal.company"
            style="margin-top: 8px;"
          ></textarea>
          <div
            class="setting-description"
            style="margin-top: 6px; font-size: 12px;"
          >
            Enter one domain per line. Subdomains are also excluded.
          </div>
        </div>
      </div>

      <div class="privacy-note">
        <i class="fas fa-info-circle"></i>
        <span>
          Naming and tagging suggestions will disclose how many tabs were used
          (and how many were excluded for privacy).
        </span>
      </div>
    </div>

    <!-- About / Diagnostics Section -->
    <div class="settings-section">
      <h2 class="section-title">About / Diagnostics</h2>

      <div class="diagnostics-box">
        <div class="diagnostics-title">Extension Version 2025.6.10.04</div>
        <div class="diagnostics-status">
          Total Stashes: {syncStore.lists.length}
        </div>
        <div class="diagnostics-status">
          Total Tabs Saved: {syncStore.lists.reduce(
            (sum, list) => sum + (list.tabs?.length || 0),
            0,
          )}
        </div>

        <div class="diagnostic-actions">
          <button class="action-button btn-danger" onclick={resetToDefaults}
            >Reset to Defaults</button
          >
          <button
            class="action-button btn-secondary"
            onclick={saveSettings}
            disabled={saveStatus === "saving"}
          >
            {#if saveStatus === "saving"}
              Saving...
            {:else if saveStatus === "success"}
              Saved!
            {:else}
              Save Settings
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .settings-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 20px;
    font-family:
      "Work Sans",
      -apple-system,
      sans-serif;
  }

  .page-header {
    background: #ffffff;
    padding: 20px 28px;
    border-radius: 12px 12px 0 0;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .back-nav {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #64748b;
    background: none;
    border: none;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s;
    padding: 0;
  }

  .back-nav:hover {
    color: #0f172a;
  }

  .settings-content {
    background: #ffffff;
    border-radius: 0 0 12px 12px;
  }

  .settings-section {
    padding: 28px;
    border-bottom: 1px solid #e2e8f0;
  }

  .settings-section:last-child {
    border-bottom: none;
  }

  .section-title {
    font-family: "Manrope", sans-serif;
    font-weight: 700;
    font-size: 18px;
    color: #0f172a;
    margin: 0 0 20px 0;
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    border-bottom: 1px solid #e2e8f0;
  }

  .setting-row:last-child {
    border-bottom: none;
  }

  .setting-info {
    flex: 1;
  }

  .setting-label {
    font-weight: 600;
    font-size: 14px;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .setting-description {
    font-size: 13px;
    color: #64748b;
  }

  .setting-input {
    width: 100%;
    max-width: 400px;
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-family: "Work Sans", sans-serif;
    font-size: 14px;
    margin-top: 8px;
    transition: all 0.2s;
    background: #ffffff;
    color: #0f172a;
  }

  .setting-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .small-input {
    max-width: 80px;
    text-align: center;
  }

  textarea.setting-input {
    resize: vertical;
    min-height: 100px;
    font-family: "Work Sans", sans-serif;
  }

  .toggle-switch {
    position: relative;
    width: 48px;
    height: 26px;
    background: #cbd5e1;
    border-radius: 13px;
    cursor: pointer;
    transition: background 0.3s;
    flex-shrink: 0;
  }

  .toggle-switch.active {
    background: #2563eb;
  }

  .toggle-switch::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .toggle-switch.active::after {
    transform: translateX(22px);
  }

  .action-button {
    padding: 10px 20px;
    border-radius: 8px;
    font-family: "Work Sans", sans-serif;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-danger {
    background: #ef4444;
    color: white;
  }

  .btn-danger:hover {
    background: #dc2626;
  }

  .btn-secondary {
    background: #f8fafc;
    color: #0f172a;
    border: 1px solid #e2e8f0;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #e2e8f0;
  }

  .btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .test-result {
    display: inline-block;
    margin-left: 12px;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
  }

  .test-result.success {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }

  .test-result.error {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .privacy-note {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    border-radius: 8px;
    background: rgba(37, 99, 235, 0.08);
    border: 1px dashed rgba(37, 99, 235, 0.3);
    color: #1e40af;
    font-size: 13px;
    margin-top: 16px;
  }

  .privacy-note i {
    margin-top: 2px;
    color: #2563eb;
  }

  .diagnostics-box {
    background: #f8fafc;
    border-radius: 8px;
    padding: 16px;
  }

  .diagnostics-title {
    font-family: "Manrope", sans-serif;
    font-weight: 700;
    font-size: 14px;
    color: #0f172a;
    margin-bottom: 12px;
  }

  .diagnostics-status {
    font-size: 13px;
    color: #64748b;
    margin-bottom: 4px;
  }

  .diagnostic-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
</style>
