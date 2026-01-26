<script>
  import { syncStore } from "../../store/syncStore.svelte.js";
  import { fade } from "svelte/transition";

  // Use reactive state from syncStore (assuming syncStore has snackbar state or adding it)
  // For now, let's assume we need to add snackbar support to syncStore or use a local store approach properly.
  // Since rawStore was not defined, we'll create a simple local store export or rely on syncStore if we add it.

  // NOTE: Original code referenced `rawStore` which is undefined.
  // We will assume `syncStore` should handle global snackbar state.
  // Let's verify if `syncStore` has snackbar properties. It didn't in the previous view.
  // We should add it to `syncStore` to make this work globally.

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
  <div class="snackbar" transition:fade>
    {snackbar.msg}
  </div>
{/if}

<style>
  .snackbar {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 2000;
    font-size: 0.875rem;
  }
</style>
