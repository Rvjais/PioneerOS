'use client'

import React, { useState, useId } from 'react'

// ============================================
// ENHANCED FORM FIELD COMPONENTS
// ============================================

interface BaseFieldProps {
  label: string
  name: string
  error?: string
  helpText?: string
  required?: boolean
  className?: string
}

// ============================================
// TEXT INPUT FIELD
// ============================================

interface InputFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'tel' | 'url' | 'password' | 'number'
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  autoComplete?: string
  disabled?: boolean
  maxLength?: number
  prefix?: string
  suffix?: React.ReactNode
}

export function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helpText,
  required,
  autoComplete,
  disabled,
  maxLength,
  prefix,
  suffix,
  className = '',
}: InputFieldProps) {
  const id = useId()
  const [isFocused, setIsFocused] = useState(false)
  const hasError = !!error

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={id}
        className={`block text-sm font-medium ${hasError ? 'text-red-400' : 'text-slate-300'}`}
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            {prefix}
          </span>
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            onBlur?.()
          }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : helpText ? `${id}-help` : undefined}
          className={`
            w-full px-4 py-2.5 bg-slate-700/50 border rounded-lg text-white
            placeholder:text-slate-400 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${prefix ? 'pl-8' : ''}
            ${suffix ? 'pr-10' : ''}
            ${hasError
              ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : isFocused
                ? 'border-blue-500 ring-2 ring-blue-500/20'
                : 'border-slate-600 hover:border-slate-500'
            }
            focus:outline-none
          `}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {suffix}
          </span>
        )}
      </div>

      {hasError && (
        <p id={`${id}-error`} className="text-sm text-red-400 flex items-center gap-1" role="alert">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {helpText && !hasError && (
        <p id={`${id}-help`} className="text-sm text-slate-400">
          {helpText}
        </p>
      )}
    </div>
  )
}

// ============================================
// TEXTAREA FIELD
// ============================================

interface TextareaFieldProps extends BaseFieldProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  rows?: number
  maxLength?: number
  showCount?: boolean
}

export function TextareaField({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helpText,
  required,
  rows = 4,
  maxLength,
  showCount,
  className = '',
}: TextareaFieldProps) {
  const id = useId()
  const [isFocused, setIsFocused] = useState(false)
  const hasError = !!error

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className={`block text-sm font-medium ${hasError ? 'text-red-400' : 'text-slate-300'}`}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {showCount && maxLength && (
          <span className={`text-xs ${value.length > maxLength ? 'text-red-400' : 'text-slate-400'}`}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false)
          onBlur?.()
        }}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : helpText ? `${id}-help` : undefined}
        className={`
          w-full px-4 py-2.5 bg-slate-700/50 border rounded-lg text-white
          placeholder:text-slate-400 transition-all duration-200 resize-vertical min-h-[80px] max-h-[300px]
          ${hasError
            ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : isFocused
              ? 'border-blue-500 ring-2 ring-blue-500/20'
              : 'border-slate-600 hover:border-slate-500'
          }
          focus:outline-none
        `}
      />

      {hasError && (
        <p id={`${id}-error`} className="text-sm text-red-400 flex items-center gap-1" role="alert">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {helpText && !hasError && (
        <p id={`${id}-help`} className="text-sm text-slate-400">
          {helpText}
        </p>
      )}
    </div>
  )
}

// ============================================
// SELECT FIELD
// ============================================

interface SelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface SelectFieldProps extends BaseFieldProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  error,
  helpText,
  required,
  disabled,
  className = '',
}: SelectFieldProps) {
  const id = useId()
  const hasError = !!error

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={id}
        className={`block text-sm font-medium ${hasError ? 'text-red-400' : 'text-slate-300'}`}
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : helpText ? `${id}-help` : undefined}
        className={`
          w-full px-4 py-2.5 bg-slate-700/50 border rounded-lg text-white
          appearance-none cursor-pointer transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${hasError
            ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-slate-600 hover:border-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
          }
          focus:outline-none
        `}
        style={{
          colorScheme: 'dark',
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3e%3c/path%3e%3c/svg%3e")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1.25rem',
          paddingRight: '2.5rem',
        }}
      >
        <option value="" className="bg-slate-800 text-white">
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className="bg-slate-800 text-white"
          >
            {option.label}
          </option>
        ))}
      </select>

      {hasError && (
        <p id={`${id}-error`} className="text-sm text-red-400 flex items-center gap-1" role="alert">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {helpText && !hasError && (
        <p id={`${id}-help`} className="text-sm text-slate-400">
          {helpText}
        </p>
      )}
    </div>
  )
}

// ============================================
// CHECKBOX GROUP (Multi-select chips)
// ============================================

interface ChipGroupProps extends BaseFieldProps {
  value: string[]
  onChange: (value: string[]) => void
  options: SelectOption[]
  columns?: 1 | 2 | 3 | 4
  maxSelections?: number
}

export function ChipGroup({
  label,
  name,
  value,
  onChange,
  options,
  error,
  helpText,
  required,
  columns = 2,
  maxSelections,
  className = '',
}: ChipGroupProps) {
  const id = useId()
  const hasError = !!error

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      if (maxSelections && value.length >= maxSelections) return
      onChange([...value, optionValue])
    }
  }

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }

  return (
    <fieldset className={`space-y-3 ${className}`} aria-labelledby={`${id}-label`}>
      <legend
        id={`${id}-label`}
        className={`text-sm font-medium ${hasError ? 'text-red-400' : 'text-slate-300'}`}
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
        {maxSelections && (
          <span className="text-slate-400 ml-2 font-normal">
            (Select up to {maxSelections})
          </span>
        )}
      </legend>

      <div className={`grid ${gridCols[columns]} gap-2`} role="group">
        {options.map((option) => {
          const isSelected = value.includes(option.value)
          const isDisabled = !isSelected && !!maxSelections && value.length >= maxSelections

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !option.disabled && !isDisabled && toggleOption(option.value)}
              disabled={option.disabled || isDisabled}
              aria-pressed={isSelected}
              className={`
                relative p-3 rounded-lg border text-left transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isSelected
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5
                  ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-500'}
                `}>
                  {isSelected && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="font-medium text-sm">{option.label}</span>
                  {option.description && (
                    <p className="text-xs text-slate-400 mt-0.5">{option.description}</p>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {hasError && (
        <p className="text-sm text-red-400 flex items-center gap-1" role="alert">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {helpText && !hasError && (
        <p className="text-sm text-slate-400">{helpText}</p>
      )}
    </fieldset>
  )
}

// ============================================
// RADIO GROUP
// ============================================

interface RadioGroupProps extends BaseFieldProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  direction?: 'horizontal' | 'vertical'
}

export function RadioGroup({
  label,
  name,
  value,
  onChange,
  options,
  error,
  helpText,
  required,
  direction = 'vertical',
  className = '',
}: RadioGroupProps) {
  const id = useId()
  const hasError = !!error

  return (
    <fieldset className={`space-y-3 ${className}`} aria-labelledby={`${id}-label`}>
      <legend
        id={`${id}-label`}
        className={`text-sm font-medium ${hasError ? 'text-red-400' : 'text-slate-300'}`}
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </legend>

      <div
        className={`${direction === 'horizontal' ? 'flex flex-wrap gap-3' : 'space-y-2'}`}
        role="radiogroup"
      >
        {options.map((option) => {
          const isSelected = value === option.value
          const optionId = `${id}-${option.value}`

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={`
                flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200
                ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${isSelected
                  ? 'bg-blue-600/20 border-blue-500'
                  : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                }
              `}
            >
              <input
                type="radio"
                id={optionId}
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => !option.disabled && onChange(option.value)}
                disabled={option.disabled}
                className="sr-only"
              />
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                ${isSelected ? 'border-blue-500' : 'border-slate-500'}
              `}>
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {option.label}
                </span>
                {option.description && (
                  <p className="text-xs text-slate-400 mt-0.5">{option.description}</p>
                )}
              </div>
            </label>
          )
        })}
      </div>

      {hasError && (
        <p className="text-sm text-red-400 flex items-center gap-1" role="alert">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {helpText && !hasError && (
        <p className="text-sm text-slate-400">{helpText}</p>
      )}
    </fieldset>
  )
}

// ============================================
// CHECKBOX FIELD
// ============================================

interface CheckboxFieldProps {
  label: string
  name: string
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
  description?: string
  disabled?: boolean
}

export function CheckboxField({
  label,
  name,
  checked,
  onChange,
  error,
  description,
  disabled,
}: CheckboxFieldProps) {
  const id = useId()
  const hasError = !!error

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className={`
          flex items-start gap-3 cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          aria-invalid={hasError}
          className="sr-only peer"
        />
        <div className={`
          w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5
          transition-all duration-200
          ${checked
            ? 'bg-blue-500 border-blue-500'
            : hasError
              ? 'border-red-500'
              : 'border-slate-500 peer-focus:border-blue-500'
          }
        `}>
          {checked && (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <span className={`text-sm font-medium ${hasError ? 'text-red-400' : 'text-slate-300'}`}>
            {label}
          </span>
          {description && (
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
      </label>

      {hasError && (
        <p className="text-sm text-red-400 flex items-center gap-1 ml-8" role="alert">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

// ============================================
// FORM SECTION
// ============================================

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  collapsible?: boolean
  defaultOpen?: boolean
}

export function FormSection({
  title,
  description,
  children,
  className = '',
  collapsible = false,
  defaultOpen = true,
}: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (!collapsible) {
    return (
      <section className={`space-y-4 ${className}`}>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
        </div>
        <div className="space-y-4">{children}</div>
      </section>
    )
  }

  return (
    <section className={`border border-slate-700 rounded-xl overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 transition-colors"
      >
        <div className="text-left">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 space-y-4 border-t border-slate-700">
          {children}
        </div>
      )}
    </section>
  )
}
