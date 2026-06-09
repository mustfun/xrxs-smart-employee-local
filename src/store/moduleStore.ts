import { useSyncExternalStore } from 'react'

// ============================================
// Types
// ============================================

export interface ModuleDefinition {
  id: string
  label: string
}

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  { id: 'employee', label: '员工' },
  { id: 'approval', label: '审批' },
  { id: 'recruit', label: '招聘' },
  { id: 'performance', label: '绩效' },
  { id: 'attendance', label: '考勤' },
  { id: 'account', label: '账户' },
  { id: 'mobile', label: '移动端' },
  { id: 'notification', label: '通知' },
]

export type ModuleDirectoryMap = Record<string, string>

// ============================================
// Storage
// ============================================

const STORAGE_KEY = 'opencode-module-directories'

function loadFromStorage(): ModuleDirectoryMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return {}
}

function saveToStorage(map: ModuleDirectoryMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // ignore
  }
}

// ============================================
// Store
// ============================================

type Listener = () => void

class ModuleStore {
  private map: ModuleDirectoryMap = loadFromStorage()
  private listeners: Set<Listener> = new Set()
  private _snapshot: ModuleDirectoryMap = { ...this.map }

  // ------------------------------------------
  // Getters
  // ------------------------------------------

  getDirectory(moduleId: string): string {
    return this.map[moduleId] ?? ''
  }

  getAll(): ModuleDirectoryMap {
    return { ...this.map }
  }

  getSnapshot = (): ModuleDirectoryMap => {
    return this._snapshot
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  // ------------------------------------------
  // Mutations
  // ------------------------------------------

  setDirectory(moduleId: string, directory: string): void {
    if (directory) {
      this.map[moduleId] = directory
    } else {
      delete this.map[moduleId]
    }
    this.persist()
  }

  setAll(map: ModuleDirectoryMap): void {
    this.map = { ...map }
    this.persist()
  }

  removeModule(moduleId: string): void {
    delete this.map[moduleId]
    this.persist()
  }

  // ------------------------------------------
  // Internal
  // ------------------------------------------

  private persist(): void {
    saveToStorage(this.map)
    this._snapshot = { ...this.map }
    this.listeners.forEach(l => l())
  }
}

export const moduleStore = new ModuleStore()

// ============================================
// React Hook
// ============================================

export function useModuleDirectories(): ModuleDirectoryMap {
  return useSyncExternalStore(moduleStore.subscribe, moduleStore.getSnapshot, moduleStore.getSnapshot)
}
