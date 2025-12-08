/**
 * CycleIndicator Component
 * CS499 Capstone Project
 *
 * This component shows where a wheel is in its maintenance cycle.
 *
 *
 * Position 5 is specially highlighted as Overhaul to make it clear
 * that this position requires a different type of service.
 */

interface CycleIndicatorProps {
  // Current position in the cycle 
  currentPosition: number
  // Whether to show labels under each position 
  showLabels?: boolean
  // Size variant 
  size?: 'sm' | 'md' | 'lg'
}


// Size configurations for the indicator
const sizeConfig = {
  sm: {
    dot: 'w-6 h-6 text-xs',
    line: 'w-4 h-0.5',
    label: 'text-xs',
    container: 'gap-1',
  },
  md: {
    dot: 'w-8 h-8 text-sm',
    line: 'w-6 h-0.5',
    label: 'text-sm',
    container: 'gap-1',
  },
  lg: {
    dot: 'w-10 h-10 text-base',
    line: 'w-8 h-1',
    label: 'text-base',
    container: 'gap-2',
  },
}

export function CycleIndicator({
  currentPosition,
  showLabels = true,
  size = 'md',
}: CycleIndicatorProps) {
  const config = sizeConfig[size]
  const positions = [1, 2, 3, 4, 5]

  return (
    <div className="flex flex-col items-center">
      {/* Position indicators with connecting lines */}
      <div className={`flex items-center ${config.container}`}>
        {positions.map((position, index) => (
          <div key={position} className="flex items-center">
            {/* Position dot/circle */}
            <div
              className={`
                ${config.dot}
                rounded-full flex items-center justify-center font-semibold
                transition-all duration-200
                ${getPositionStyle(position, currentPosition)}
              `}
              title={getPositionTitle(position, currentPosition)}
            >
              {/* Show checkmark for completed positions, number for others */}
              {position < currentPosition ? (
                <CheckIcon />
              ) : (
                position
              )}
            </div>

            {/* Connecting line between positions */}
            {index < positions.length - 1 && (
              <div
                className={`
                  ${config.line}
                  ${position < currentPosition ? 'bg-green-500' : 'bg-gray-300'}
                `}
              />
            )}
          </div>
        ))}
      </div>

      {/* Labels under each position */}
      {showLabels && (
        <div className={`flex items-start ${config.container} mt-2`}>
          {positions.map((position, index) => (
            <div key={position} className="flex items-center">
              <div
                className={`
                  ${config.dot} flex items-center justify-center ${config.label}
                  ${position === currentPosition ? 'font-semibold' : 'text-gray-500'}
                `}
              >
                {position === 5 ? (
                  <span className="text-center leading-tight">
                    OVH
                  </span>
                ) : (
                  <span>STD</span>
                )}
              </div>
              {/* Spacer to align with connecting lines */}
              {index < positions.length - 1 && (
                <div className={config.line} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Current position description */}
      <div className={`mt-3 text-center ${config.label}`}>
        <span className="text-gray-600">
          Position {currentPosition} of 5 —{' '}
        </span>
        <span className={currentPosition === 5 ? 'text-purple-700 font-semibold' : 'text-blue-700 font-semibold'}>
          {currentPosition === 5 ? 'Overhaul Required' : 'Standard Service'}
        </span>
      </div>
    </div>
  )
}


// Returns the appropriate CSS classes for a position based on its state
function getPositionStyle(position: number, currentPosition: number): string {
  // Completed positions: filled green with white text
  if (position < currentPosition) {
    return 'bg-green-500 text-white border-2 border-green-500'
  }

  // Current position: highlighted with ring
  if (position === currentPosition) {
    if (position === 5) {
      // Position 5 gets special highlighting
      return 'bg-purple-100 text-purple-700 border-2 border-purple-500 ring-2 ring-purple-200'
    }
    return 'bg-blue-100 text-blue-700 border-2 border-blue-500 ring-2 ring-blue-200'
  }

  // Future positions: gray outline
  return 'bg-white text-gray-400 border-2 border-gray-300'
}

// Returns a  title for the position
function getPositionTitle(position: number, currentPosition: number): string {
  if (position < currentPosition) {
    return `Position ${position}: Completed`
  }
  if (position === currentPosition) {
    return position === 5
      ? 'Position 5: Overhaul required'
      : `Position ${position}: Standard service required`
  }
  return position === 5
    ? 'Position 5: Future overhaul'
    : `Position ${position}: Future standard service`
}

// Simple checkmark icon for completed positions
function CheckIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
        d="M5 13l4 4L19 7"
      />
    </svg>
  )
}

export default CycleIndicator
