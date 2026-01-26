let logs = $state([]);

export const logger = {
  get entries() { return logs; },

  add(type, message, data = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : null // snapshot
    };
    logs.push(entry);
    if (logs.length > 100) logs.shift(); // keep it light

    // Also log to console for dev
    console[type === 'error' ? 'error' : 'log'](`[IceTab] ${message}`, data || '');
  },

  clear() {
    logs = [];
  },

  // Bridge methods for compatibility with old logger
  log(message, ...args) {
    this.add('log', message, args.length > 0 ? args : null);
  },
  error(message, ...args) {
    this.add('error', message, args.length > 0 ? args : null);
  },
  warn(message, ...args) {
    // Map warn to log or error, or add specific type
    this.add('warn', message, args.length > 0 ? args : null);
  },
  info(message, ...args) {
    this.add('info', message, args.length > 0 ? args : null);
  },
  debug(message, ...args) {
    // debug might be verbose, maybe optional?
    this.add('debug', message, args.length > 0 ? args : null);
  },
  init() {
    // No-op for compatibility
  }
};

export default logger;
