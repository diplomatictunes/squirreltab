import { mount } from 'svelte';
import App from './App.svelte';

// Clear out the old 'new App' logic
const target = document.getElementById('app') || document.body;

const app = mount(App, {
  target: target,
  props: { /* any props you need */ }
});

// Note: If you need to remove the app later,
// you use import { unmount } from 'svelte';