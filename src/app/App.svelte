<script>
  import { onMount } from "svelte";
  import { syncStore } from "./store/syncStore.svelte.js"; // Data source
  import DetailList from "./page/main/DetailList.svelte";
  import Snackbar from "./component/main/Snackbar.svelte";
  import Toolbar from "./component/main/Toolbar.svelte";
  import Drawer from "./component/main/Drawer.svelte";
  import { logger } from "../common/logger.svelte.js";

  // 1. Use $state rune, not state()
  let drawerOpen = $state(true);
  let currentView = $state("all");

  onMount(() => {
    if (
      new URLSearchParams(window.location.search).get("context") === "popup" ||
      window.location.pathname.endsWith("popup.html")
    ) {
      document.documentElement.classList.add("icetab-popup");
    }
  });

  // 2. Use $derived.by rune and reference syncStore properties
  let activeLists = $derived.by(() => {
    if (currentView === "pinned") return syncStore.pinnedLists;
    if (currentView.startsWith("tag:")) {
      const tag = currentView.split(":")[1];
      return syncStore.taggedLists[tag] || [];
    }
    return syncStore.lists;
  });

  let viewTitle = $derived.by(() => {
    if (currentView === "pinned") return "Pinned Lists";
    if (currentView.startsWith("tag:")) {
      return `Tag: ${currentView.split(":")[1]}`; // Corrected string interpolation
    }
    return "All Tab Lists";
  });
</script>

<div class="app" class:dark={syncStore.opts.nightmode}>
  <Toolbar onToggleDrawer={() => (drawerOpen = !drawerOpen)} />
  <Drawer bind:open={drawerOpen} onSetView={(view) => (currentView = view)} />

  <main>
    {#if currentView === "options"}
      <div class="options-page">
        <h2>Options</h2>
        <div class="debug-panel">
          <h3>Debug Logs ({logger.entries.length})</h3>
          <div class="controls">
            <button
              onclick={() => {
                const text = JSON.stringify(logger.entries, null, 2);
                navigator.clipboard.writeText(text);
                alert("Logs copied to clipboard");
              }}>Copy Logs for Support</button
            >
            <button onclick={() => logger.clear()}>Clear</button>
          </div>
          <pre>{JSON.stringify(logger.entries.slice().reverse(), null, 2)}</pre>
        </div>
      </div>
    {:else}
      <DetailList lists={activeLists} title={viewTitle} />
    {/if}
  </main>

  <Snackbar />
</div>
