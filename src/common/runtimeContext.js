const POPUP_CONTEXT = 'popup';

export const getRuntimeSource = () => {
  if (typeof window === 'undefined' || typeof window.location === 'undefined') {
    return 'app';
  }
  const params = new URLSearchParams(window.location.search || '');
  return params.get('context') === POPUP_CONTEXT ? POPUP_CONTEXT : 'app';
};

export const isPopupContext = () => getRuntimeSource() === POPUP_CONTEXT;

