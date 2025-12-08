/**
 * StatsCard Component
 * CS499 Capstone Project
 *
 * A dashboard card component that displays a statistic with a title, number, and optional description.
 */

import { ReactNode } from 'react'

interface StatsCardProps {
  // Title of the statistic
  title: string
  // The main value/number to display
  value: number | string
  // Optional description or subtitle 
  description?: string
  // Optional icon to display 
  icon?: ReactNode
  // Color variant for the card accent 
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  // Optional click handler
  onClick?: () => void
}

// Color configurations for each variant
const variantStyles = {
  default: {
    border: 'border-l-gray-400',
    icon: 'text-gray-500',
    value: 'text-gray-900',
  },
  success: {
    border: 'border-l-green-500',
    icon: 'text-green-500',
    value: 'text-green-700',
  },
  warning: {
    border: 'border-l-amber-500',
    icon: 'text-amber-500',
    value: 'text-amber-700',
  },
  danger: {
    border: 'border-l-red-500',
    icon: 'text-red-500',
    value: 'text-red-700',
  },
  info: {
    border: 'border-l-blue-500',
    icon: 'text-blue-500',
    value: 'text-blue-700',
  },
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  variant = 'default',
  onClick,
}: StatsCardProps) {
  const styles = variantStyles[variant]

  // Determine if the card should be clickable
  const isClickable = Boolean(onClick)

  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200
        border-l-4 ${styles.border}
        p-4 sm:p-6
        ${isClickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      `}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title */}
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>

          {/* Main value */}
          <p className={`text-3xl font-bold ${styles.value}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-500 mt-1">
              {description}
            </p>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <div className={`${styles.icon} ml-4`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}


// Icons for common use cases
export function AssetIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" strokeWidth="2" />
      <path strokeWidth="2" d="M12 2v7M12 15v7M2 12h7M15 12h7" />
    </svg>
  )
}

export function WrenchIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  )
}

export function AlertIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  )
}

export function CheckCircleIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

export function ArchiveIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
      />
    </svg>
  )
}

export default StatsCard
