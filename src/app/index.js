import { mount } from 'svelte';
import "@/assets/css/fontawesome-all.min.css";
import "@/assets/css/index.css";
import App from './App.svelte';

// Clear out the old 'new App' logic
const target = document.getElementById('app') || document.body;

mount(App, {
  target: target,
  props: { /* any props you need */ }
});

// Note: If you need to remove the app later,
// you use import { unmount } from 'svelte';