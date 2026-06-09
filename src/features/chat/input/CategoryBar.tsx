import { useState, useCallback, useEffect } from 'react'
import { MODULE_DEFINITIONS, useModuleDirectories } from '../../../store/moduleStore'
import { useDirectory } from '../../../contexts/useDirectory'

const STORAGE_KEY_ACTIVE_MODULE = 'opencode-active-module'

export interface CategoryBarProps {
  /** 外部可覆盖模块列表（默认用 MODULE_DEFINITIONS） */
  categories?: Array<{ id: string; label: string }>
}

export function CategoryBar({ categories }: CategoryBarProps) {
  const modules = categories ?? MODULE_DEFINITIONS
  const moduleDirectories = useModuleDirectories()
  const { setCurrentDirectory, addDirectory } = useDirectory()

  // 从 localStorage 恢复上次选中的模块，没有则默认第一个
  const [activeModuleId, setActiveModuleId] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACTIVE_MODULE)
      if (stored && modules.some(m => m.id === stored)) return stored
    } catch { /* ignore */ }
    return modules[0]?.id ?? ''
  })

  const handleClick = useCallback(
    (moduleId: string) => {
      setActiveModuleId(moduleId)
      try {
        localStorage.setItem(STORAGE_KEY_ACTIVE_MODULE, moduleId)
      } catch { /* ignore */ }
      const dir = moduleDirectories[moduleId]
      if (dir) {
        addDirectory(dir)
        setCurrentDirectory(dir)
      }
    },
    [moduleDirectories, setCurrentDirectory, addDirectory],
  )

  // 组件挂载时，如果上次选中的模块有对应目录，自动切换
  useEffect(() => {
    const dir = moduleDirectories[activeModuleId]
    if (dir) {
      addDirectory(dir)
      setCurrentDirectory(dir)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 只在挂载时执行一次

  return (
    <div className="flex items-center justify-center gap-2 px-3 pt-3 pb-1 pointer-events-auto">
      {modules.map(cat => {
        const isActive = cat.id === activeModuleId
        const hasDir = Boolean(moduleDirectories[cat.id])
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleClick(cat.id)}
            className={`px-4 py-1.5 rounded-full text-[length:var(--fs-sm)] font-medium transition-all ${
              isActive
                ? 'bg-accent-main-100 text-oncolor-100 shadow-sm'
                : 'bg-bg-200 text-text-400 hover:text-text-200 hover:bg-bg-300'
            } ${!hasDir ? 'opacity-60' : ''}`}
            title={hasDir ? moduleDirectories[cat.id] : `${cat.label}（未配置目录）`}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
