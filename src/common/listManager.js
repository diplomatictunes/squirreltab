import {
  SYNCED_LIST_PROPS,
  END_FRONT,
  END_BACKGROUND,
  ADD_LIST,
  UPDATE_LIST_BY_ID,
  REMOVE_LIST_BY_ID,
  CHANGE_LIST_ORDER,
} from './constants'
import {isBackground, sendMessage, Mutex} from './utils'

const cache = { lists: null, ops: null }
const RWLock = new Mutex()
const isObject = value => value && typeof value === 'object'
const isValidTab = tab => isObject(tab) && typeof tab.url === 'string'
const isValidList = list => isObject(list) && typeof list._id === 'string' && Array.isArray(list.tabs) && list.tabs.every(isValidTab)
// Validate list collections at storage boundaries so corrupt state never reaches persistence.
const ensureValidLists = (lists, context) => {
  if (!Array.isArray(lists)) {
    const error = new Error(`[listManager] invalid lists state (${context}): expected array`)
    console.error(error.message, {lists})
    throw error
  }
  for (let i = 0; i < lists.length; i += 1) {
    const list = lists[i]
    if (!isValidList(list)) {
      const error = new Error(`[listManager] invalid list entry (${context}) at index ${i}`)
      console.error(error.message, {list})
      throw error
    }
  }
}
const getStorage = async () => {
  const unlockRW = await RWLock.lock()
  if (cache.lists && cache.ops) {
    await unlockRW()
    return cache
  }
  const {lists, ops} = await chrome.storage.local.get(['lists', 'ops'])
  const hydratedLists = lists || []
  try {
    ensureValidLists(hydratedLists, 'storage read')
  } catch (error) {
    await unlockRW()
    throw error
  }
  cache.lists = hydratedLists
  cache.ops = ops || []
  await unlockRW()
  return cache
}
const compressOps = ops => {
  console.debug('[listManager] compress ops: (before)', ops)
  const removed = []
  const updated = {}
  const finalOps = []
  for (let i = ops.length - 1; i > -1; i -= 1) {
    const op = ops[i]
    // ignore all actions for the list if that list will be removed finally
    if (op.args && op.args[0] && removed.includes(op.args[0]._id)
      || typeof op.args[0] === 'string' && removed.includes(op.args[0])) continue

    if (op.method === 'removeListById') {
      removed.push(op.args[0])
      finalOps.unshift(op)
    } else if (op.method === 'updateListById') {
      // keep the final result of every property if a list will be updated
      const [listId, newList, time] = op.args
      if (updated[listId]) {
        for (const key in newList) {
          if (key in updated[listId]) continue
          updated[listId][key] = newList[key]
        }
        continue
      } else {
        updated[listId] = Object.assign({}, newList)
        finalOps.unshift({method: 'updateListById', args: [listId, updated[listId], time]})
      }
    } else if (op.method === 'changeListOrderRelatively') {
      // combine the value if a list is reordered continuously
      if (i > 0 && ops[i - 1].method === 'changeListOrderRelatively' && op.args[0] === ops[i - 1].args[0]) {
        ops[i - 1].args[1] += ops[i].args[1]
      } else finalOps.unshift(op)
    } else {
      // do nothing if add a list
      finalOps.unshift(op)
    }
  }
  console.debug('[listManager] compress ops: (after)', finalOps)
  return finalOps
}

const manager = {}
// lists modifier (return true if need to add ops)
manager.modifiers = {
  [ADD_LIST](lists, [list]) {
    if (~lists.findIndex(i => i._id === list._id)) return
    lists.unshift(list)
    return [list]
  },
  [UPDATE_LIST_BY_ID](lists, [listId, newList, time = Date.now()]) {
    const normal = Object.keys(newList).some(k => SYNCED_LIST_PROPS.includes(k))
    for (let i = 0; i < lists.length; i += 1) {
      if (lists[i]._id !== listId) continue
      const list = lists[i]
      for (const [k, v] of Object.entries(newList)) {
        list[k] = v
      }
      if (normal) list.updatedAt = time
      return normal ? [listId, newList, time] : null
    }
  },
  [REMOVE_LIST_BY_ID](lists, [listId]) {
    const index = lists.findIndex(list => list._id === listId)
    lists.splice(index, 1)
    return [listId]
  },
  [CHANGE_LIST_ORDER](lists, [listId, diff]) {
    const index = lists.findIndex(list => list._id === listId)
    const [list] = lists.splice(index, 1)
    lists.splice(index + diff, 0, list)
    return [listId, diff]
  },
}

// use myself throttle function to replace Lodash.throttle to make sure
// this function cannot be executed concurrently
const saveStorage = async (lists, ops) => {
  const unlock = await RWLock.lock()
  const data = {
    lists,
    ops: compressOps(ops)
  }
  ensureValidLists(lists, 'pre-save')
  await chrome.storage.local.set(data)
  cache.lists = cache.ops = null
  await sendMessage({refresh: true})
  await unlock()
}
// avoid getting storage at the same time
const _modifyQueue = []
const _startModifyWork = (lists, ops) => new Promise(resolve => {
  while (_modifyQueue.length) {
    const [method, args] = _modifyQueue.shift()
    const opArgs = manager.modifiers[method](lists, args)
    if (opArgs) ops.push({method, args: opArgs, time: Date.now()})
  }
  setTimeout(() => {
    if (_modifyQueue.length) _startModifyWork(lists, ops).then(resolve)
    else resolve()
  }, 100)
})

let _working = false
const applyChangesToStorage = async (method, args) => {
  _modifyQueue.push([method, args])
  // not need to start work if modify work is processing
  if (_working) return
  _working = true
  const {lists, ops} = await getStorage()
  await _startModifyWork(lists, ops)
  // from here won't modify data if do not call start function
  _working = false
  await saveStorage(lists, ops)
}
const addEventListener = (receiveFrom, callback) => chrome.runtime.onMessage.addListener(({listModifed, from}) => {
  if (receiveFrom !== from || !listModifed) return
  const {method, args} = listModifed
  return callback(method, args)
})
const genMethods = isBackground => {
  Object.keys(manager.modifiers).forEach(method => {
    manager[method] = isBackground ? async (...args) => { // for background
      console.debug('[list manager] modify list:', method, ...args)
      await sendMessage({listModifed: {method, args}, from: END_BACKGROUND})
      // no need to await changes applied for close tabs immediately
      applyChangesToStorage(method, args)
    } : async (...args) => { // for front end
      console.debug('[list manager] call to modify list:', name, ...args)
      await sendMessage({listModifed: {method, args}, from: END_FRONT})
    }
  })
}
manager.init = async () => {
  if (manager.inited) return
  manager.inited = true
  const _isBackground = await isBackground()
  if (_isBackground) await addEventListener(END_FRONT, applyChangesToStorage)
  genMethods(_isBackground)
}
manager.mapMutations = () => {
  const mutations = {}
  Object.entries(manager.modifiers).forEach(([method, fn]) => {
    mutations[method] = (state, payload) => fn(state.lists, payload)
  })
  mutations.receiveData = (state, {method, args}) => {
    manager.modifiers[method](state.lists, args)
  }
  return mutations
}
manager.createVuexPlugin = () => store => {
  addEventListener(END_BACKGROUND, (method, args) => {
    store.commit('receiveData', {method, args})
  })
  chrome.runtime.onMessage.addListener(({refreshed}) => {
    if (refreshed && refreshed.success) store.dispatch('getLists')
  })
  store.subscribe(({type, payload}) => {
    if (type in manager.modifiers) {
      manager[type](...payload)
    }
  })
}
manager.RWLock = RWLock
manager.isWorking = () => _working
export default manager
