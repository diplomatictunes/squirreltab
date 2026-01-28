const MAX_LOG_ENTRIES = 100

const logs = []

export const logSyncEvent = (event, details = {}) => {
  const entry = {
    timestamp: Date.now(),
    event,
    ...details,
  }

  logs.push(entry)
  if (logs.length > MAX_LOG_ENTRIES) {
    logs.shift()
  }

  console.log(`[SyncLog] ${event}`, details)
}

export const getSyncLogs = () => [...logs]

export const clearSyncLogs = () => {
  logs.length = 0
}

export const exportSyncLogs = () => {
  return JSON.stringify(logs, null, 2)
}