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
  let duplicateIndex = $derived(syncStore.duplicates);

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

  const duplicateMeta = (listId) =>
    duplicateIndex[listId] || { hasDuplicates: false, count: 0 };

  function updateTitle(list, newTitle) {
    syncStore.updateList(list._id, { title: newTitle });
  }

  async function acceptAiName(list, event) {
    if (event) event.stopPropagation();
    if (!list) return;
    await syncStore.acceptAiSuggestion(list._id);
  }

  async function rejectAiName(list, event) {
    if (event) event.stopPropagation();
    if (!list) return;
    await syncStore.rejectAiSuggestion(list._id);
  }

  async function acceptSuggestedTag(list, tag, event) {
    if (event) event.stopPropagation();
    if (!list) return;
    await syncStore.acceptSuggestedTag(list._id, tag);
  }

  async function rejectSuggestedTag(list, tag, event) {
    if (event) event.stopPropagation();
    if (!list) return;
    await syncStore.rejectSuggestedTag(list._id, tag);
  }
</script>

<div class="page-container">
  <!-- Header with navigation and actions -->
  <div class="header">
    <button class="back-button" disabled title="Coming soon">
      <span class="back-arrow">←</span>
      Back to All Slashes
    </button>
    <button class="spread-button" disabled title="Coming soon">Spread</button>
  </div>

  <!-- Search box -->
  <div class="search-box">
    <input
      type="text"
      class="search-input"
      placeholder="Search"
      bind:value={filterQuery}
    />
  </div>

  <!-- Pinned section (if any pinned items exist) -->
  {#if pinnedLists.length > 0 && !filterQuery.trim()}
    <div class="section-title">Pinned</div>
  {/if}

  <!-- Stashes grid -->
  <div class="slashes-grid">
    {#if visibleLists.length === 0}
      <div class="empty-state" transition:fade>
        <span>No stashes found</span>
      </div>
    {/if}

    {#each visibleLists as list (list._id)}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="slash-card"
        class:expanded={expandedLists.has(list._id)}
        onclick={(e) => handleStashClick(e, list._id)}
      >
        <div class="slash-header">
          <div class="slash-icon dark">
            {#if list.pinned}
              📌
            {:else}
              📁
            {/if}
          </div>
          <input
            type="text"
            class="slash-title"
            value={list.title || "Untitled Stash"}
            onblur={(e) => updateTitle(list, e.target.value)}
            onclick={(e) => e.stopPropagation()}
          />
        </div>

        <div class="slash-meta">
          <span class="slash-count">📄 {list.tabs?.length || 0} tabs</span>
        </div>

        <div class="slash-date">
          {new Date(list.time).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>

        {#if list.tags && list.tags.length}
          <div class="slash-tags">
            {#each list.tags as tag}
              <span class="tag-chip">#{tag}</span>
            {/each}
          </div>
        {/if}

        {#if duplicateMeta(list._id).hasDuplicates}
          <div
            class="duplicate-badge"
            title="This stash shares URLs with other stashes"
          >
            Duplicates: {duplicateMeta(list._id).count}
          </div>
        {/if}

        {#if list.aiSuggestedTitle}
          <div
            class="slash-ai-row"
            onclick={(event) => event.stopPropagation()}
          >
            <div class="ai-icon" title="AI Suggestion">✨</div>
            <div class="ai-content">
              <span class="ai-label">Suggested:</span>
              <span class="ai-value">{list.aiSuggestedTitle}</span>
            </div>
            <div class="ai-actions">
              <button
                class="ai-action-btn accept"
                type="button"
                title="Accept suggestion"
                onclick={(event) => acceptAiName(list, event)}
              >
                <i class="fas fa-check"></i>
              </button>
              <button
                class="ai-action-btn reject"
                type="button"
                title="Dismiss"
                onclick={(event) => rejectAiName(list, event)}
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        {/if}

        {#if list.aiSuggestedTags && list.aiSuggestedTags.length}
          <div
            class="slash-ai-row"
            onclick={(event) => event.stopPropagation()}
          >
            <div class="ai-icon" title="AI Suggested Tags">✨</div>
            <div class="ai-content">
              {#each list.aiSuggestedTags as tag}
                <div class="ai-tag-pill">
                  <span class="tag-text">#{tag}</span>
                  <div class="ai-tag-btns">
                    <button
                      class="ai-tag-action accept"
                      type="button"
                      title="Add tag"
                      onclick={(event) => acceptSuggestedTag(list, tag, event)}
                    >
                      <i class="fas fa-plus"></i>
                    </button>
                    <button
                      class="ai-tag-action reject"
                      type="button"
                      title="Dismiss"
                      onclick={(event) => rejectSuggestedTag(list, tag, event)}
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        {#if list.aiSuggestionMeta && (list.aiSuggestedTitle || (list.aiSuggestedTags && list.aiSuggestedTags.length))}
          <p class="ai-privacy-note">
            Based on {list.aiSuggestionMeta.allowedCount} of {list
              .aiSuggestionMeta.totalCount} tabs ({list.aiSuggestionMeta
              .excludedCount} excluded for privacy)
          </p>
        {/if}

        <!-- Card actions on hover -->
        <div class="card-actions">
          <button
            class="icon-btn"
            onclick={(e) => {
              e.stopPropagation();
              togglePin(list);
            }}
            title={list.pinned ? "Unpin" : "Pin"}
          >
            <i class="fas fa-thumbtack" style:opacity={list.pinned ? 1 : 0.5}
            ></i>
          </button>
          <button
            class="icon-btn"
            onclick={(e) => {
              e.stopPropagation();
              handleRestore(list);
            }}
            title="Restore"
          >
            <i class="fas fa-box-open"></i>
          </button>
          <button
            class="icon-btn danger"
            onclick={(e) => {
              e.stopPropagation();
              handleDelete(list);
            }}
            title="Delete"
          >
            <i class="fas fa-trash"></i>
          </button>
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
                  onclick={(e) => {
                    e.stopPropagation();
                    removeTab(list, idx);
                  }}
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
  </div>

  <!-- Footer actions -->
  <div class="footer-actions">
    <button class="footer-button" disabled title="Coming soon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      Restore All
    </button>
    <button class="footer-button" disabled title="Coming soon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
      Rename
    </button>
    <button class="footer-button" disabled title="Coming soon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
      Add Tag
    </button>
  </div>

  <!-- Sync status badge (moved to bottom corner) -->
  <div class="sync-status-corner">
    <SyncStatusBadge />
  </div>
</div>

<style>
  /* CSS Variables - Dark theme adaptation of reference */
  :root {
    --primary-blue: #3b82f6;
    --bg-gray: #141517;
    --bg-white: #1a1b1e;
    --border: #27272a;
    --text-dark: #e4e4e7;
    --text-gray: #71717a;
    --text-light: #52525b;
    --hover-bg: #18191c;
    --accent-orange: #f97316;
    --accent-green: #10b981;
    --accent-pink: #ec4899;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* Page Container */
  .page-container {
    min-height: 100vh;
    background: var(--bg-gray);
    color: var(--text-dark);
    font-family:
      "Inter",
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      sans-serif;
    padding: 40px;
  }

  /* Header */
  .header {
    max-width: 800px;
    margin: 0 auto 0;
    padding: 24px 28px;
    background: var(--bg-white);
    border-radius: 16px 16px 0 0;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-gray);
    background: transparent;
    border: none;
    font-size: 14px;
    font-weight: 500;
    cursor: not-allowed;
    opacity: 0.5;
    font-family: inherit;
  }

  .back-button:not(:disabled) {
    cursor: pointer;
    opacity: 1;
    transition: color 0.2s;
  }

  .back-button:not(:disabled):hover {
    color: var(--text-dark);
  }

  .back-arrow {
    font-size: 18px;
  }

  .spread-button {
    background: var(--primary-blue);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: not-allowed;
    opacity: 0.5;
    font-family: inherit;
  }

  .spread-button:not(:disabled) {
    cursor: pointer;
    opacity: 1;
    transition: all 0.2s;
  }

  .spread-button:not(:disabled):hover {
    background: #2563eb;
    transform: translateY(-1px);
  }

  /* Search Box */
  .search-box {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px 28px;
    background: var(--bg-white);
    border-bottom: 1px solid var(--border);
  }

  .search-input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 14px;
    font-family: "Inter", sans-serif;
    background-color: var(--bg-gray);
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%2371717a" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>');
    background-repeat: no-repeat;
    background-position: 12px center;
    color: var(--text-dark);
    transition: all 0.2s;
  }

  .search-input::placeholder {
    color: var(--text-light);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Section Title */
  .section-title {
    max-width: 800px;
    margin: 24px auto 12px;
    padding: 0 28px;
    font-family: "Archivo", sans-serif;
    font-weight: 600;
    font-size: 13px;
    color: var(--text-gray);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Stashes Grid */
  .slashes-grid {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px 28px;
    background: var(--bg-white);
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .empty-state {
    grid-column: 1 / -1;
    padding: 64px 0;
    text-align: center;
    color: var(--text-light);
    font-size: 14px;
  }

  /* Slash Card */
  .slash-card {
    background: var(--bg-gray);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .slash-card:hover {
    background: var(--hover-bg);
    border-color: var(--text-light);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .slash-card.expanded {
    background: var(--hover-bg);
  }

  .slash-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .slash-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
    background: var(--text-dark);
  }

  .slash-icon.dark {
    background: var(--text-gray);
  }

  .slash-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-dark);
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-family: inherit;
    cursor: text;
  }

  .slash-title:hover {
    text-decoration: underline;
    text-decoration-color: var(--text-light);
  }

  .slash-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-gray);
    margin-bottom: 4px;
  }

  .slash-count {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .slash-date {
    font-size: 11px;
    color: var(--text-light);
    margin-top: 4px;
  }

  .slash-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }

  .tag-chip {
    font-size: 11px;
    color: var(--text-gray);
    background: var(--bg-gray);
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid var(--border);
  }

  .duplicate-badge {
    font-size: 11px;
    color: var(--accent-orange);
    margin-top: 6px;
  }

  /* Card Actions */
  .card-actions {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    gap: 8px;
    opacity: 0;
    transform: translateX(10px);
    transition: all 0.2s ease;
  }

  .slash-card:hover .card-actions,
  .slash-card:focus-within .card-actions {
    opacity: 1;
    transform: translateX(0);
  }

  .icon-btn {
    background: var(--bg-gray);
    border: 1px solid var(--border);
    color: var(--text-gray);
    cursor: pointer;
    padding: 6px;
    font-size: 12px;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .icon-btn:hover {
    color: var(--text-dark);
    background: var(--hover-bg);
    border-color: var(--text-gray);
  }

  .icon-btn.danger:hover {
    color: #ef4444;
    border-color: #ef4444;
  }

  /* Expanded Details */
  .card-details {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tab-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 12px;
    transition: background 0.2s;
  }

  .tab-row:hover {
    background: var(--bg-gray);
  }

  .tab-icon {
    width: 14px;
    height: 14px;
    opacity: 0.8;
    flex-shrink: 0;
  }

  .tab-link {
    color: var(--text-gray);
    text-decoration: none;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tab-link:hover {
    color: var(--text-dark);
    text-decoration: underline;
  }

  .tab-remove {
    background: none;
    border: none;
    color: var(--text-light);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
    padding: 4px;
    font-size: 12px;
  }

  .tab-row:hover .tab-remove {
    opacity: 1;
  }

  .tab-remove:hover {
    color: #ef4444;
  }

  /* Footer Actions */
  .footer-actions {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px 28px;
    background: var(--bg-white);
    border-top: 1px solid var(--border);
    border-radius: 0 0 16px 16px;
    display: flex;
    gap: 12px;
  }

  .footer-button {
    background: var(--bg-gray);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-gray);
    cursor: not-allowed;
    display: flex;
    align-items: center;
    gap: 8px;
    opacity: 0.5;
    font-family: inherit;
  }

  .footer-button:not(:disabled) {
    cursor: pointer;
    opacity: 1;
    transition: all 0.2s;
  }

  .footer-button:not(:disabled):hover {
    background: var(--hover-bg);
    border-color: var(--text-gray);
  }

  .footer-button svg {
    width: 16px;
    height: 16px;
  }

  /* Sync Status Corner */
  .sync-status-corner {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 100;
  }

  /* AI Suggestions Refined */
  .slash-ai-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px dashed var(--border);
    font-size: 13px;
    color: var(--text-gray);
  }

  .ai-icon {
    font-size: 14px;
    line-height: 1.4;
    user-select: none;
  }

  .ai-content {
    flex: 1;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .ai-label {
    color: var(--text-light);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    font-weight: 500;
  }

  .ai-value {
    color: var(--text-dark);
    font-weight: 500;
  }

  .ai-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .ai-action-btn {
    background: transparent;
    border: none;
    color: var(--text-light);
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 4px;
    line-height: 1;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ai-action-btn:hover {
    background: var(--hover-bg);
    color: var(--text-dark);
  }

  .ai-action-btn.accept:hover {
    color: var(--accent-green);
    background: rgba(16, 185, 129, 0.1);
  }

  .ai-action-btn.reject:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  /* AI Tag Pills */
  .ai-tag-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 4px 2px 10px;
    border: 1px solid var(--border);
    border-radius: 100px;
    font-size: 11px;
    background: transparent;
    color: var(--text-gray);
    transition: border-color 0.2s;
  }

  .ai-tag-pill:hover {
    border-color: var(--text-light);
  }

  .tag-text {
    font-weight: 500;
  }

  .ai-tag-btns {
    display: flex;
    align-items: center;
    gap: 2px;
    border-left: 1px solid var(--border);
    padding-left: 4px;
    margin-left: 2px;
  }

  .ai-tag-action {
    border: none;
    background: none;
    cursor: pointer;
    color: var(--text-light);
    font-size: 10px;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .ai-tag-action:hover {
    color: var(--text-dark);
    background: var(--hover-bg);
  }

  .ai-tag-action.accept:hover {
    color: var(--accent-green);
  }

  .ai-tag-action.reject:hover {
    color: #ef4444;
  }

  .ai-privacy-note {
    margin-top: 6px;
    font-size: 11px;
    color: var(--text-light);
    opacity: 0.7;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .page-container {
      padding: 20px;
    }

    .slashes-grid {
      grid-template-columns: 1fr;
    }

    .footer-actions {
      flex-wrap: wrap;
    }
  }
</style>
