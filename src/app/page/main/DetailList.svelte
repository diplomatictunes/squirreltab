<script>
  import { syncStore } from "../../store/syncStore.svelte.js";
  import { fade, fly, slide } from "svelte/transition";
  import browser from "webextension-polyfill";
  import TagInput from "../../component/tags/TagInput.svelte";
  import { sendStashCurrentTabIntent } from "@/common/intents";
  import { getRuntimeSource, isPopupContext } from "@/common/runtimeContext";

  const props = $props();
  let activeView = $derived(props.activeView ?? "all");

  let isReady = $derived(syncStore.initialized);
  let lists = $derived(syncStore.lists);

  $effect(() => {
    if (!isReady) return;
    console.log(
      "[DetailList] lists snapshot",
      lists.map((l) => ({
        id: l._id,
        hasTabs: Array.isArray(l.tabs),
        tabCount: l.tabs?.length,
      })),
    );
  });

  let sortMode = $state("newest");
  const runtimeSource = getRuntimeSource();
  const popupContext = isPopupContext();

  // Load saved sort preference
  $effect(() => {
    browser.storage.local.get("sortPreference").then((data) => {
      if (data.sortPreference) {
        sortMode = data.sortPreference;
      }
    });
  });

  // Save sort preference when changed
  $effect(() => {
    if (sortMode === "newest") {
      browser.storage.local.remove("sortPreference");
      return;
    }
    browser.storage.local.set({ sortPreference: sortMode });
  });
  let filterQuery = $state("");
  let expandedLists = $state(new Set());
  let menuOpenFor = $state(null);
  let emptyStashLoading = $state(false);
  let aiLoading = $derived(syncStore.aiLoading);

  const sortComparators = {
    newest: (a, b) => (b.time || 0) - (a.time || 0),
    oldest: (a, b) => (a.time || 0) - (b.time || 0),
    aToZ: (a, b) => (a.title || "").localeCompare(b.title || ""),
    zToA: (a, b) => (b.title || "").localeCompare(a.title || ""),
  };

  const matchFilter = (list) => {
    if (!filterQuery.trim()) return true;
    const needle = filterQuery.trim().toLowerCase();
    const titleMatch = (list.title || "").toLowerCase().includes(needle);
    const tagMatch = (list.tags || []).some((tag) =>
      tag.toLowerCase().includes(needle),
    );
    return titleMatch || tagMatch;
  };

  let visibleLists = $derived.by(() => {
    // FIX: Do not return early on !isReady. This ensures the dependency on `lists`
    // is always tracked by the derived store, preventing stale empty states.
    // if (!isReady) return [];

    let base = lists;
    if (activeView === "pinned") {
      base = syncStore.pinnedLists;
    } else if (activeView.startsWith("tag:")) {
      const tag = activeView.substring(4);
      base = syncStore.taggedLists[tag] || [];
    }
    const filtered = base.filter(matchFilter);
    const comparator = sortComparators[sortMode] || sortComparators.newest;

    const result = [...filtered].sort(comparator);

    console.log("[DetailList] computing visibleLists", {
      total: lists.length,
      activeView,
      visible: result.length,
      isReady,
    });

    return result;
  });

  let totalBeforeFilter = $derived.by(() => {
    if (activeView === "pinned") return syncStore.pinnedLists.length;
    if (activeView.startsWith("tag:")) {
      const tag = activeView.substring(4);
      return (syncStore.taggedLists[tag] || []).length;
    }
    return lists.length;
  });

  let isFiltered = $derived(() => filterQuery.trim().length > 0);
  let filteredOutCount = $derived(
    () => totalBeforeFilter - visibleLists.length,
  );

  // Extract all unique tags from all lists for autocomplete
  let allKnownTags = $derived(() => {
    const tagSet = new Set();
    lists.forEach((list) => {
      (list.tags || []).forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  });

  function toggleExpand(listId) {
    if (expandedLists.has(listId)) {
      expandedLists.delete(listId);
    } else {
      expandedLists.add(listId);
    }
    expandedLists = new Set(expandedLists);
  }

  const interactiveHeaderSelector = "button, input, select, textarea, a";

  function shouldIgnoreHeaderEvent(event) {
    if (!event || !event.target) return false;
    return Boolean(event.target.closest(interactiveHeaderSelector));
  }

  function handleHeaderClick(event, listId) {
    if (shouldIgnoreHeaderEvent(event)) return;
    toggleExpand(listId);
  }

  function handleHeaderKeydown(event, listId) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleExpand(listId);
  }

  function toggleMenu(listId) {
    menuOpenFor = menuOpenFor === listId ? null : listId;
  }

  function removeTab(listId, tabIndex) {
    const list = lists.find((l) => l._id === listId);
    if (!list) return;

    const updatedTabs = list.tabs.filter((_, i) => i !== tabIndex);
    if (updatedTabs.length === 0) {
      syncStore.removeList(listId);
    } else {
      syncStore.updateList(listId, { tabs: updatedTabs });
    }
  }

  async function handleRestore(list, inNewWindow = false) {
    if (!list) return;
    menuOpenFor = null;
    if (!list.pinned) {
      const confirmed = confirm(
        `\u26A0\uFE0F This stash is NOT pinned.\n\n` +
          `Restoring will:\n` +
          `\u2713 Reopen all ${list.tabs?.length || 0} tabs\n` +
          `\u2717 Delete this stash permanently\n\n` +
          `Tip: Pin the stash first if you want to keep it.\n\n` +
          `Continue with restore?`,
      );
      if (!confirmed) return;
    } else {
      const confirmed = confirm(
        `\uD83D\uDCCC This stash is pinned.\n\n` +
          `Restoring will:\n` +
          `\u2713 Reopen all ${list.tabs?.length || 0} tabs\n` +
          `\u2713 Keep this stash for future use\n\n` +
          `Continue?`,
      );
      if (!confirmed) return;
    }
    const success = await syncStore.restoreList(list._id, inNewWindow);
    if (success) {
      syncStore.updateSnackbar(
        list.pinned
          ? "Tabs restored (stash kept because it is pinned)"
          : "Tabs restored and stash cleared",
      );
    }
  }

  function handleDelete(list) {
    if (!list) return;
    menuOpenFor = null;
    const confirmed = confirm("Delete this stash permanently?");
    if (!confirmed) return;
    syncStore.removeList(list._id);
    syncStore.updateSnackbar("Stash deleted");
  }

  async function runAiCategorization(list) {
    if (!list) return;
    const confirmed = confirm(
      "AI categorization will replace the current category and tags for this stash. Continue?",
    );
    if (!confirmed) return;
    try {
      await syncStore.categorizeList(list._id);
      syncStore.updateSnackbar("AI suggestions applied");
    } catch (error) {
      syncStore.updateSnackbar("AI categorization failed");
    } finally {
      menuOpenFor = null;
    }
  }

  function addTag(list, newTag) {
    if (!list || !newTag) return;
    const tags = Array.from(new Set([...(list.tags || []), newTag]));
    syncStore.updateList(list._id, { tags });
  }

  function removeTag(list, tag) {
    if (!list) return;
    const tags = (list.tags || []).filter((t) => t !== tag);
    syncStore.updateList(list._id, { tags });
  }

  // Popup UI dispatches stash intent only; background performs all tab and storage work.
  function stashCurrentTabFromEmpty() {
    if (!popupContext || emptyStashLoading) return;
    emptyStashLoading = true;
    sendStashCurrentTabIntent(runtimeSource)
      .catch((error) => {
        console.error(
          "[SquirrlTab] Failed to dispatch stash intent from popup:",
          error,
        );
      })
      .finally(() => {
        emptyStashLoading = false;
      });
  }

  function getViewTitle() {
    if (activeView === "all") return "All Stashes";
    if (activeView === "pinned") return "Pinned Stashes";
    if (activeView.startsWith("tag:")) {
      return `#${activeView.substring(4)}`;
    }
    return "Stashes";
  }

  $effect(() => {
    const handleGlobalClick = () => {
      if (menuOpenFor !== null) menuOpenFor = null;
    };
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  });
</script>

{#if !isReady}
  <div class="loading-container" transition:fade>
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p class="loading-text">Gathering your acorns...</p>
      <p class="loading-subtext">Preparing your winter store</p>
    </div>
  </div>
{:else if visibleLists.length === 0}
  <div class="empty-state" transition:fade>
    <div class="empty-content">
      <div class="empty-icon-wrapper">
        <i class="fas fa-box-open empty-icon"></i>
      </div>
      <h2 class="empty-title">No stashes found</h2>
      <p class="empty-description">
        {#if activeView === "all"}
          Start hoarding tabs for winter! Right-click any tab and select "Stash
          This Tab"
        {:else if activeView === "pinned"}
          Pin important stashes to keep them easily accessible
        {:else}
          No stashes with this tag yet. Add tags to organize your collection
        {/if}
      </p>
      {#if activeView === "all" && popupContext}
        <button
          class="action-button"
          onclick={stashCurrentTabFromEmpty}
          disabled={emptyStashLoading}
        >
          <i
            class={`fas ${emptyStashLoading ? "fa-spinner fa-spin" : "fa-plus"}`}
          ></i>
          <span>{emptyStashLoading ? "Stashing..." : "Stash Current Tab"}</span>
        </button>
      {/if}
    </div>
  </div>
{:else}
  <div class="lists-container">
    <!-- View Header -->
    <div class="view-header">
      <div class="view-title">
        <h1>{getViewTitle()}</h1>
        <span class="stash-count">
          {visibleLists.length}
          {visibleLists.length === 1 ? "stash" : "stashes"}
          {#if isFiltered && filteredOutCount > 0}
            <span class="filter-indicator">
              ({filteredOutCount} hidden by filter)
            </span>
          {/if}
        </span>
      </div>

      <div class="view-actions">
        <label class="sort-control">
          <span class="control-label">Sort by</span>
          <div class="sort-select">
            <i class="fas fa-sort"></i>
            <select bind:value={sortMode} aria-label="Sort stashes">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="aToZ">Title A → Z</option>
              <option value="zToA">Title Z → A</option>
            </select>
          </div>
        </label>
        <div class="filter-input">
          <i class="fas fa-filter"></i>
          <input
            type="text"
            placeholder="Filter by title or tag"
            bind:value={filterQuery}
            aria-label="Filter stashes"
          />
          {#if filterQuery}
            <button
              class="clear-filter"
              onclick={() => (filterQuery = "")}
              aria-label="Clear filter"
            >
              <i class="fas fa-times"></i>
            </button>
          {/if}
        </div>
        {#if isFiltered}
          <button
            class="clear-all-btn"
            onclick={() => {
              filterQuery = "";
              sortMode = "newest";
            }}
            title="Reset sort and filter"
          >
            <i class="fas fa-redo"></i>
            <span>Reset</span>
          </button>
        {/if}
      </div>
    </div>

    <!-- Lists Grid -->
    <div class="lists-grid">
      {#each visibleLists as list (list._id)}
        <div
          class="stash-card"
          transition:fly={{ y: 20, duration: 300, delay: 0 }}
        >
          <!-- Card Header -->
          <div
            class="card-header"
            class:pinned={list.pinned}
            role="button"
            tabindex="0"
            aria-expanded={expandedLists.has(list._id)}
            aria-controls={`stash-panel-${list._id}`}
            onclick={(event) => handleHeaderClick(event, list._id)}
            onkeydown={(event) => handleHeaderKeydown(event, list._id)}
          >
            <button
              class="expand-toggle"
              type="button"
              onclick={() => toggleExpand(list._id)}
              aria-label={expandedLists.has(list._id) ? "Collapse" : "Expand"}
            >
              <i
                class="fas fa-chevron-{expandedLists.has(list._id)
                  ? 'down'
                  : 'right'}"
              ></i>
            </button>

            <div class="title-section">
              <input
                type="text"
                class="stash-title"
                value={list.title || "Untitled Stash"}
                placeholder="Untitled Stash"
                onblur={(e) =>
                  syncStore.updateList(list._id, { title: e.target.value })}
              />
              <div class="meta-info">
                <span class="tab-count">
                  <i class="fas fa-file"></i>
                  {list.tabs?.length || 0} tabs
                </span>
                {#if list.time}
                  <span class="stash-date">
                    <i class="fas fa-clock"></i>
                    {new Date(list.time).toLocaleDateString()}
                  </span>
                {/if}
              </div>
            </div>

            <div class="card-actions">
              <button
                class="card-btn pin"
                class:pinned={list.pinned}
                onclick={() => syncStore.pinList(list._id, !list.pinned)}
                title={list.pinned
                  ? "Unpin (stash will be deleted when restored)"
                  : "Pin (stash will be kept after restore)"}
              >
                <i class="fas fa-thumbtack"></i>
              </button>

              <button
                class="card-btn"
                onclick={() => handleRestore(list, false)}
                title="Restores tabs and removes this stash unless it is pinned"
              >
                <i class="fas fa-folder-open"></i>
              </button>

              <div class="action-menu">
                <button
                  class="card-btn"
                  title="More options"
                  aria-haspopup="true"
                  aria-expanded={menuOpenFor === list._id}
                  onclick={(event) => {
                    event.stopPropagation();
                    toggleMenu(list._id);
                  }}
                >
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                {#if menuOpenFor === list._id}
                  <div class="menu-panel">
                    <button onclick={() => handleRestore(list, true)}>
                      <i class="fas fa-clone"></i>
                      Restore in new window
                    </button>
                    <!-- AI Categorization - deferred to v2
                    <button
                      onclick={() => runAiCategorization(list)}
                      disabled={aiLoading === list._id}
                      title="AI replaces the category and tags for this stash"
                    >
                      <i class={`fas ${aiLoading === list._id ? "fa-spinner fa-spin" : "fa-magic"}`}></i>
                      {aiLoading === list._id ? "Categorizing..." : "AI Categorize"}
                    </button>
                    -->
                    <button class="danger" onclick={() => handleDelete(list)}>
                      <i class="fas fa-trash"></i>
                      Delete stash
                    </button>
                  </div>
                {/if}
              </div>
            </div>
            {#if !list.pinned}
              <p class="restore-hint">
                Restoring removes this stash unless it is pinned.
              </p>
            {/if}
          </div>

          <!-- Card Content (Tabs) -->
          {#if expandedLists.has(list._id)}
            <div
              id={`stash-panel-${list._id}`}
              class="card-content"
              transition:slide={{ duration: 300 }}
            >
              <div class="tabs-list">
                {#each list.tabs || [] as tab, index (tab.url + index)}
                  <div class="tab-row">
                    <div class="tab-favicon">
                      <img
                        src={tab.favIconUrl ||
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%235c5f66' d='M8 0a8 8 0 100 16A8 8 0 008 0z'/%3E%3C/svg%3E"}
                        alt=""
                        onerror={(e) => (e.target.style.display = "none")}
                      />
                    </div>

                    <a
                      href={tab.url}
                      class="tab-info"
                      target="_blank"
                      rel="noopener noreferrer"
                      title={tab.title}
                    >
                      <span class="tab-title">{tab.title || tab.url}</span>
                      <span class="tab-url">{new URL(tab.url).hostname}</span>
                    </a>

                    <button
                      class="remove-tab"
                      onclick={() => removeTab(list._id, index)}
                      aria-label="Remove tab"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <div class="card-footer">
            <div class="tags-container">
              {#if list.tags && list.tags.length > 0}
                {#each list.tags as tag}
                  <span class="tag">
                    {tag}
                    <button
                      class="remove-tag"
                      title="Remove tag"
                      onclick={() => removeTag(list, tag)}
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </span>
                {/each}
              {:else}
                <span class="tag muted">No tags yet</span>
              {/if}
            </div>

            <TagInput
              existingTags={list.tags || []}
              {allKnownTags}
              onAdd={(tag) => addTag(list, tag)}
              placeholder="Add a tag..."
            />
          </div>

          <!-- Quick Preview (when collapsed) -->
          {#if !expandedLists.has(list._id) && list.tabs && list.tabs.length > 0}
            <div class="quick-preview">
              {#each list.tabs.slice(0, 5) as tab}
                <div class="preview-favicon" title={tab.title}>
                  <img
                    src={tab.favIconUrl ||
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%235c5f66' d='M8 0a8 8 0 100 16A8 8 0 008 0z'/%3E%3C/svg%3E"}
                    alt=""
                  />
                </div>
              {/each}
              {#if list.tabs.length > 5}
                <span class="preview-more">+{list.tabs.length - 5}</span>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  /* Loading State */
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #141517;
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #2c2e33;
    border-top-color: #ff922b;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    color: #e4e4e7;
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
  }

  .loading-subtext {
    color: #5c5f66;
    font-size: 0.875rem;
    margin: 0;
  }

  /* Empty State */
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 56px);
    background: #141517;
    padding: 40px 20px;
  }

  .empty-content {
    text-align: center;
    max-width: 480px;
  }

  .empty-icon-wrapper {
    margin-bottom: 24px;
  }

  .empty-icon {
    font-size: 80px;
    color: #2c2e33;
  }

  .empty-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #e4e4e7;
    margin: 0 0 12px 0;
  }

  .empty-description {
    font-size: 0.95rem;
    color: #909296;
    line-height: 1.6;
    margin: 0 0 32px 0;
  }

  .action-button {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 28px;
    background: linear-gradient(135deg, #ff922b 0%, #ff6b35 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(255, 146, 43, 0.3);
  }

  .action-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 146, 43, 0.4);
  }

  /* Lists Container */
  .lists-container {
    background: #141517;
    min-height: calc(100vh - 56px);
    padding: 32px;
  }

  /* View Header */
  .view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
  }

  .view-title h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #e4e4e7;
    margin: 0 0 4px 0;
  }

  .stash-count {
    font-size: 0.875rem;
    color: #5c5f66;
    font-weight: 500;
  }

  .filter-indicator {
    color: #ffc078;
    font-weight: 500;
    font-size: 0.8rem;
    margin-left: 6px;
  }

  .view-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .sort-control {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .control-label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #5c5f66;
    font-weight: 600;
  }

  .sort-select {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #1a1b1e;
    border: 1px solid #2c2e33;
    border-radius: 10px;
    padding: 8px 12px;
  }

  .sort-select select {
    background: transparent;
    border: none;
    color: #e4e4e7;
    font-size: 0.875rem;
    appearance: none;
  }

  .filter-input {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #1a1b1e;
    border: 1px solid #2c2e33;
    border-radius: 10px;
    min-width: 240px;
  }

  .filter-input input {
    flex: 1;
    background: transparent;
    border: none;
    color: #e4e4e7;
    font-size: 0.875rem;
    outline: none;
  }

  .clear-filter {
    background: transparent;
    border: none;
    color: #5c5f66;
    padding: 2px;
    border-radius: 4px;
    transition: color 0.2s;
  }

  .clear-filter:hover {
    color: #e4e4e7;
  }

  .clear-all-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(255, 146, 43, 0.12);
    border: 1px solid rgba(255, 146, 43, 0.3);
    border-radius: 8px;
    color: #ff922b;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .clear-all-btn:hover {
    background: rgba(255, 146, 43, 0.2);
    border-color: rgba(255, 146, 43, 0.5);
  }

  /* Lists Grid */
  .lists-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 20px;
  }

  /* Stash Card */
  .stash-card {
    background: #1a1b1e;
    border: 1px solid #2c2e33;
    border-radius: 16px;
    overflow: visible;
    transition: all 0.3s;
  }

  .stash-card:hover {
    border-color: #3c3e44;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }

  /* Card Header */
  .card-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 20px;
    background: linear-gradient(180deg, #1e1f23 0%, #1a1b1e 100%);
    border-bottom: 1px solid #2c2e33;
    position: relative;
  }

  .card-header.pinned {
    border-left: 3px solid #ff922b;
    padding-left: 17px;
  }

  .card-header.pinned::before {
    content: "\01F4CC";
    position: absolute;
    left: 8px;
    top: 12px;
    font-size: 1rem;
    opacity: 0.6;
  }

  .expand-toggle {
    flex-shrink: 0;
    background: transparent;
    border: none;
    color: #5c5f66;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    transition: all 0.2s;
    margin-top: 2px;
  }

  .expand-toggle:hover {
    background: #25262b;
    color: #909296;
  }

  .title-section {
    flex: 1;
    min-width: 0;
  }

  .stash-title {
    width: 100%;
    background: transparent;
    border: none;
    color: #e4e4e7;
    font-size: 1.125rem;
    font-weight: 600;
    padding: 4px 8px;
    margin: -4px -8px 4px;
    border-radius: 6px;
    outline: none;
    transition: all 0.2s;
  }

  .stash-title:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  .stash-title:focus {
    background: #25262b;
    box-shadow: 0 0 0 2px rgba(255, 146, 43, 0.2);
  }

  .meta-info {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 0.8125rem;
    color: #5c5f66;
  }

  .meta-info span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .meta-info i {
    font-size: 0.75rem;
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .card-btn {
    background: transparent;
    border: none;
    color: #5c5f66;
    cursor: pointer;
    padding: 8px 10px;
    border-radius: 8px;
    transition: all 0.2s;
    font-size: 0.875rem;
  }

  .card-btn:hover {
    background: #25262b;
    color: #909296;
  }

  .card-btn.pin.pinned {
    color: #ff922b;
    background: rgba(255, 146, 43, 0.1);
  }

  .action-menu {
    position: relative;
  }

  .menu-panel {
    position: absolute;
    top: 42px;
    right: 0;
    background: #1e1f23;
    border: 1px solid #2c2e33;
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    min-width: 190px;
    padding: 8px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .menu-panel button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 8px;
    background: transparent;
    color: #c1c2c5;
    font-size: 0.85rem;
    transition: background 0.2s;
    text-align: left;
  }

  .menu-panel button:hover {
    background: #25262b;
  }

  .menu-panel button.danger {
    color: #fa5252;
  }

  .restore-hint {
    margin: 8px 20px 0;
    font-size: 0.75rem;
    color: #909296;
  }

  /* Card Content */
  .card-content {
    background: #141517;
  }

  .tabs-list {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .tab-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    transition: all 0.2s;
    position: relative;
  }

  .tab-row:hover {
    background: #1a1b1e;
  }

  .tab-favicon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    overflow: hidden;
    background: #25262b;
  }

  .tab-favicon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .tab-info {
    flex: 1;
    min-width: 0;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .tab-title {
    color: #c1c2c5;
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tab-url {
    color: #5c5f66;
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tab-info:hover .tab-title {
    color: #e4e4e7;
  }

  .remove-tab {
    flex-shrink: 0;
    background: transparent;
    border: none;
    color: #3c3e44;
    cursor: pointer;
    padding: 6px 8px;
    border-radius: 6px;
    opacity: 0;
    transition: all 0.2s;
  }

  .tab-row:hover .remove-tab {
    opacity: 1;
  }

  .remove-tab:hover {
    background: rgba(250, 82, 82, 0.1);
    color: #fa5252;
  }

  /* Card Footer */
  .card-footer {
    padding: 16px 20px;
    border-top: 1px solid #2c2e33;
    background: #141517;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag {
    background: #25262b;
    color: #909296;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 500;
    border: 1px solid #2c2e33;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .tag:hover {
    background: #2c2e33;
    color: #c1c2c5;
    border-color: #3c3e44;
  }

  .tag.muted {
    opacity: 0.7;
  }

  .remove-tag {
    background: transparent;
    border: none;
    color: #5c5f66;
    padding: 0;
    display: flex;
    align-items: center;
  }

  .remove-tag:hover {
    color: #fa5252;
  }

  /* Quick Preview */
  .quick-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 20px;
    background: #141517;
    border-top: 1px solid #2c2e33;
  }

  .preview-favicon {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    overflow: hidden;
    background: #25262b;
    border: 1px solid #2c2e33;
  }

  .preview-favicon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .preview-more {
    font-size: 0.75rem;
    color: #5c5f66;
    font-weight: 600;
    margin-left: 4px;
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .lists-grid {
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }
  }

  @media (max-width: 768px) {
    .lists-container {
      padding: 20px 16px;
    }

    .lists-grid {
      grid-template-columns: 1fr;
    }

    .view-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }
</style>
