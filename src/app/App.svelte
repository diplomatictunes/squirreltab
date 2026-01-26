<script>
  import { onMount } from "svelte";
  import { lists, pinnedLists, taggedLists, opts } from "./store/syncStore";
  import DetailList from "./page/main/DetailList.svelte";
  import Snackbar from "./component/main/Snackbar.svelte";
  import Toolbar from "./component/main/Toolbar.svelte";
  import Drawer from "./component/main/Drawer.svelte";
  import { logger } from "../common/logger.svelte.js";

  let drawerOpen = $state(false);
  let currentView = $state("all");

  onMount(() => {
    // Check for popup context and add the class to the html/body
    if (
      new URLSearchParams(window.location.search).get("context") === "popup" ||
      window.location.pathname.endsWith("popup.html")
    ) {
      document.documentElement.classList.add("icetab-popup");
    }
  });

  let activeLists = $derived.by(() => {
    if (currentView === "pinned") return $pinnedLists;
    if (currentView.startsWith("tag:")) {
      const tag = currentView.split(":")[1];
      return $taggedLists[tag] || [];
    }
    return $lists;
  });

  let viewTitle = $derived.by(() => {
    if (currentView === "pinned") return "Pinned Lists";
    if (currentView.startsWith("tag:"))
      return `Tag: ${currentView.split(":")[1]}`;
    return "All Tab Lists";
  });
</script>

<div class="app" class:dark={$opts.nightmode}>
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

<style>
  :global(body) {
    margin: 0;
    font-family:
      "Inter",
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      sans-serif;
    background: #f9fafb;
    color: #111827;
  }

  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .app.dark {
    background: #111827;
    color: #f9fafb;
  }

  main {
    flex: 1;
    padding-top: 20px;
  }

  :global(.icetab-popup) {
    width: 600px;
    height: 600px;
  }

  .options-page {
    padding: 20px;
  }
  .debug-panel pre {
    background: #e2e8f0;
    padding: 10px;
    max-height: 400px;
    overflow: auto;
    border-radius: 4px;
    font-size: 12px;
    white-space: pre-wrap;
  }
  .app.dark .debug-panel pre {
    background: #1f2937;
    color: #e5e7eb;
  }
  .debug-panel .controls {
    margin-bottom: 10px;
  }
  .debug-panel button {
    margin-right: 10px;
    padding: 6px 12px;
    background: #06b6d4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .debug-panel button:hover {
    background: #0891b2;
  }
</style>
