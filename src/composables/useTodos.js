import { ref } from 'vue'
import { useDB } from './useDB'

export function useTodos() {
  const { db } = useDB()
  const todos = ref([])

  const load = async () => {
    todos.value = await db.todos.orderBy('createdAt').reverse().toArray()
  }

  const add = async (text, priority) => {
    await db.todos.add({
      text,
      priority,
      completed: false,
      createdAt: Date.now()
    })
    load()
  }

  const toggle = async (id) => {
    const todo = await db.todos.get(id)
    await db.todos.update(id, { completed: !todo.completed })
    load()
  }

  const remove = async (id) => {
    await db.todos.delete(id)
    load()
  }

  return { todos, load, add, toggle, remove }
}
