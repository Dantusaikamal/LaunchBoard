
import Dexie, { Table } from 'dexie'

export interface OfflineApp {
  id: string
  name: string
  description?: string
  status: string
  tech_stack?: string[]
  logo_url?: string
  repo_url?: string
  frontend_url?: string
  backend_url?: string
  deployment_url?: string
  monthly_revenue?: number
  users_count?: number
  created_at: string
  updated_at: string
  user_id: string
  synced: boolean
}

export interface OfflineIdea {
  id: string
  title: string
  description?: string
  category: string
  status: string
  rating?: number
  viability_score?: number
  market_size?: string
  target_audience?: string
  tags?: string[]
  created_at: string
  updated_at: string
  user_id: string
  synced: boolean
}

export interface OfflineTask {
  id: string
  title: string
  description?: string
  status: string
  priority?: string
  due_date?: string
  app_id: string
  created_at: string
  updated_at: string
  synced: boolean
}

export interface OfflineNote {
  id: string
  title?: string
  content: string
  type: string
  status?: string
  priority?: string
  tags?: string[]
  app_id: string
  created_at: string
  synced: boolean
}

export interface SyncQueue {
  id?: number
  table: string
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: string
}

export class OfflineDatabase extends Dexie {
  apps!: Table<OfflineApp>
  ideas!: Table<OfflineIdea>
  tasks!: Table<OfflineTask>
  notes!: Table<OfflineNote>
  syncQueue!: Table<SyncQueue>

  constructor() {
    super('LaunchBoardOfflineDB')
    
    this.version(1).stores({
      apps: 'id, name, status, user_id, synced, created_at',
      ideas: 'id, title, category, status, user_id, synced, created_at',
      tasks: 'id, title, status, app_id, synced, created_at',
      notes: 'id, type, app_id, synced, created_at',
      syncQueue: '++id, table, action, timestamp'
    })
  }
}

export const offlineDB = new OfflineDatabase()
