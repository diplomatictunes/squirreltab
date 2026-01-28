<script>
  import { syncStore } from "../../store/syncStore.svelte.js"
  import { SYNC_PHASES } from "@/common/constants"

  let syncMeta = $derived(syncStore.syncStatus)

  const phaseConfig = {
    [SYNC_PHASES.SYNCED]: {
      label: "Synced",
      icon: "fa-check",
      class: "success",
    },
    [SYNC_PHASES.SYNCING]: {
      label: "Syncing...",
      icon: "fa-sync",
      class: "syncing",
    },
    [SYNC_PHASES.AUTH_ERROR]: {
      label: "Auth Failed",
      icon: "fa-lock",
      class: "error",
    },
    [SYNC_PHASES.OFFLINE]: {
      label: "Offline",
      icon: "fa-wifi",
      class: "warning",
    },
    [SYNC_PHASES.SERVER_ERROR]: {
      label: "Sync Error",
      icon: "fa-exclamation-triangle",
      class: "error",
    },
    [SYNC_PHASES.LOCAL_ONLY]: {
      label: "Local Only",
      icon: "fa-hdd",
      class: "neutral",
    },
    [SYNC_PHASES.NEVER_SYNCED]: {
      label: "Not Synced",
      icon: "fa-circle",
      class: "neutral",
    },
    [SYNC_PHASES.IDLE]: {
      label: "Idle",
      icon: "fa-circle",
      class: "neutral",
    },
  }

  let config = $derived(phaseConfig[syncMeta.phase] || phaseConfig[SYNC_PHASES.LOCAL_ONLY])
  let isRetryVisible = $derived(
    syncMeta.phase === SYNC_PHASES.AUTH_ERROR || syncMeta.phase === SYNC_PHASES.SERVER_ERROR
  )
</script>

<div class={`sync-badge ${config.class}`} title={syncMeta.error?.message || config.label}>
  <span class={`icon ${syncMeta.syncing ? "spin" : ""}`}>
    <i class={`fas ${config.icon}`}></i>
  </span>
  <span class="label">{config.label}</span>
  {#if syncMeta.pendingRetry}
    <span class="retry-indicator" title="Retry scheduled">
      <i class="fas fa-sync"></i>
    </span>
  {/if}
</div>

{#if isRetryVisible}
  <button class="retry-btn" onclick={() => syncStore.manualRetry()}>
    Retry Sync
  </button>
{/if}

<style>
  .sync-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 14px;
    font-size: 0.85rem;
    font-weight: 600;
    border: 1px solid transparent;
    transition: all 0.2s ease;
  }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .icon.spin {
    animation: spin 1s linear infinite;
  }

  .success {
    background: rgba(64, 192, 87, 0.12);
    border-color: rgba(64, 192, 87, 0.4);
    color: #40c057;
  }

  .syncing {
    background: rgba(77, 171, 247, 0.12);
    border-color: rgba(77, 171, 247, 0.4);
    color: #4dabf7;
  }

  .error {
    background: rgba(250, 82, 82, 0.12);
    border-color: rgba(250, 82, 82, 0.4);
    color: #fa5252;
  }

  .warning {
    background: rgba(255, 192, 120, 0.12);
    border-color: rgba(255, 192, 120, 0.4);
    color: #ffc078;
  }

  .neutral {
    background: rgba(156, 163, 175, 0.12);
    border-color: rgba(156, 163, 175, 0.4);
    color: #9195a1;
  }

  .retry-indicator {
    display: inline-flex;
    align-items: center;
    color: inherit;
    opacity: 0.7;
    animation: pulse 1.6s ease-in-out infinite;
  }

  .retry-btn {
    margin-left: 12px;
    padding: 6px 14px;
    border-radius: 999px;
    border: 1px solid rgba(250, 82, 82, 0.4);
    background: transparent;
    color: #fa5252;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .retry-btn:hover {
    background: rgba(250, 82, 82, 0.1);
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
  }
</style>

