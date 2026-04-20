import { ref } from 'vue'
import { useDB } from './useDB'

export function useClipboard() {
  const { db } = useDB()
  const items = ref([])
  const MAX_ITEMS = 100
  let lastContent = ''

  const load = async () => {
    items.value = await db.clipboard.orderBy('timestamp').reverse().limit(MAX_ITEMS).toArray()
  }

  const add = async (content) => {
    if (!content || content.trim() === '') return
    if (content === lastContent) return
    lastContent = content

    const existing = await db.clipboard.where('content').equals(content).first()
    if (existing) {
      await db.clipboard.update(existing.id, { timestamp: Date.now() })
    } else {
      await db.clipboard.add({ content: content.trim(), timestamp: Date.now() })
      const count = await db.clipboard.count()
      if (count > MAX_ITEMS) {
        const oldest = await db.clipboard.orderBy('timestamp').first()
        if (oldest) await db.clipboard.delete(oldest.id)
      }
    }
    load()
  }

  const remove = async (id) => {
    await db.clipboard.delete(id)
    load()
  }

  const clear = async () => {
    await db.clipboard.clear()
    load()
  }

  return { items, load, add, remove, clear }
}
