import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog } from '../../components/ui/Dialog'
import { FolderIcon } from '../../components/Icons'
import { moduleStore, MODULE_DEFINITIONS } from '../../store/moduleStore'
import { useDirectory } from '../../contexts/useDirectory'

interface ModuleSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ModuleSettingsDialog({ isOpen, onClose }: ModuleSettingsDialogProps) {
  const { t } = useTranslation(['common', 'chat'])
  const { savedDirectories } = useDirectory()

  // Local draft state — edits are only committed on Save
  const [draft, setDraft] = useState<Record<string, string>>({})

  // When dialog opens, seed draft from the store
  useEffect(() => {
    if (isOpen) {
      setDraft({ ...moduleStore.getAll() })
    }
  }, [isOpen])

  const handlePathChange = useCallback((moduleId: string, path: string) => {
    setDraft(prev => ({ ...prev, [moduleId]: path }))
  }, [])

  const handleSelectFromSaved = useCallback((moduleId: string, path: string) => {
    setDraft(prev => ({ ...prev, [moduleId]: path }))
  }, [])

  const handleSave = useCallback(() => {
    moduleStore.setAll(draft)
    onClose()
  }, [draft, onClose])

  const handleCancel = useCallback(() => {
    onClose()
  }, [onClose])

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleCancel}
      title={t('common:moduleSettings.title', '模块目录设置')}
      width={520}
    >
      <div className="flex flex-col gap-4 p-1">
        <p className="text-[length:var(--fs-sm)] text-text-400">
          {t('common:moduleSettings.description', '为每个模块配置对应的工作目录，点击模块按钮时将自动切换到该目录。')}
        </p>

        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
          {MODULE_DEFINITIONS.map(module => (
            <ModuleRow
              key={module.id}
              module={module}
              currentPath={draft[module.id] ?? ''}
              savedDirectories={savedDirectories}
              onPathChange={handlePathChange}
              onSelectSaved={handleSelectFromSaved}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-200/30">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg text-[length:var(--fs-sm)] font-medium text-text-300 hover:text-text-100 hover:bg-bg-200 transition-colors"
          >
            {t('common:cancel', '取消')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-[length:var(--fs-sm)] font-medium bg-accent-main-100 text-oncolor-100 hover:bg-accent-main-200 transition-colors"
          >
            {t('common:save', '保存')}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

// ============================================
// Module Row
// ============================================

interface ModuleRowProps {
  module: { id: string; label: string }
  currentPath: string
  savedDirectories: Array<{ path: string; name: string }>
  onPathChange: (moduleId: string, path: string) => void
  onSelectSaved: (moduleId: string, path: string) => void
}

function ModuleRow({ module, currentPath, savedDirectories, onPathChange, onSelectSaved }: ModuleRowProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[length:var(--fs-sm)] font-medium text-text-200">
        {module.label}
      </label>
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <FolderIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-400 pointer-events-none" />
            <input
              type="text"
              value={currentPath}
              onChange={e => onPathChange(module.id, e.target.value)}
              placeholder="输入目录路径，或从下方选择"
              className="w-full pl-8 pr-3 py-2 bg-bg-200/50 border border-border-200/40 rounded-lg text-[length:var(--fs-sm)] text-text-100 placeholder:text-text-500 focus:outline-none focus:border-accent-main-100/50 transition-colors"
            />
          </div>
          {savedDirectories.length > 0 && (
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-3 py-2 rounded-lg text-[length:var(--fs-sm)] text-text-400 hover:text-text-100 bg-bg-200/50 hover:bg-bg-300 border border-border-200/40 transition-colors shrink-0"
            >
              选择
            </button>
          )}
        </div>

        {/* Dropdown for saved directories */}
        {showDropdown && savedDirectories.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 glass-alt border border-border-200/60 rounded-lg shadow-lg overflow-hidden">
            <div className="max-h-40 overflow-y-auto custom-scrollbar">
              {savedDirectories.map(dir => (
                <button
                  key={dir.path}
                  type="button"
                  onClick={() => {
                    onSelectSaved(module.id, dir.path)
                    setShowDropdown(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-[length:var(--fs-sm)] text-text-300 hover:text-text-100 hover:bg-bg-200/50 transition-colors"
                >
                  <FolderIcon size={14} className="text-text-400 shrink-0" />
                  <span className="truncate">{dir.path}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
