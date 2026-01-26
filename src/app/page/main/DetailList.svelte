<script>
  import { actions, aiLoading, opts } from "../../store/syncStore";
  import __ from "@/common/i18n";
  import { formatTime, getColorByHash, getDomain } from "@/common/utils";
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";

  let { lists = [], title = "Tab Lists" } = $props();

  // State for pagination
  let currentPage = $state(1);
  let itemsPerPage = $derived($opts.listsPerPage || 10);
  let pageCount = $derived(Math.ceil(lists.length / itemsPerPage));
  let paginatedLists = $derived(
    lists.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
  );

  // Reset page when lists change
  $effect(() => {
    if (lists) currentPage = 1;
  });

  // Expand/Collapse state
  let expandedLists = $state(new Set());

  const toggleExpand = (id) => {
    // Reactivity for Set in Svelte 5: reassign or use SvelteSet.
    // We'll use reassignment to be safe and simple.
    const newSet = new Set(expandedLists);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    expandedLists = newSet;
  };

  const handleCleanAll = async () => {
    await actions.cleanAll();
  };

  const handleCategorize = async (index, e) => {
    e.stopPropagation();
    await actions.categorizeList(index);
  };

  const handlePin = (id, pinned, e) => {
    e.stopPropagation();
    actions.pinList(id, pinned);
  };

  const handleRemove = (id, e) => {
    e.stopPropagation();
    actions.removeList(id);
  };
</script>

<div class="detail-container">
  <header class="list-header">
    <h1>{__("ui_my_tab_lists")} ({lists.length})</h1>
    <button class="btn-clean" onclick={handleCleanAll}>
      <i class="fas fa-magic"></i>
      {__("ui_clean_all")}
    </button>
  </header>

  <div class="list-grid">
    {#each paginatedLists as list, i (list._id)}
      <div
        class="tab-list-card"
        class:pinned={list.pinned}
        class:ai-suggested={$aiLoading === list._id}
        animate:flip={{ duration: 300 }}
      >
        <div
          class="card-header"
          onclick={() => toggleExpand(list._id)}
          role="button"
          tabindex="0"
          onkeydown={(e) => e.key === "Enter" && toggleExpand(list._id)}
        >
          <div class="header-main">
            <span
              class="tab-count"
              style="background-color: {list.color || '#eee'}"
            >
              {list.tabs.length}
              {__("ui_tabs")}
            </span>
            <span class="created-at"
              >{__("ui_created")} {formatTime(list.time)}</span
            >
            {#if list.category}
              <span class="category-badge" transition:fade>{list.category}</span
              >
            {/if}
            <h2 class="title">{list.title || __("ui_untitled_list")}</h2>
          </div>

          <div class="header-actions">
            <button
              onclick={(e) => handlePin(list._id, !list.pinned, e)}
              title={list.pinned ? __("ui_unpin") : __("ui_pin")}
            >
              <i class="fas fa-thumbtack" class:active={list.pinned}></i>
            </button>
            <button
              onclick={(e) => handleCategorize(i, e)}
              disabled={$aiLoading === list._id}
              aria-label="Categorize list"
            >
              <i class="fas fa-robot" class:loading={$aiLoading === list._id}
              ></i>
            </button>
            <button
              onclick={(e) => handleRemove(list._id, e)}
              aria-label="Delete list"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        {#if expandedLists.has(list._id)}
          <div class="card-body" transition:fade>
            <div class="tabs-grid">
              {#each list.tabs as tab}
                <!-- Svelte 5 keying is implicity handled in each block, but check if we need key -->
                <div class="tab-item">
                  <img
                    src={tab.favIconUrl ||
                      `https://www.google.com/s2/favicons?domain=${getDomain(tab.url)}`}
                    alt=""
                    class="favicon"
                  />
                  <a href={tab.url} target="_blank" class="tab-link"
                    >{tab.title}</a
                  >
                  <span class="tab-domain">{getDomain(tab.url)}</span>
                </div>
              {/each}
            </div>
            <div class="list-footer">
              <button onclick={() => actions.restoreList(list._id)}
                >{__("ui_restore_all")}</button
              >
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>

  {#if pageCount > 1}
    <div class="pagination">
      {#each Array(pageCount) as _, i}
        <button
          class:active={currentPage === i + 1}
          onclick={() => (currentPage = i + 1)}
        >
          {i + 1}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .detail-container {
    padding: 24px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .btn-clean {
    background: #6366f1;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }

  .list-grid {
    display: grid;
    gap: 16px;
  }

  .tab-list-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    background: white;
    transition: box-shadow 0.2s;
  }

  .tab-list-card:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .card-header {
    padding: 16px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-main {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .tab-count {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .created-at {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .category-badge {
    background: #e0e7ff;
    color: #4338ca;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 0.7rem;
    font-weight: 600;
    /* Pulse effect */
  }

  .tab-list-card.ai-suggested .category-badge {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.05);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }

  .header-actions button {
    background: none;
    border: none;
    cursor: pointer;
    color: #9ca3af;
    padding: 4px;
  }

  .header-actions button:hover {
    color: #4b5563;
  }

  .fas.active {
    color: #3b82f6;
  }

  .card-body {
    padding: 16px;
    border-top: 1px solid #f3f4f6;
    background: #f9fafb;
    color: initial;
  }

  .tabs-grid {
    display: grid;
    gap: 8px;
  }

  .tab-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.875rem;
  }

  .favicon {
    width: 16px;
    height: 16px;
  }

  .tab-link {
    color: #3b82f6;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .tab-domain {
    color: #9ca3af;
    font-size: 0.75rem;
  }

  .pagination {
    margin-top: 24px;
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .pagination button {
    width: 32px;
    height: 32px;
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 4px;
    cursor: pointer;
  }

  .pagination button.active {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
  }
</style>
