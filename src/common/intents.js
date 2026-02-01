import browser from 'webextension-polyfill';
import { RUNTIME_MESSAGES } from './constants';

export const sendStashCurrentTabIntent = (source = 'app') => {
  return browser.runtime.sendMessage({
    type: RUNTIME_MESSAGES.STASH_CURRENT_TAB,
    payload: { source },
  });
};

