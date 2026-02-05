<script>
  import { syncStore } from "../../store/syncStore.svelte.js";
  import { fade, slide } from "svelte/transition";
  import browser from "webextension-polyfill";
  import SyncStatusBadge from "../../component/sync/SyncStatusBadge.svelte";

  // -- LOGIC / STATE (Assumed existing handlers) --
  // We mecessary logic from DetailList to make this functional
  // in the current codebase without breaking changes.

  let filterQuery = $state("");
  let expandedLists = $state(new Set());

  // Lists from store
  let lists = $derived(syncStore.lists);
  let pinnedLists = $derived(syncStore.pinnedLists);

  // Simple search filter
  const matchFilter = (list) => {
    if (!filterQuery.trim()) return true;
    const needle = filterQuery.trim().toLowerCase();
    return (
      (list.title || "").toLowerCase().includes(needle) ||
      (list.tags || []).some((t) => t.toLowerCase().includes(needle))
    );
  };

  // Derived visible lists (Priority: Pinned at top if no search, or just standard sort)
  // Requirement: "Search-first layout", "Calm list"
  // We'll just show all lists, sorted by time, filtering by search.
  // Pinned items could be marked visually or bubbled to top.
  let visibleLists = $derived.by(() => {
    let result = lists.filter(matchFilter);
    // Sort by time descending
    result.sort((a, b) => (b.time || 0) - (a.time || 0));
    return result;
  });

  // Handlers
  function toggleExpand(id) {
    const newSet = new Set(expandedLists);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    expandedLists = newSet;
  }

  function handleStashClick(e, id) {
    // Prevent toggling if clicking inputs/buttons
    if (e.target.closest("button, input, a")) return;
    toggleExpand(id);
  }

  async function handleRestore(list) {
    if (!confirm("Restore tabs?")) return;
    await syncStore.restoreList(list._id, false);
  }

  async function handleDelete(list) {
    if (!confirm("Delete stash?")) return;
    await syncStore.removeList(list._id);
  }

  function togglePin(list) {
    syncStore.pinList(list._id, !list.pinned);
  }

  function removeTab(list, tabIndex) {
    const updatedTabs = list.tabs.filter((_, i) => i !== tabIndex);
    if (updatedTabs.length === 0) syncStore.removeList(list._id);
    else syncStore.updateList(list._id, { tabs: updatedTabs });
  }

  function updateTitle(list, newTitle) {
    syncStore.updateList(list._id, { title: newTitle });
  }
</script>

<div class="stash-layout">
  <!-- 1. Search-first layout -->
  <header class="header">
    <div class="search-container">
      <i class="fas fa-search search-icon"></i>
      <input
        type="text"
        placeholder="Search..."
        bind:value={filterQuery}
        class="search-input"
      />
    </div>
    <div class="sync-status">
      <SyncStatusBadge />
    </div>
  </header>

  <!-- 2. Calm list of stash cards -->
  <main class="list-container">
    {#if visibleLists.length === 0}
      <div class="empty-state" transition:fade>
        <span>No stashes found</span>
      </div>
    {/if}

    {#each visibleLists as list (list._id)}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div
        class="card"
        role="article"
        class:expanded={expandedLists.has(list._id)}
        onclick={(e) => handleStashClick(e, list._id)}
      >
        <div class="card-summary">
          <div class="card-main">
            <!-- Title -->
            <input
              type="text"
              class="card-title"
              value={list.title || "Untitled Stash"}
              onblur={(e) => updateTitle(list, e.target.value)}
              onclick={(e) => e.stopPropagation()}
            />

            <!-- Metadata Line -->
            <div class="card-meta">
              {#if list.pinned}<i class="fas fa-thumbtack pinned-icon"></i>{/if}
              <span>{list.tabs?.length || 0} tabs</span>
              <span class="separator">·</span>
              <span
                >{new Date(list.time).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}</span
              >
              {#if list.tags && list.tags.length}
                <span class="separator">·</span>
                <span class="tags">
                  {#each list.tags as tag}
                    <span class="tag">#{tag}</span>
                  {/each}
                </span>
              {/if}
            </div>
          </div>

          <!-- Actions (Hidden until hover) -->
          <div class="card-actions">
            <button
              class="icon-btn"
              onclick={() => togglePin(list)}
              title={list.pinned ? "Unpin" : "Pin"}
            >
              <i class="fas fa-thumbtack" style:opacity={list.pinned ? 1 : 0.5}
              ></i>
            </button>
            <button
              class="icon-btn"
              onclick={() => handleRestore(list)}
              title="Restore"
            >
              <i class="fas fa-box-open"></i>
            </button>
            <button
              class="icon-btn danger"
              onclick={() => handleDelete(list)}
              title="Delete"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <!-- Expanded Content (Tabs) -->
        {#if expandedLists.has(list._id)}
          <div class="card-details" transition:slide={{ duration: 200 }}>
            {#each list.tabs || [] as tab, idx}
              <div class="tab-row">
                <img
                  src={tab.favIconUrl}
                  class="tab-icon"
                  alt=""
                  onerror={(e) => (e.target.style.display = "none")}
                />
                <a
                  href={tab.url}
                  target="_blank"
                  class="tab-link"
                  onclick={(e) => e.stopPropagation()}
                >
                  {tab.title}
                </a>
                <button
                  class="tab-remove"
                  onclick={() => removeTab(list, idx)}
                  title="Remove tab"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </main>
</div>

<style>
  /* Layout & Spacing */
  .stash-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #141517;
    color: #e4e4e7;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      sans-serif;
  }

  .header {
    padding: 32px 32px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    flex-shrink: 0;
  }

  .search-container {
    width: 100%;
    max-width: 600px;
    position: relative;
  }

  .search-input {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1px solid #27272a;
    padding: 12px 0 12px 32px; /* space for icon */
    font-size: 16px; /* Size 1 */
    color: #e4e4e7;
    outline: none;
    transition: border-color 0.2s;
  }

  .search-input::placeholder {
    color: #52525b;
  }
  .search-input:focus {
    border-bottom-color: #52525b;
  }

  .search-icon {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    color: #52525b;
    font-size: 14px;
    pointer-events: none;
  }

  .list-container {
    flex: 1;
    overflow-y: auto;
    padding: 0 32px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px; /* Breathing room */
  }

  .empty-state {
    padding-top: 64px;
    color: #52525b;
    font-size: 14px;
  }

  /* Card Styles */
  .card {
    width: 100%;
    max-width: 700px;
    border-radius: 8px; /* Subtle radius */
    padding: 16px;
    transition: background-color 0.2s;
    cursor: pointer;
  }

  .card:hover {
    background-color: #18191c; /* Subtle hover state */
  }

  .card.expanded {
    background-color: #1a1b1e;
  }

  .card-summary {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .card-main {
    flex: 1;
    min-width: 0;
  }

  /* Typography */
  .card-title {
    background: transparent;
    border: none;
    color: #e4e4e7;
    font-size: 16px; /* Size 1 */
    font-weight: 500;
    width: 100%;
    outline: none;
    padding: 0;
    margin: 0 0 4px 0;
    cursor: text;
  }

  .card-title:hover {
    text-decoration: underline;
    text-decoration-color: #3f3f46;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #71717a; /* Secondary text */
    font-size: 12px; /* Size 2 */
  }

  .separator {
    opacity: 0.5;
  }
  .pinned-icon {
    color: #ff922b;
    font-size: 10px;
  } /* Accent */

  .tag {
    color: #a1a1aa;
  }

  /* Actions */
  .card-actions {
    display: flex;
    gap: 8px;
    opacity: 0; /* Hidden by default */
    transform: translateX(10px);
    transition: all 0.2s ease;
  }

  .card:hover .card-actions,
  .card:focus-within .card-actions {
    opacity: 1;
    transform: translateX(0);
  }

  .icon-btn {
    background: transparent;
    border: none;
    color: #71717a;
    cursor: pointer;
    padding: 4px;
    font-size: 14px;
    transition: color 0.1s;
  }

  .icon-btn:hover {
    color: #e4e4e7;
  }
  .icon-btn.danger:hover {
    color: #ef4444;
  }

  /* Expanded Details */
  .card-details {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #27272a;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tab-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 13px; /* Size slightly smaller than 14 */
  }

  .tab-row:hover {
    background: #27272a;
  }

  .tab-icon {
    width: 14px;
    height: 14px;
    opacity: 0.8;
  }

  .tab-link {
    color: #d4d4d8;
    text-decoration: none;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tab-remove {
    background: none;
    border: none;
    color: #52525b;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .tab-row:hover .tab-remove {
    opacity: 1;
  }
  .tab-remove:hover {
    color: #ef4444;
  }
</style>
