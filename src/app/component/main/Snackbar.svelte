<script>
  import { syncStore } from "../../store/syncStore.svelte.js";
  import { fade, fly } from "svelte/transition";

  let snackbar = $derived(syncStore.snackbar || { status: false, msg: "" });

  const close = () => {
    syncStore.updateSnackbar({ status: false, msg: "" });
  };

  $effect(() => {
    if (snackbar.status) {
      const timer = setTimeout(close, 3000);
      return () => clearTimeout(timer);
    }
  });
</script>

{#if snackbar.status}
  <div class="snackbar" transition:fly={{ y: 20, duration: 300 }} role="alert">
    <div class="snackbar-content">
      <i class="fas fa-check-circle snackbar-icon"></i>
      <span class="snackbar-message">{snackbar.msg}</span>
      <button
        class="snackbar-close"
        onclick={close}
        aria-label="Close notification"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
{/if}

<style>
  .snackbar {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2000;
    max-width: 500px;
    width: calc(100% - 48px);
  }

  .snackbar-content {
    display: flex;
    align-items: center;
    gap: 12px;
    background: linear-gradient(135deg, #1a1b1e 0%, #25262b 100%);
    color: #e4e4e7;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.05);
    border: 1px solid #2c2e33;
  }

  .snackbar-icon {
    color: #40c057;
    font-size: 1.125rem;
  }

  .snackbar-message {
    flex: 1;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .snackbar-close {
    background: transparent;
    border: none;
    color: #5c5f66;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .snackbar-close:hover {
    background: #2c2e33;
    color: #909296;
  }
</style>
