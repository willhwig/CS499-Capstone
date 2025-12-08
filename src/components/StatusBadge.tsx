/**
 * StatusBadge Component
 * CS499 Capstone Project
 *
 * A visual badge component that displays the status of an asset component.
 * The color coding provides instant visual feedback about the asset's state
 */

import { AssetStatus } from '@/types'

interface StatusBadgeProps {
  // The status to display 
  status: AssetStatus | string
  // Optional size variant 
  size?: 'sm' | 'md' | 'lg'
}


// Maps status values to their display properties
const statusConfig: Record<string, { label: string; className: string }> = {
  [AssetStatus.IN_SERVICE]: {
    label: 'In Service',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  [AssetStatus.AT_VENDOR]: {
    label: 'At Vendor',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  [AssetStatus.RETIRED]: {
    label: 'Retired',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  [AssetStatus.BER]: {
    label: 'BER',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
}

 // Size variants for the badge
const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  // Get the configuration for this status, with a fallback for unknown statuses
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${config.className}
        ${sizeClasses[size]}
      `}
    >
      {config.label}
    </span>
  )
}

export default StatusBadge
