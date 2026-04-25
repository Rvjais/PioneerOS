'use client'

import { forwardRef, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface InputWrapperProps {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: ReactNode
}

/**
 * Wrapper component for form inputs with label, error, and hint
 */
export function InputWrapper({
  label,
  error,
  hint,
  required,
  className,
  children,
}: InputWrapperProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-200 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
      {hint && !error && (
        <p className="text-sm text-slate-400 dark:text-slate-400">{hint}</p>
      )}
    </div>
  )
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  variant?: 'default' | 'filled' | 'outlined'
}

/**
 * Text input component
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, hint, leftIcon, rightIcon, variant = 'default', className, required, ...props }, ref) => {
    const variants = {
      default: 'border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]',
      filled: 'border border-transparent bg-white/10',
      outlined: 'border-2 border-white/10 bg-transparent hover:border-white/20',
    }

    const inputClasses = cn(
      'w-full px-3 py-2 rounded-lg text-white dark:text-white placeholder-slate-400 dark:placeholder-slate-500',
      'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-[#0B0E14]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transition-colors',
      variants[variant],
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      error && 'border-red-500 dark:border-red-500 focus:ring-red-500',
      className
    )

    return (
      <InputWrapper label={label} error={error} hint={hint} required={required}>
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}
          <input ref={ref} className={inputClasses} {...props} />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
      </InputWrapper>
    )
  }
)

TextInput.displayName = 'TextInput'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  placeholder?: string
}

/**
 * Select component
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, required, ...props }, ref) => {
    const selectClasses = cn(
      'w-full px-3 py-2 rounded-lg text-white dark:text-white',
      'border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]',
      'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-[#0B0E14]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transition-colors appearance-none cursor-pointer',
      error && 'border-red-500 dark:border-red-500 focus:ring-red-500',
      className
    )

    return (
      <InputWrapper label={label} error={error} hint={hint} required={required}>
        <div className="relative">
          <select ref={ref} className={selectClasses} style={{ colorScheme: 'dark' }} {...props}>
            {placeholder && (
              <option value="" disabled className="bg-slate-800 text-white">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled} className="bg-slate-800 text-white">
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </InputWrapper>
    )
  }
)

Select.displayName = 'Select'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

/**
 * Textarea component
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, resize = 'vertical', className, required, ...props }, ref) => {
    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    }

    const textareaClasses = cn(
      'w-full px-3 py-2 rounded-lg text-white dark:text-white placeholder-slate-400 dark:placeholder-slate-500',
      'border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]',
      'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-[#0B0E14]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transition-colors',
      resizeClasses[resize],
      error && 'border-red-500 dark:border-red-500 focus:ring-red-500',
      className
    )

    return (
      <InputWrapper label={label} error={error} hint={hint} required={required}>
        <textarea ref={ref} className={textareaClasses} {...props} />
      </InputWrapper>
    )
  }
)

Textarea.displayName = 'Textarea'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  error?: string
}

/**
 * Checkbox component
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className, ...props }, ref) => {
    return (
      <label className={cn('flex items-start gap-3 cursor-pointer', className)}>
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              'w-4 h-4 rounded border-white/10 bg-white/5',
              'text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0',
              'backdrop-blur-md cursor-pointer hover:bg-white/10 hover:border-white/20',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <div>
            {label && (
              <span className="text-sm font-medium text-slate-200 dark:text-slate-300">
                {label}
              </span>
            )}
            {description && (
              <p className="text-sm text-slate-400 dark:text-slate-400">{description}</p>
            )}
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400 mt-1">{error}</p>
            )}
          </div>
        )}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'

interface RadioGroupProps {
  label?: string
  name: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string; description?: string; disabled?: boolean }>
  error?: string
  direction?: 'horizontal' | 'vertical'
  className?: string
}

/**
 * Radio group component
 */
export function RadioGroup({
  label,
  name,
  value,
  onChange,
  options,
  error,
  direction = 'vertical',
  className,
}: RadioGroupProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-200 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className={cn('flex gap-4', direction === 'vertical' && 'flex-col gap-3')}>
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-start gap-3 cursor-pointer',
              option.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex items-center h-5">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                disabled={option.disabled}
                className={cn(
                  'w-4 h-4 border-white/10 bg-white/5',
                  'text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0',
                  'backdrop-blur-md cursor-pointer hover:bg-white/10 hover:border-white/20',
                  'disabled:cursor-not-allowed'
                )}
              />
            </div>
            <div>
              <span className="text-sm font-medium text-slate-200 dark:text-slate-300">
                {option.label}
              </span>
              {option.description && (
                <p className="text-sm text-slate-400 dark:text-slate-400">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 mt-1.5">{error}</p>
      )}
    </div>
  )
}

export default TextInput
