'use client'

// ============================================
// FORM PERSISTENCE UTILITY
// ============================================
// Provides auto-save and recovery functionality for multi-step forms

const STORAGE_PREFIX = 'pioneer_form_'
const EXPIRY_HOURS = 72 // Forms expire after 72 hours

interface StoredFormData {
  data: Record<string, unknown>
  step: number
  timestamp: number
  version: number
}

/**
 * Generate a unique form key based on form type and optional identifier
 */
function getFormKey(formType: string, identifier?: string): string {
  const key = identifier ? `${formType}_${identifier}` : formType
  return `${STORAGE_PREFIX}${key}`
}

/**
 * Check if stored data has expired
 */
function isExpired(timestamp: number): boolean {
  const now = Date.now()
  const expiryMs = EXPIRY_HOURS * 60 * 60 * 1000
  return now - timestamp > expiryMs
}

/**
 * Save form progress to localStorage
 */
export function saveFormProgress<T extends Record<string, unknown>>(
  formType: string,
  data: T,
  step: number,
  identifier?: string,
  version: number = 1
): void {
  if (typeof window === 'undefined') return

  const key = getFormKey(formType, identifier)
  const stored: StoredFormData = {
    data,
    step,
    timestamp: Date.now(),
    version,
  }

  try {
    localStorage.setItem(key, JSON.stringify(stored))
  } catch (error) {
    console.warn('[FormPersistence] Failed to save form progress:', error)
    // If localStorage is full, try to clear old forms
    clearExpiredForms()
    try {
      localStorage.setItem(key, JSON.stringify(stored))
    } catch {
      console.error('[FormPersistence] Unable to save form progress')
    }
  }
}

/**
 * Load saved form progress from localStorage
 */
export function loadFormProgress<T extends Record<string, unknown>>(
  formType: string,
  identifier?: string,
  currentVersion: number = 1
): { data: T; step: number } | null {
  if (typeof window === 'undefined') return null

  const key = getFormKey(formType, identifier)

  try {
    const stored = localStorage.getItem(key)
    if (!stored) return null

    const parsed: StoredFormData = JSON.parse(stored)

    // Check if data is expired
    if (isExpired(parsed.timestamp)) {
      clearFormProgress(formType, identifier)
      return null
    }

    // Check version compatibility
    if (parsed.version !== currentVersion) {
      // Version mismatch - form structure may have changed
      console.warn('[FormPersistence] Version mismatch, clearing old data')
      clearFormProgress(formType, identifier)
      return null
    }

    return {
      data: parsed.data as T,
      step: parsed.step,
    }
  } catch (error) {
    console.warn('[FormPersistence] Failed to load form progress:', error)
    return null
  }
}

/**
 * Clear saved form progress
 */
export function clearFormProgress(formType: string, identifier?: string): void {
  if (typeof window === 'undefined') return

  const key = getFormKey(formType, identifier)
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn('[FormPersistence] Failed to clear form progress:', error)
  }
}

/**
 * Check if there's saved progress for a form
 */
export function hasFormProgress(formType: string, identifier?: string): boolean {
  if (typeof window === 'undefined') return false

  const key = getFormKey(formType, identifier)
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return false

    const parsed: StoredFormData = JSON.parse(stored)
    return !isExpired(parsed.timestamp)
  } catch {
    return false
  }
}

/**
 * Get the last saved timestamp for a form
 */
export function getFormProgressTimestamp(formType: string, identifier?: string): Date | null {
  if (typeof window === 'undefined') return null

  const key = getFormKey(formType, identifier)
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return null

    const parsed: StoredFormData = JSON.parse(stored)
    return new Date(parsed.timestamp)
  } catch {
    return null
  }
}

/**
 * Clear all expired forms from localStorage
 */
export function clearExpiredForms(): void {
  if (typeof window === 'undefined') return

  try {
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(STORAGE_PREFIX)) continue

      try {
        const stored = localStorage.getItem(key)
        if (!stored) continue

        const parsed: StoredFormData = JSON.parse(stored)
        if (isExpired(parsed.timestamp)) {
          keysToRemove.push(key)
        }
      } catch {
        // Invalid data, remove it
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key))

    if (keysToRemove.length > 0) {
      console.log(`[FormPersistence] Cleared ${keysToRemove.length} expired forms`)
    }
  } catch (error) {
    console.warn('[FormPersistence] Failed to clear expired forms:', error)
  }
}

// ============================================
// REACT HOOKS
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseFormPersistenceOptions<T> {
  formType: string
  identifier?: string
  version?: number
  debounceMs?: number
  initialData: T
  initialStep?: number
}

interface UseFormPersistenceReturn<T> {
  data: T
  step: number
  setData: (data: T | ((prev: T) => T)) => void
  setStep: (step: number) => void
  clearProgress: () => void
  hasRestoredData: boolean
  lastSaved: Date | null
}

/**
 * React hook for form persistence with auto-save
 */
export function useFormPersistence<T extends Record<string, unknown>>(
  options: UseFormPersistenceOptions<T>
): UseFormPersistenceReturn<T> {
  const {
    formType,
    identifier,
    version = 1,
    debounceMs = 1000,
    initialData,
    initialStep = 1,
  } = options

  const [data, setDataState] = useState<T>(initialData)
  const [step, setStepState] = useState(initialStep)
  const [hasRestoredData, setHasRestoredData] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef(false)

  // Load saved progress on mount
  useEffect(() => {
    if (isInitializedRef.current) return
    isInitializedRef.current = true

    const saved = loadFormProgress<T>(formType, identifier, version)
    if (saved) {
      setDataState(saved.data)
      setStepState(saved.step)
      setHasRestoredData(true)
      setLastSaved(getFormProgressTimestamp(formType, identifier))
    }
  }, [formType, identifier, version])

  // Auto-save with debounce
  const saveProgress = useCallback(() => {
    saveFormProgress(formType, data, step, identifier, version)
    setLastSaved(new Date())
  }, [formType, data, step, identifier, version])

  // Debounced save effect
  useEffect(() => {
    if (!isInitializedRef.current) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(saveProgress, debounceMs)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [data, step, saveProgress, debounceMs])

  // Save immediately before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveFormProgress(formType, data, step, identifier, version)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [formType, data, step, identifier, version])

  const setData = useCallback((newData: T | ((prev: T) => T)) => {
    setDataState(prev => {
      const updated = typeof newData === 'function' ? (newData as (prev: T) => T)(prev) : newData
      return updated
    })
  }, [])

  const setStep = useCallback((newStep: number) => {
    setStepState(newStep)
  }, [])

  const clearProgress = useCallback(() => {
    clearFormProgress(formType, identifier)
    setHasRestoredData(false)
    setLastSaved(null)
  }, [formType, identifier])

  return {
    data,
    step,
    setData,
    setStep,
    clearProgress,
    hasRestoredData,
    lastSaved,
  }
}

// ============================================
// RECOVERY DIALOG COMPONENT
// ============================================

interface FormRecoveryDialogProps {
  isOpen: boolean
  lastSaved: Date | null
  onRestore: () => void
  onDiscard: () => void
}

export function FormRecoveryDialog({
  isOpen,
  lastSaved,
  onRestore,
  onDiscard,
}: FormRecoveryDialogProps): React.ReactElement | null {
  if (!isOpen) return null

  const timeAgo = lastSaved
    ? formatTimeAgo(lastSaved)
    : 'some time ago'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">
              Resume Your Progress?
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              We found unsaved progress from {timeAgo}. Would you like to continue where you left off?
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onDiscard}
            className="flex-1 px-4 py-2.5 text-slate-400 hover:text-white border border-slate-700 rounded-lg transition-colors"
          >
            Start Fresh
          </button>
          <button
            onClick={onRestore}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
