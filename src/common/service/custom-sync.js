import storage from '../storage'
import { SYNCED_LIST_PROPS } from '../constants'
import _ from 'lodash'

export class SyncError extends Error {
  constructor(message, { code = 'unknown', status = null } = {}) {
    super(message)
    this.name = 'SyncError'
    this.code = code
    this.status = status
  }
}

const getSettings = async () => {
  const opts = await storage.getOptions()
  return {
    baseUrl: opts.syncBaseUrl || 'http://localhost:8000',
    apiKey: opts.syncApiKey || '',
  }
}

const fetchData = async (path, method = 'GET', body = null) => {
  const { baseUrl, apiKey } = await getSettings()
  const url = `${baseUrl}${path}`
  const headers = {
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
  }
  const options = {
    method,
    headers,
  }
  if (body) {
    options.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(url, options)
  } catch (error) {
    throw new SyncError('Unable to reach sync service', { code: 'offline' })
  }

  if (response.status === 401 || response.status === 403) {
    throw new SyncError('Invalid or missing sync credentials', { code: 'auth', status: response.status })
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new SyncError(text || `Sync failed (${response.status})`, { code: 'server', status: response.status })
  }

  if (response.status === 204) return null
  return response.json()
}

const serializeListForSync = list => {
  const syncedData = _.pick(list, SYNCED_LIST_PROPS)
  return {
    remote_id: syncedData._id,
    title: syncedData.title || '',
    tabs: syncedData.tabs || [],
    category: syncedData.category || '',
    tags: syncedData.tags || [],
    time: syncedData.time || Date.now(),
    pinned: Boolean(syncedData.pinned),
    color: syncedData.color || '',
    updated_at: syncedData.updatedAt || syncedData.time || Date.now(),
  }
}

export const upload = async list => {
  const payload = serializeListForSync(list)
  const response = await fetchData('/sync/push', 'POST', payload)
  if (!response || response.status !== 'success') {
    throw new SyncError('Server rejected push', { code: 'server' })
  }
  return response
}

export const syncState = async lists => {
  const payload = {
    lists: (lists || []).map(serializeListForSync),
  }
  const response = await fetchData('/sync/state', 'POST', payload)
  if (!response || response.status !== 'success') {
    throw new SyncError('Server rejected sync', { code: 'server' })
  }
  return response
}

export const download = async () => {
  const data = await fetchData('/sync/pull', 'GET')
  if (Array.isArray(data)) {
    return { lists: data, updated_at: null }
  }
  return data
}

export const health = async () => {
  const { baseUrl } = await getSettings()
  const response = await fetch(`${baseUrl}/health`)
  if (!response.ok) {
    throw new SyncError(`Health check failed (${response.status})`, { code: 'server', status: response.status })
  }
  return response.json()
}

export const AI = {
  categorize: async tabs => {
    return fetchData('/ai/categorize', 'POST', { tabs })
  },
}

export default {
  upload,
  syncState,
  download,
  health,
  AI,
  SyncError,
}
