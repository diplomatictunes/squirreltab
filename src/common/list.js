import _ from 'lodash'
import { genObjectId } from './utils'
import { normalizeTab } from './tab'
import { PICKED_LIST_RPOPS } from './constants'

const FALLBACK_TITLE_FORMATTER = Intl.DateTimeFormat
  ? new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  : null

const buildFallbackTitle = timestamp => {
  const date = new Date(timestamp || Date.now())
  if (Number.isNaN(date.getTime())) {
    return `Stash ${Date.now()}`
  }
  if (FALLBACK_TITLE_FORMATTER) {
    return `Stash · ${FALLBACK_TITLE_FORMATTER.format(date)}`
  }
  return `Stash ${date.toLocaleString()}`
}

export const createNewTabList = ({ _id, tabs, title, tags, category, time, pinned, expand, color, updatedAt }) => {
  const resolvedTime = time || Date.now()
  const normalizedTitle = (title || '').trim()
  return {
    _id: _id || genObjectId(),
    tabs: Array.isArray(tabs) ? tabs.map(normalizeTab) : [],
    title: normalizedTitle || buildFallbackTitle(resolvedTime),
    tags: tags || [],
    category: category || '',
    time: resolvedTime,
    titleEditing: false,
    pinned: pinned === true, // default is false
    expand: expand !== false, // default is true
    color: color || '',
    updatedAt: updatedAt || resolvedTime,
    aiSuggestedTitle: '',
    aiSuggestedTags: [],
    aiSuggestionMeta: null,
  }
}

export const validateList = list => list != null && Array.isArray(list.tabs)

// Preserving the needed properties before store lists.
export const normalizeList = list => {
  // If a list has no _id, assign a new one.
  if (!list._id) {
    list._id = genObjectId()
  }
  const normalizedList = _.pick(list, PICKED_LIST_RPOPS)
  normalizedList.tabs = normalizedList.tabs.map(normalizeTab)
  return normalizedList
}

export default { createNewTabList, normalizeList, validateList }
