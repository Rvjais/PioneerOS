'use client'

import { ReactNode, createContext, useContext, useState, useEffect } from 'react'
import Image from 'next/image'
import { BRAND } from '@/shared/constants/constants'

// ============================================
// THEME SYSTEM
// ============================================

export type FormTheme = 'dark' | 'light' | 'embed'

interface ThemeConfig {
  background: string
  headerBg: string
  footerBg: string
  cardBg: string
  cardBorder: string
  cardHeaderBg: string
  inputBg: string
  inputBorder: string
  inputFocusBorder: string
  inputFocusRing: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  labelText: string
  selectCardBg: string
  selectCardBorder: string
  selectCardHoverBg: string
  selectCardSelectedBg: string
  selectCardSelectedBorder: string
  checkboxBg: string
  checkboxBorder: string
  successBg: string
}

const themes: Record<FormTheme, ThemeConfig> = {
  dark: {
    background: 'bg-[#0B0E14]',
    headerBg: 'bg-slate-900/80 backdrop-blur-xl border-b border-white/10',
    footerBg: 'bg-slate-900/50 border-t border-white/10',
    cardBg: 'bg-slate-900/50 backdrop-blur-xl',
    cardBorder: 'border border-white/10',
    cardHeaderBg: 'bg-slate-800/50',
    inputBg: 'bg-slate-800/50',
    inputBorder: 'border-white/10',
    inputFocusBorder: 'focus:border-indigo-500',
    inputFocusRing: 'focus:ring-2 focus:ring-indigo-500/20',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-400',
    textMuted: 'text-slate-500',
    labelText: 'text-slate-200',
    selectCardBg: 'bg-slate-800/30',
    selectCardBorder: 'border-white/10',
    selectCardHoverBg: 'hover:bg-slate-800/50 hover:border-white/20',
    selectCardSelectedBg: 'bg-indigo-500/10',
    selectCardSelectedBorder: 'border-indigo-500',
    checkboxBg: 'bg-slate-800/50',
    checkboxBorder: 'border-white/20',
    successBg: 'bg-[#0B0E14]',
  },
  light: {
    background: 'bg-gradient-to-br from-slate-50 via-white to-slate-100',
    headerBg: 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm',
    footerBg: 'bg-white/50 border-t border-slate-200/50',
    cardBg: 'bg-white',
    cardBorder: 'border border-slate-200/50 shadow-lg shadow-slate-200/50',
    cardHeaderBg: 'bg-gradient-to-r from-slate-50 to-white',
    inputBg: 'bg-white',
    inputBorder: 'border-slate-300',
    inputFocusBorder: 'focus:border-blue-500',
    inputFocusRing: 'focus:ring-4 focus:ring-blue-500/10',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    textMuted: 'text-slate-500',
    labelText: 'text-slate-700',
    selectCardBg: 'bg-white',
    selectCardBorder: 'border-slate-200',
    selectCardHoverBg: 'hover:bg-slate-50 hover:border-slate-300',
    selectCardSelectedBg: 'bg-blue-50',
    selectCardSelectedBorder: 'border-blue-500',
    checkboxBg: 'bg-white',
    checkboxBorder: 'border-slate-300',
    successBg: 'bg-gradient-to-br from-green-50 via-white to-emerald-50',
  },
  embed: {
    background: 'bg-slate-900',
    headerBg: 'bg-transparent',
    footerBg: 'bg-transparent',
    cardBg: 'bg-slate-800/50 backdrop-blur-xl',
    cardBorder: 'border border-white/10',
    cardHeaderBg: 'bg-slate-800/30',
    inputBg: 'bg-slate-800/50',
    inputBorder: 'border-white/10',
    inputFocusBorder: 'focus:border-indigo-500',
    inputFocusRing: 'focus:ring-2 focus:ring-indigo-500/20',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-400',
    textMuted: 'text-slate-500',
    labelText: 'text-slate-200',
    selectCardBg: 'bg-slate-800/30',
    selectCardBorder: 'border-white/10',
    selectCardHoverBg: 'hover:bg-slate-800/50 hover:border-white/20',
    selectCardSelectedBg: 'bg-indigo-500/10',
    selectCardSelectedBorder: 'border-indigo-500',
    checkboxBg: 'bg-slate-800/50',
    checkboxBorder: 'border-white/20',
    successBg: 'bg-slate-900',
  },
}

// Theme context for nested components
const ThemeContext = createContext<FormTheme>('dark')
export const useFormTheme = () => useContext(ThemeContext)
export const getThemeConfig = (theme: FormTheme) => themes[theme]

// ============================================
// FORM ALERT (Banners)
// ============================================

interface FormAlertProps {
  message: string
  type?: 'error' | 'warning' | 'info' | 'success'
  onClose?: () => void
  className?: string
}

export function FormAlert({ message, type = 'error', onClose, className = '' }: FormAlertProps) {
  const theme = useFormTheme()
  const t = themes[theme]
  
  const styles = {
    error: 'bg-red-500/10 border-red-500/50 text-red-100',
    warning: 'bg-amber-500/10 border-amber-500/50 text-amber-100',
    info: 'bg-blue-500/10 border-blue-500/50 text-blue-100',
    success: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-100',
  }
  
  const icons = {
    error: (
      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${styles[type]} ${className} animate-in fade-in slide-in-from-top-2 duration-300`}>
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 text-sm font-medium leading-relaxed">{message}</div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 hover:opacity-70 transition-opacity">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

// ============================================
// FORM LAYOUT WRAPPER
// ============================================

interface FormLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  step?: number
  totalSteps?: number
  logo?: boolean
  brandColor?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo'
  theme?: FormTheme
  showHeader?: boolean
  showFooter?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl'
}

const brandColors = {
  blue: 'from-blue-600 to-cyan-500',
  purple: 'from-purple-600 to-pink-500',
  green: 'from-green-600 to-emerald-500',
  orange: 'from-orange-500 to-amber-500',
  pink: 'from-pink-500 to-rose-500',
  indigo: 'from-indigo-600 to-purple-600',
}

const maxWidths = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
}

export function FormLayout({
  children,
  title,
  subtitle,
  step,
  totalSteps,
  logo = true,
  brandColor = 'indigo',
  theme = 'dark',
  showHeader = true,
  showFooter = true,
  maxWidth = '4xl'
}: FormLayoutProps) {
  const t = themes[theme]
  const isEmbed = theme === 'embed'

  return (
    <ThemeContext.Provider value={theme}>
      <div className={`min-h-screen ${t.background}`}>
        {showHeader && !isEmbed && (
          <header className={`sticky top-0 z-50 ${t.headerBg}`}>
            <div className={`${maxWidths[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {logo && (
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden">
                      <Image src={BRAND.logo} alt={BRAND.logoAlt} fill sizes="40px" className="object-contain" />
                    </div>
                  )}
                  <div>
                    <h1 className={`text-lg font-bold ${t.textPrimary}`}>{title}</h1>
                    {subtitle && <p className={`text-xs ${t.textSecondary}`}>{subtitle}</p>}
                  </div>
                </div>
                {step !== undefined && totalSteps && (
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${t.textSecondary}`}>Step {step} of {totalSteps}</span>
                    <div className={`w-32 h-2 ${theme === 'light' ? 'bg-slate-200' : 'bg-white/10'} rounded-full overflow-hidden`}>
                      <div
                        className={`h-full bg-gradient-to-r ${brandColors[brandColor]} transition-all duration-500`}
                        style={{ width: `${(step / totalSteps) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Compact header for embed mode */}
        {isEmbed && step !== undefined && totalSteps && (
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${t.textSecondary}`}>Step {step} of {totalSteps}</span>
              <span className={`text-xs ${t.textMuted}`}>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${brandColors[brandColor]} transition-all duration-500`}
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        <main className={`${maxWidths[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 ${isEmbed ? 'py-4' : 'py-8'}`}>
          {children}
        </main>

        {showFooter && !isEmbed && (
          <footer className={`${t.footerBg} mt-auto`}>
            <div className={`${maxWidths[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-6`}>
              <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 text-sm ${t.textSecondary}`}>
                <p>© {new Date().getFullYear()} Branding Pioneers. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <a href="mailto:support@brandingpioneers.in" className={`hover:${t.textPrimary} transition-colors`}>Support</a>
                  <a href="tel:+919876543210" className={`hover:${t.textPrimary} transition-colors`}>Contact</a>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </ThemeContext.Provider>
  )
}

// ============================================
// FORM CARD
// ============================================

interface FormCardProps {
  children: ReactNode
  title?: string
  description?: string
  icon?: ReactNode
  className?: string
}

export function FormCard({ children, title, description, icon, className = '' }: FormCardProps) {
  const theme = useFormTheme()
  const t = themes[theme]

  return (
    <div className={`${t.cardBg} ${t.cardBorder} rounded-2xl overflow-hidden ${className}`}>
      {(title || description) && (
        <div className={`px-6 py-5 border-b ${theme === 'light' ? 'border-slate-100' : 'border-white/5'} ${t.cardHeaderBg}`}>
          <div className="flex items-start gap-4">
            {icon && (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                {icon}
              </div>
            )}
            <div>
              {title && <h2 className={`text-xl font-bold ${t.textPrimary}`}>{title}</h2>}
              {description && <p className={`text-sm ${t.textSecondary} mt-1`}>{description}</p>}
            </div>
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

// ============================================
// TEXT INPUT
// ============================================

interface TextInputProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'password' | 'date'
  placeholder?: string
  required?: boolean
  error?: string
  helper?: string
  icon?: ReactNode
  disabled?: boolean
  autoFocus?: boolean
}

export function TextInput({ label, name, value, onChange, type = 'text', placeholder, required = false, error, helper, icon, disabled = false, autoFocus = false }: TextInputProps) {
  const theme = useFormTheme()
  const t = themes[theme]
  const isLight = theme === 'light'

  return (
    <div className="space-y-2">
      <label htmlFor={name} className={`block text-sm font-semibold ${t.labelText}`}>
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${t.textSecondary}`}>{icon}</div>}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
            ${icon ? 'pl-12' : ''}
            ${t.inputBg} ${t.textPrimary}
            ${isLight ? 'placeholder-slate-400' : 'placeholder-slate-500'}
            ${error
              ? 'border-red-500 bg-red-500/10 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : `${t.inputBorder} hover:border-opacity-50 ${t.inputFocusBorder} ${t.inputFocusRing}`
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
      </div>
      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helper && !error && <p className={`text-sm ${t.textSecondary}`}>{helper}</p>}
    </div>
  )
}

// ============================================
// TEXTAREA
// ============================================

interface TextareaProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  helper?: string
  rows?: number
}

export function Textarea({ label, name, value, onChange, placeholder, required = false, error, helper, rows = 4 }: TextareaProps) {
  const theme = useFormTheme()
  const t = themes[theme]
  const isLight = theme === 'light'

  return (
    <div className="space-y-2">
      <label htmlFor={name} className={`block text-sm font-semibold ${t.labelText}`}>
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`
          w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 resize-none outline-none
          ${t.inputBg} ${t.textPrimary}
          ${isLight ? 'placeholder-slate-400' : 'placeholder-slate-500'}
          ${error
            ? 'border-red-500 bg-red-500/10 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : `${t.inputBorder} hover:border-opacity-50 ${t.inputFocusBorder} ${t.inputFocusRing}`
          }
        `}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      {helper && !error && <p className={`text-sm ${t.textSecondary}`}>{helper}</p>}
    </div>
  )
}

// ============================================
// SINGLE SELECT (Radio Cards)
// ============================================

interface SelectOption {
  value: string
  label: string
  description?: string
  icon?: ReactNode
  emoji?: string
}

interface SingleSelectProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  required?: boolean
  error?: string
  columns?: 1 | 2 | 3 | 4 | 5
  size?: 'sm' | 'md' | 'lg'
  accentColor?: 'blue' | 'indigo' | 'purple' | 'green' | 'orange'
}

const accentColors = {
  blue: { selected: 'border-blue-500 bg-blue-500/10 ring-blue-500/10', check: 'bg-blue-500', text: 'text-blue-400', iconBg: 'bg-blue-500/20' },
  indigo: { selected: 'border-indigo-500 bg-indigo-500/10 ring-indigo-500/10', check: 'bg-indigo-500', text: 'text-indigo-400', iconBg: 'bg-indigo-500/20' },
  purple: { selected: 'border-purple-500 bg-purple-500/10 ring-purple-500/10', check: 'bg-purple-500', text: 'text-purple-400', iconBg: 'bg-purple-500/20' },
  green: { selected: 'border-emerald-500 bg-emerald-500/10 ring-emerald-500/10', check: 'bg-emerald-500', text: 'text-emerald-400', iconBg: 'bg-emerald-500/20' },
  orange: { selected: 'border-orange-500 bg-orange-500/10 ring-orange-500/10', check: 'bg-orange-500', text: 'text-orange-400', iconBg: 'bg-orange-500/20' },
}

export function SingleSelect({ label, name, value, onChange, options, required = false, error, columns = 2, size = 'md', accentColor = 'indigo' }: SingleSelectProps) {
  const theme = useFormTheme()
  const t = themes[theme]
  const accent = accentColors[accentColor]
  const isLight = theme === 'light'

  const gridCols = { 1: 'grid-cols-1', 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', 4: 'grid-cols-2 sm:grid-cols-4', 5: 'grid-cols-3 sm:grid-cols-5' }
  const paddings = { sm: 'p-3', md: 'p-4', lg: 'p-5' }

  return (
    <div className="space-y-3">
      <label className={`block text-sm font-semibold ${t.labelText}`}>
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className={`grid ${gridCols[columns]} gap-3`}>
        {options.map((option) => {
          const isSelected = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                relative ${paddings[size]} rounded-xl border-2 text-left transition-all duration-200
                ${isSelected
                  ? `${accent.selected} ring-4`
                  : `${t.selectCardBorder} ${t.selectCardBg} ${t.selectCardHoverBg}`
                }
              `}
            >
              {isSelected && (
                <div className={`absolute top-2 right-2 w-6 h-6 ${accent.check} rounded-full flex items-center justify-center`}>
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className="flex items-start gap-3">
                {(option.icon || option.emoji) && (
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${isSelected ? accent.iconBg : (isLight ? 'bg-slate-100' : 'bg-slate-800/50')}`}>
                    {option.emoji || option.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold ${isSelected ? accent.text : t.labelText}`}>{option.label}</p>
                  {option.description && <p className={`text-sm ${t.textSecondary} mt-0.5`}>{option.description}</p>}
                </div>
              </div>
            </button>
          )
        })}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}

// ============================================
// MULTI SELECT (Checkbox Cards)
// ============================================

interface MultiSelectProps {
  label: string
  name: string
  value: string[]
  onChange: (value: string[]) => void
  options: SelectOption[]
  required?: boolean
  error?: string
  columns?: 1 | 2 | 3 | 4 | 5
  min?: number
  max?: number
  accentColor?: 'blue' | 'indigo' | 'purple' | 'green' | 'orange'
}

export function MultiSelect({ label, name, value, onChange, options, required = false, error, columns = 2, min, max, accentColor = 'indigo' }: MultiSelectProps) {
  const theme = useFormTheme()
  const t = themes[theme]
  const accent = accentColors[accentColor]
  const isLight = theme === 'light'

  const gridCols = { 1: 'grid-cols-1', 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', 4: 'grid-cols-2 sm:grid-cols-4', 5: 'grid-cols-3 sm:grid-cols-5' }

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue))
    } else {
      if (max && value.length >= max) return
      onChange([...value, optionValue])
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className={`block text-sm font-semibold ${t.labelText}`}>
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {(min || max) && (
          <span className={`text-xs ${t.textSecondary}`}>
            {min && max ? `Select ${min}-${max}` : min ? `Select at least ${min}` : `Select up to ${max}`}
          </span>
        )}
      </div>
      <div className={`grid ${gridCols[columns]} gap-3`}>
        {options.map((option) => {
          const isSelected = value.includes(option.value)
          const isDisabled = !isSelected && max !== undefined && value.length >= max
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !isDisabled && toggleOption(option.value)}
              disabled={isDisabled}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all duration-200
                ${isSelected
                  ? `${accent.selected} ring-4`
                  : isDisabled
                    ? `${t.selectCardBorder} opacity-50 cursor-not-allowed ${isLight ? 'bg-slate-100' : 'bg-slate-900/40'}`
                    : `${t.selectCardBorder} ${t.selectCardBg} ${t.selectCardHoverBg}`
                }
              `}
            >
              <div className={`
                absolute top-3 right-3 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
                ${isSelected ? `${accent.check} border-transparent` : `${t.checkboxBorder} ${t.checkboxBg}`}
              `}>
                {isSelected && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex items-start gap-3 pr-8">
                {(option.icon || option.emoji) && (
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${isSelected ? accent.iconBg : (isLight ? 'bg-slate-100' : 'bg-slate-800/50')}`}>
                    {option.emoji || option.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold ${isSelected ? accent.text : t.labelText}`}>{option.label}</p>
                  {option.description && <p className={`text-sm ${t.textSecondary} mt-0.5`}>{option.description}</p>}
                </div>
              </div>
            </button>
          )
        })}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}

// ============================================
// DROPDOWN SELECT
// ============================================

interface DropdownSelectProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  required?: boolean
  error?: string
}

export function DropdownSelect({ label, name, value, onChange, options, placeholder = 'Select an option', required = false, error }: DropdownSelectProps) {
  const theme = useFormTheme()
  const t = themes[theme]
  const isLight = theme === 'light'

  return (
    <div className="space-y-2">
      <label htmlFor={name} className={`block text-sm font-semibold ${t.labelText}`}>
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`
          w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 appearance-none
          bg-no-repeat bg-[length:1.5rem] bg-[right_0.75rem_center] cursor-pointer outline-none
          ${t.inputBg} ${t.textPrimary}
          ${error
            ? 'border-red-500 bg-red-500/10 focus:border-red-500'
            : `${t.inputBorder} hover:border-opacity-50 ${t.inputFocusBorder} ${t.inputFocusRing}`
          }
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${isLight ? '%236b7280' : '%2394a3b8'}' stroke-width='2'%3e%3cpath d='M6 9l6 6 6-6'/%3e%3c/svg%3e")`
        }}
      >
        <option value="" className={isLight ? 'text-slate-500' : 'text-slate-400'}>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className={isLight ? 'text-slate-900' : 'text-white bg-slate-800'}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}

// ============================================
// FORM BUTTONS
// ============================================

interface FormButtonsProps {
  onBack?: () => void
  onNext?: () => void
  onSubmit?: () => void
  nextLabel?: string
  submitLabel?: string
  loading?: boolean
  disabled?: boolean
  showBack?: boolean
  accentColor?: 'blue' | 'indigo' | 'purple' | 'green' | 'orange'
}

const buttonGradients = {
  blue: 'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-blue-500/25',
  indigo: 'from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25',
  purple: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-purple-500/25',
  green: 'from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-emerald-500/25',
  orange: 'from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-orange-500/25',
}

export function FormButtons({ onBack, onNext, onSubmit, nextLabel = 'Continue', submitLabel = 'Submit', loading = false, disabled = false, showBack = true, accentColor = 'indigo' }: FormButtonsProps) {
  const theme = useFormTheme()
  const t = themes[theme]
  const isLight = theme === 'light'

  const LoadingSpinner = () => (
    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )

  return (
    <div className={`flex items-center justify-between pt-6 border-t ${isLight ? 'border-slate-200' : 'border-white/5'} mt-8`}>
      {showBack && onBack ? (
        <button
          type="button"
          onClick={onBack}
          className={`flex items-center gap-2 px-6 py-3 ${t.textSecondary} hover:${t.textPrimary} font-medium transition-colors`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      ) : <div />}

      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={disabled || loading}
          className={`
            flex items-center gap-2 px-8 py-3 bg-gradient-to-r ${buttonGradients[accentColor]}
            text-white font-semibold rounded-xl shadow-lg
            disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
          `}
        >
          {loading ? (
            <><LoadingSpinner />Processing...</>
          ) : (
            <>
              {nextLabel}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      )}

      {onSubmit && (
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || loading}
          className={`
            flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600
            hover:from-emerald-700 hover:to-green-700
            text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25
            disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
          `}
        >
          {loading ? (
            <><LoadingSpinner />Submitting...</>
          ) : (
            <>
              {submitLabel}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  )
}

// ============================================
// CHECKBOX
// ============================================

interface CheckboxProps {
  label: string | ReactNode
  name: string
  checked: boolean
  onChange: (checked: boolean) => void
  required?: boolean
  error?: string
  accentColor?: 'blue' | 'indigo' | 'purple' | 'green' | 'orange'
}

export function Checkbox({ label, name, checked, onChange, required = false, error, accentColor = 'indigo' }: CheckboxProps) {
  const theme = useFormTheme()
  const t = themes[theme]
  const accent = accentColors[accentColor]
  const isLight = theme === 'light'

  return (
    <div className="space-y-1">
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            required={required}
            className="sr-only"
          />
          <div className={`
            w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
            ${checked
              ? `${accent.check} border-transparent`
              : `${t.checkboxBorder} ${t.checkboxBg} ${isLight ? 'group-hover:border-slate-400' : 'group-hover:border-slate-500'}`
            }
          `}>
            {checked && (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <span className={`text-sm ${isLight ? 'text-slate-700' : 'text-slate-300'} leading-relaxed`}>
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>
      {error && <p className="text-sm text-red-400 ml-9">{error}</p>}
    </div>
  )
}

// ============================================
// SUCCESS SCREEN
// ============================================

interface SuccessScreenProps {
  title: string
  message: string
  details?: { label: string; value: string }[]
  primaryAction?: { label: string; onClick: () => void }
  secondaryAction?: { label: string; onClick: () => void }
  theme?: FormTheme
}

export function SuccessScreen({ title, message, details, primaryAction, secondaryAction, theme = 'dark' }: SuccessScreenProps) {
  const t = themes[theme]
  const isLight = theme === 'light'

  return (
    <div className={`min-h-screen ${t.successBg} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md text-center">
        {/* Animated Success Icon */}
        <div className="w-24 h-24 mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className={`text-3xl font-bold ${t.textPrimary} mb-3`}>{title}</h1>
        <p className={`${t.textSecondary} mb-8`}>{message}</p>

        {details && details.length > 0 && (
          <div className={`${t.cardBg} ${t.cardBorder} rounded-2xl p-6 mb-8 text-left`}>
            <h3 className={`text-sm font-semibold ${t.textMuted} uppercase tracking-wider mb-4`}>Details</h3>
            <div className="space-y-3">
              {details.map((detail) => (
                <div
                  key={detail.label}
                  className={`flex justify-between items-center py-2 border-b ${isLight ? 'border-slate-100' : 'border-white/5'} last:border-0`}
                >
                  <span className={`text-sm ${t.textSecondary}`}>{detail.label}</span>
                  <span className={`text-sm font-semibold ${t.textPrimary}`}>{detail.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className={`px-6 py-3 ${t.textSecondary} font-medium rounded-xl hover:${isLight ? 'bg-slate-100' : 'bg-slate-800/50'} transition-colors`}
            >
              {secondaryAction.label}
            </button>
          )}
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
            >
              {primaryAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// STEP INDICATOR (Compact for mobile)
// ============================================

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  labels?: string[]
  accentColor?: 'blue' | 'indigo' | 'purple' | 'green' | 'orange'
}

export function StepIndicator({ currentStep, totalSteps, labels, accentColor = 'indigo' }: StepIndicatorProps) {
  const theme = useFormTheme()
  const t = themes[theme]
  const isLight = theme === 'light'

  return (
    <div className="mb-8">
      {/* Progress bar */}
      <div className={`w-full h-2 ${isLight ? 'bg-slate-200' : 'bg-white/10'} rounded-full overflow-hidden mb-4`}>
        <div
          className={`h-full bg-gradient-to-r ${buttonGradients[accentColor].split(' ').slice(0, 2).join(' ')} transition-all duration-500`}
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          return (
            <div key={`step-${index}`} className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                ${isCompleted
                  ? `bg-gradient-to-r ${buttonGradients[accentColor].split(' ').slice(0, 2).join(' ')} text-white`
                  : isCurrent
                    ? `${t.cardBorder} ${isLight ? 'border-2' : 'border'} ${t.textPrimary} ${t.cardBg}`
                    : `${isLight ? 'bg-slate-100 text-slate-400' : 'bg-slate-800/50 text-slate-500'}`
                }
              `}>
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {labels && labels[index] && (
                <span className={`text-xs mt-1 ${isCurrent ? t.textPrimary : t.textMuted} hidden sm:block`}>
                  {labels[index]}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// FILE UPLOAD
// ============================================

interface FileUploadProps {
  label: string
  name: string
  value?: File | null
  onChange: (file: File | null) => void
  accept?: string
  required?: boolean
  error?: string
  helper?: string
  maxSize?: number // in MB
}

export function FileUpload({ label, name, value, onChange, accept = '*', required = false, error, helper, maxSize = 10 }: FileUploadProps) {
  const theme = useFormTheme()
  const t = themes[theme]
  const isLight = theme === 'light'

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && maxSize && file.size > maxSize * 1024 * 1024) {
      return // File too large
    }
    onChange(file || null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && maxSize && file.size > maxSize * 1024 * 1024) {
      return // File too large
    }
    onChange(file || null)
  }

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-semibold ${t.labelText}`}>
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
          ${error
            ? 'border-red-500 bg-red-500/5'
            : `${t.inputBorder} hover:border-indigo-500 ${isLight ? 'bg-slate-50' : 'bg-slate-800/30'}`
          }
        `}
      >
        <input
          type="file"
          name={name}
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {value ? (
          <div className="flex items-center justify-center gap-3">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-left">
              <p className={`font-medium ${t.textPrimary}`}>{value.name}</p>
              <p className={`text-sm ${t.textMuted}`}>{(value.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <>
            <svg className={`w-10 h-10 mx-auto mb-3 ${t.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className={`${t.textSecondary} mb-1`}>Drag and drop or click to upload</p>
            <p className={`text-sm ${t.textMuted}`}>Max file size: {maxSize}MB</p>
          </>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {helper && !error && <p className={`text-sm ${t.textSecondary}`}>{helper}</p>}
    </div>
  )
}
