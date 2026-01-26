<script>
  import { taggedLists, actions } from "../../store/syncStore";
  import __ from "@/common/i18n";
  import { fade, fly } from "svelte/transition";

  let { open = $bindable(false), onSetView } = $props();

  const setView = (view) => {
    if (onSetView) onSetView(view);
    open = false;
  };
</script>

{#if open}
  <div
    class="overlay"
    onclick={() => (open = false)}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === "Escape" && (open = false)}
    transition:fade
  ></div>
  <aside class="drawer" transition:fly={{ x: -300, duration: 300 }}>
    <nav>
      <ul>
        <li>
          <button onclick={() => setView("all")}>
            <i class="fas fa-list"></i>
            {__("ui_tab_list")}
          </button>
        </li>
        <li>
          <button onclick={() => setView("pinned")}>
            <i class="fas fa-thumbtack"></i>
            {__("ui_pinned")}
          </button>
        </li>

        <li class="divider"></li>

        {#each Object.keys($taggedLists) as tag}
          <li>
            <button onclick={() => setView(`tag:${tag}`)}>
              <i class="fas fa-label"></i>
              {tag}
            </button>
          </li>
        {/each}

        <li class="divider"></li>

        <li>
          <button onclick={() => setView("options")}>
            <i class="fas fa-cog"></i>
            {__("ui_options")}
          </button>
        </li>
      </ul>
    </nav>
  </aside>
{/if}

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }
  .drawer {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100%;
    background: white;
    z-index: 1001;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    padding: 16px 0;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li button {
    width: 100%;
    text-align: left;
    padding: 12px 24px;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 0.9rem;
    color: #374151;
  }
  li button:hover {
    background: #f3f4f6;
  }
  li button i {
    width: 20px;
    color: #6b7280;
  }
  .divider {
    height: 1px;
    background: #e5e7eb;
    margin: 8px 0;
  }
</style>
