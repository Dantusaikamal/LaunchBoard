
import { offlineDB } from './offline-db'
import { supabase } from '@/integrations/supabase/client'

class OfflineSyncService {
  async addToSyncQueue(table: string, action: 'create' | 'update' | 'delete', data: any) {
    await offlineDB.syncQueue.add({
      table,
      action,
      data,
      timestamp: new Date().toISOString()
    })
  }

  async getUnsyncedCount(): Promise<number> {
    return await offlineDB.syncQueue.count()
  }

  async syncAll(): Promise<void> {
    if (!navigator.onLine) {
      throw new Error('Cannot sync while offline')
    }

    const items = await offlineDB.syncQueue.toArray()
    
    for (const item of items) {
      try {
        await this.syncItem(item)
        await offlineDB.syncQueue.delete(item.id!)
      } catch (error) {
        console.error('Sync failed for item:', item, error)
        // Continue with other items
      }
    }
  }

  private async syncItem(item: any) {
    const { table, action, data } = item
    
    switch (table) {
      case 'apps':
        await this.syncApp(action, data)
        break
      case 'ideas':
        await this.syncIdea(action, data)
        break
      case 'tasks':
        await this.syncTask(action, data)
        break
      case 'notes':
        await this.syncNote(action, data)
        break
    }
  }

  private async syncApp(action: string, data: any) {
    switch (action) {
      case 'create':
        await supabase.from('apps').insert(data)
        break
      case 'update':
        await supabase.from('apps').update(data).eq('id', data.id)
        break
      case 'delete':
        await supabase.from('apps').delete().eq('id', data.id)
        break
    }
  }

  private async syncIdea(action: string, data: any) {
    switch (action) {
      case 'create':
        await supabase.from('ideas').insert(data)
        break
      case 'update':
        await supabase.from('ideas').update(data).eq('id', data.id)
        break
      case 'delete':
        await supabase.from('ideas').delete().eq('id', data.id)
        break
    }
  }

  private async syncTask(action: string, data: any) {
    switch (action) {
      case 'create':
        await supabase.from('tasks').insert(data)
        break
      case 'update':
        await supabase.from('tasks').update(data).eq('id', data.id)
        break
      case 'delete':
        await supabase.from('tasks').delete().eq('id', data.id)
        break
    }
  }

  private async syncNote(action: string, data: any) {
    switch (action) {
      case 'create':
        await supabase.from('notes').insert(data)
        break
      case 'update':
        await supabase.from('notes').update(data).eq('id', data.id)
        break
      case 'delete':
        await supabase.from('notes').delete().eq('id', data.id)
        break
    }
  }

  // Offline CRUD operations
  async createApp(appData: any) {
    const app = { ...appData, synced: false }
    await offlineDB.apps.add(app)
    await this.addToSyncQueue('apps', 'create', app)
    return app
  }

  async updateApp(id: string, appData: any) {
    const app = { ...appData, synced: false }
    await offlineDB.apps.update(id, app)
    await this.addToSyncQueue('apps', 'update', app)
    return app
  }

  async deleteApp(id: string) {
    await offlineDB.apps.delete(id)
    await this.addToSyncQueue('apps', 'delete', { id })
  }

  async getApps() {
    return await offlineDB.apps.toArray()
  }

  async createIdea(ideaData: any) {
    const idea = { ...ideaData, synced: false }
    await offlineDB.ideas.add(idea)
    await this.addToSyncQueue('ideas', 'create', idea)
    return idea
  }

  async updateIdea(id: string, ideaData: any) {
    const idea = { ...ideaData, synced: false }
    await offlineDB.ideas.update(id, idea)
    await this.addToSyncQueue('ideas', 'update', idea)
    return idea
  }

  async deleteIdea(id: string) {
    await offlineDB.ideas.delete(id)
    await this.addToSyncQueue('ideas', 'delete', { id })
  }

  async getIdeas() {
    return await offlineDB.ideas.toArray()
  }

  async createTask(taskData: any) {
    const task = { ...taskData, synced: false }
    await offlineDB.tasks.add(task)
    await this.addToSyncQueue('tasks', 'create', task)
    return task
  }

  async updateTask(id: string, taskData: any) {
    const task = { ...taskData, synced: false }
    await offlineDB.tasks.update(id, task)
    await this.addToSyncQueue('tasks', 'update', task)
    return task
  }

  async deleteTask(id: string) {
    await offlineDB.tasks.delete(id)
    await this.addToSyncQueue('tasks', 'delete', { id })
  }

  async getTasks(appId?: string) {
    if (appId) {
      return await offlineDB.tasks.where('app_id').equals(appId).toArray()
    }
    return await offlineDB.tasks.toArray()
  }

  async createNote(noteData: any) {
    const note = { ...noteData, synced: false }
    await offlineDB.notes.add(note)
    await this.addToSyncQueue('notes', 'create', note)
    return note
  }

  async updateNote(id: string, noteData: any) {
    const note = { ...noteData, synced: false }
    await offlineDB.notes.update(id, note)
    await this.addToSyncQueue('notes', 'update', note)
    return note
  }

  async deleteNote(id: string) {
    await offlineDB.notes.delete(id)
    await this.addToSyncQueue('notes', 'delete', { id })
  }

  async getNotes(appId?: string) {
    if (appId) {
      return await offlineDB.notes.where('app_id').equals(appId).toArray()
    }
    return await offlineDB.notes.toArray()
  }

  // Bulk sync operations
  async syncAppsFromServer() {
    try {
      const { data: apps } = await supabase.from('apps').select('*')
      if (apps) {
        // Clear existing synced apps and add new ones
        await offlineDB.apps.where('synced').equals(1).delete()
        await offlineDB.apps.bulkAdd(apps.map(app => ({ ...app, synced: true })))
      }
    } catch (error) {
      console.error('Failed to sync apps from server:', error)
    }
  }

  async syncIdeasFromServer() {
    try {
      const { data: ideas } = await supabase.from('ideas').select('*')
      if (ideas) {
        await offlineDB.ideas.where('synced').equals(1).delete()
        await offlineDB.ideas.bulkAdd(ideas.map(idea => ({ ...idea, synced: true })))
      }
    } catch (error) {
      console.error('Failed to sync ideas from server:', error)
    }
  }

  async syncTasksFromServer() {
    try {
      const { data: tasks } = await supabase.from('tasks').select('*')
      if (tasks) {
        await offlineDB.tasks.where('synced').equals(1).delete()
        await offlineDB.tasks.bulkAdd(tasks.map(task => ({ ...task, synced: true })))
      }
    } catch (error) {
      console.error('Failed to sync tasks from server:', error)
    }
  }

  async syncNotesFromServer() {
    try {
      const { data: notes } = await supabase.from('notes').select('*')
      if (notes) {
        await offlineDB.notes.where('synced').equals(1).delete()
        await offlineDB.notes.bulkAdd(notes.map(note => ({ ...note, synced: true })))
      }
    } catch (error) {
      console.error('Failed to sync notes from server:', error)
    }
  }
}

export const offlineSyncService = new OfflineSyncService()
