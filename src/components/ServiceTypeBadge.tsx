/**
 * ServiceTypeBadge Component
 * CS499 Capstone Project
 *
 * A visual badge component that displays the type of service.
 * The color coding distinguishes between the two service types:
 *   - Blue (STANDARD): Regular maintenance at positions 1-4
 *   - Purple (OVERHAUL): Complete teardown at position 5
 */

import { ServiceType } from '@/types'

interface ServiceTypeBadgeProps {
  // The service type to display 
  serviceType: ServiceType | string
  // Optional size variant
  size?: 'sm' | 'md' | 'lg'
}

// Maps service types to their display properties
const serviceTypeConfig: Record<string, { label: string; className: string }> = {
  [ServiceType.STANDARD]: {
    label: 'Standard',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  [ServiceType.OVERHAUL]: {
    label: 'Overhaul',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
}


// Size variants for the badge
const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

export function ServiceTypeBadge({ serviceType, size = 'md' }: ServiceTypeBadgeProps) {
  // Get the configuration for this service type
  const config = serviceTypeConfig[serviceType] || {
    label: serviceType,
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

export default ServiceTypeBadge
