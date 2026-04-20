import Dexie from 'dexie'

const db = new Dexie('FeToolsDB')
db.version(1).stores({
  clipboard: '++id, content, timestamp',
  todos: '++id, text, completed, priority, createdAt'
})

export function useDB() {
  return { db }
}
