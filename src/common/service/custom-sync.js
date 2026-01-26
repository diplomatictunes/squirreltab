import storage from '../storage'
import { SYNCED_LIST_PROPS } from '../constants'
import _ from 'lodash'

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
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export const upload = async (list) => {
  const syncedData = _.pick(list, SYNCED_LIST_PROPS)
  // The API contract expects 'remote_id' instead of '_id'
  return fetchData('/sync/push', 'POST', {
    remote_id: syncedData._id,
    ..._.omit(syncedData, '_id'),
  })
}

export const download = async () => {
  return fetchData('/sync/pull', 'GET')
}

export const health = async () => {
  const { baseUrl } = await getSettings()
  const response = await fetch(`${baseUrl}/health`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export const AI = {
  categorize: async (tabs) => {
    return fetchData('/ai/categorize', 'POST', { tabs })
  },
}

export default {
  upload,
  download,
  health,
  AI,
}
