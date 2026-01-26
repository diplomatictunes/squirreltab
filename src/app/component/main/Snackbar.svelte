<script>
  import { rawStore } from "../../store/syncStore";
  import { fade } from "svelte/transition";

  // We'll use a local state for the snackbar derived from rawStore or manage it here
  let snackbar = $derived($rawStore.snackbar || { status: false, msg: "" });

  const close = () => {
    rawStore.update((s) => ({ ...s, snackbar: { status: false, msg: "" } }));
  };

  $effect(() => {
    if (snackbar.status) {
      setTimeout(close, 3000);
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
