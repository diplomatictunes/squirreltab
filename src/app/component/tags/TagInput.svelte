<script>
  let { 
    existingTags = [], 
    allKnownTags = [], 
    onAdd,
    placeholder = "Add a tag..."
  } = $props();
  
  let inputValue = $state("");
  let showSuggestions = $state(false);
  let focusedIndex = $state(-1);
  
  // Filter suggestions based on input
  let suggestions = $derived(() => {
    if (!inputValue.trim()) return [];
    const needle = inputValue.toLowerCase();
    return allKnownTags
      .filter(tag => 
        tag.toLowerCase().includes(needle) && 
        !existingTags.includes(tag)
      )
      .slice(0, 5);
  });
  
  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (focusedIndex >= 0 && suggestions.length > 0) {
        addTag(suggestions[focusedIndex]);
      } else if (inputValue.trim()) {
        addTag(inputValue.trim());
      }
    } else if (event.key === 'Escape') {
      showSuggestions = false;
      inputValue = "";
    } else if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault();
      focusedIndex = Math.min(focusedIndex + 1, suggestions.length - 1);
    } else if (event.key === 'ArrowUp' && suggestions.length > 0) {
      event.preventDefault();
      focusedIndex = Math.max(focusedIndex - 1, -1);
    }
  }
  
  function addTag(tag) {
    const trimmed = tag.trim();
    if (!trimmed || existingTags.includes(trimmed)) return;
    
    if (onAdd) onAdd(trimmed);
    inputValue = "";
    showSuggestions = false;
    focusedIndex = -1;
  }
  
  function handleInput() {
    showSuggestions = inputValue.trim().length > 0;
    focusedIndex = -1;
  }
  
  function handleBlur() {
    // Delay to allow click on suggestion
    setTimeout(() => {
      showSuggestions = false;
      focusedIndex = -1;
    }, 200);
  }
</script>

<div class="tag-input-wrapper">
  <div class="tag-input-container">
    <i class="fas fa-tag input-icon"></i>
    <input
      type="text"
      class="tag-input"
      bind:value={inputValue}
      {placeholder}
      onkeydown={handleKeyDown}
      oninput={handleInput}
      onfocus={() => showSuggestions = inputValue.trim().length > 0}
      onblur={handleBlur}
    />
    {#if inputValue}
      <button 
        class="clear-input" 
        onclick={() => { inputValue = ""; showSuggestions = false; }}
        aria-label="Clear"
      >
        <i class="fas fa-times"></i>
      </button>
    {/if}
  </div>
  
  {#if showSuggestions && suggestions.length > 0}
    <div class="suggestions-panel">
      {#each suggestions as suggestion, index}
        <button
          class="suggestion-item"
          class:focused={index === focusedIndex}
          onclick={() => addTag(suggestion)}
        >
          <i class="fas fa-tag"></i>
          <span>{suggestion}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .tag-input-wrapper {
    position: relative;
    width: 100%;
  }
  
  .tag-input-container {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #25262b;
    border: 1px solid #2c2e33;
    border-radius: 8px;
    transition: all 0.2s;
  }
  
  .tag-input-container:focus-within {
    background: #2c2e33;
    border-color: #ff922b;
    box-shadow: 0 0 0 3px rgba(255, 146, 43, 0.1);
  }
  
  .input-icon {
    color: #5c5f66;
    font-size: 0.875rem;
  }
  
  .tag-input {
    flex: 1;
    background: transparent;
    border: none;
    color: #e4e4e7;
    font-size: 0.875rem;
    outline: none;
  }
  
  .tag-input::placeholder {
    color: #5c5f66;
  }
  
  .clear-input {
    background: transparent;
    border: none;
    color: #5c5f66;
    padding: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    border-radius: 4px;
    transition: all 0.2s;
  }
  
  .clear-input:hover {
    background: #3c3e44;
    color: #909296;
  }
  
  .suggestions-panel {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: #1a1b1e;
    border: 1px solid #2c2e33;
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    z-index: 100;
    max-height: 200px;
    overflow-y: auto;
  }
  
  .suggestion-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    background: transparent;
    border: none;
    color: #c1c2c5;
    font-size: 0.875rem;
    text-align: left;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.15s;
  }
  
  .suggestion-item:hover,
  .suggestion-item.focused {
    background: #25262b;
    color: #e4e4e7;
  }
  
  .suggestion-item i {
    color: #5c5f66;
    font-size: 0.75rem;
  }
</style>
