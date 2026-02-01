<script>
  import { syncStore } from "./store/syncStore.svelte.js";
  import Drawer from "./component/main/Drawer.svelte";
  import Toolbar from "./component/main/Toolbar.svelte";
  import DetailList from "./page/main/DetailList.svelte";
  import SettingsView from "./page/settings/SettingsView.svelte";
  import Snackbar from "./component/main/Snackbar.svelte";

  let drawerOpen = $state(false);
  let activeView = $state("all");

  function handleViewChange(view) {
    activeView = view;
    drawerOpen = false;
  }
</script>

<div class="app">
  <Toolbar
    onToggleDrawer={() => (drawerOpen = !drawerOpen)}
    onOpenSettings={() => {
      activeView = "options";
      drawerOpen = false;
    }}
  />

  <Drawer bind:open={drawerOpen} onSetView={handleViewChange} />

  <main class="main-content">
    {#if activeView === "options"}
      <SettingsView onBack={() => (activeView = "all")} />
    {:else}
      <DetailList {activeView} />
    {/if}
  </main>

  <Snackbar />
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    background: #141517;
    color: #e4e4e7;
    overflow: hidden;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #141517;
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* Custom Scrollbar */
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
