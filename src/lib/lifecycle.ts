/**
 * Asset Component Lifecycle State Machine
 * CS499 Capstone Project
 *
 * This file contains the core business logic for managing asset component lifecycles.
 * The lifecycle follows a strict 5-visit service cycle:
 *   - Positions 1-4: Standard service (inspection, consumable replacement, minor repairs)
 *   - Position 5: Complete overhaul (full teardown, NDT inspection, rebuild)
 *   - After overhaul, the cycle resets to position 1
 */

import { ServiceType, AssetStatus } from '@/types'

/**
 * Result type for validation functions
 */
export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string }

/**
 * Validates whether the proposed service type is correct for the asset's current lifecycle phase.
 *   - At positions 1-4: Only STANDARD service is allowed
 *   - At position 5: Only OVERHAUL is allowed
 * This validation prevents operators from accidentally performing the wrong
 * type of service, which could lead to safety issues or regulatory violations.
 * @param lifecyclePhase - Current position in the service cycle (1-5)
 * @param serviceType - The type of service being proposed
 * @returns ValidationResult indicating if the service type is valid
 */
export function validateServiceType(
  lifecyclePhase: number,
  serviceType: ServiceType
): ValidationResult {
  // Position 5 requires an overhaul
  // After 4 standard services, the asset must undergo complete teardown and inspection
  if (lifecyclePhase === 5 && serviceType !== ServiceType.OVERHAUL) {
    return {
      valid: false,
      error: `Asset is at position 5 and requires OVERHAUL. Cannot perform STANDARD service.`,
    }
  }

  // Positions 1-4 require standard service
  if (lifecyclePhase < 5 && serviceType !== ServiceType.STANDARD) {
    return {
      valid: false,
      error: `Asset is at position ${lifecyclePhase} and requires STANDARD service. OVERHAUL is only performed at position 5.`,
    }
  }

  return { valid: true }
}

/**
 * Calculates the next lifecycle phase after a service is performed.
 * This is the state transition function of the lifecycle state machine:
 *   - After STANDARD service positions 1-4 move to next position
 *   - After OVERHAUL position 5 reset to position 1
 * @param currentPosition - Current position before service 
 * @param serviceType - Type of service being performed
 * @returns The new lifecycle phase after service
 */
export function calculateNextPosition(
  currentPosition: number,
  serviceType: ServiceType
): number {
  // After an overhaul, the asset is like new for tracking purposes
  // reset to position 1 to begin the cycle again
  if (serviceType === ServiceType.OVERHAUL) {
    return 1
  }

  // Standard service increments the position
  // This should only be called for positions 1-4
  return currentPosition + 1
}

/**
 * Determines what type of service is required for an asset at a given position.
 * @param lifecyclePhase - Current position in the service cycle
 * @returns The required service type
 */
export function getRequiredServiceType(lifecyclePhase: number): ServiceType {
  return lifecyclePhase === 5 ? ServiceType.OVERHAUL : ServiceType.STANDARD
}

/**
 * Validates whether an asset can be serviced based on its current status.
 * Not all assets can be serviced - retired assets and BER
 * assets should not receive any further service.
 * @param status - Current status of the asset component
 * @returns ValidationResult indicating if the asset can be serviced
 */
export function validateAssetCanBeServiced(status: AssetStatus): ValidationResult {
  if (status === AssetStatus.RETIRED) {
    return {
      valid: false,
      error: 'Cannot service a retired asset component. It has been removed from service.',
    }
  }

  if (status === AssetStatus.BER) {
    return {
      valid: false,
      error: 'Cannot service a BER (Beyond Economical Repair) asset component. It is too damaged to repair.',
    }
  }

  return { valid: true }
}

/**
 * Generates a description of the assets current lifecycle status.
 * This is used in the UI to give operators a quick understanding of where
 * the asset is in its lifecycle and what comes next.
 * @param lifecyclePhase - Current position in the service cycle
 * @param totalServiceCount - Total number of services performed on this asset
 * @returns A descriptive string about the asset's lifecycle status
 */
export function getLifecycleDescription(
  lifecyclePhase: number,
  totalServiceCount: number
): string {
  const requiredService = getRequiredServiceType(lifecyclePhase)
  const servicesUntilOverhaul = 5 - lifecyclePhase

  if (lifecyclePhase === 5) {
    return `Due for overhaul (${totalServiceCount} total services completed). Full teardown and NDT inspection required.`
  }

  if (servicesUntilOverhaul === 1) {
    return `Position ${lifecyclePhase} of 5. Standard service required. Next service after this will be overhaul.`
  }

  return `Position ${lifecyclePhase} of 5. Standard service required. ${servicesUntilOverhaul} standard services until overhaul.`
}

/**
 * Validates the lifecycle phase is within valid bounds.
 * @param position - The position to validate
 * @returns ValidationResult indicating if the position is valid
 */
export function validateLifecyclePhase(position: number): ValidationResult {
  if (!Number.isInteger(position)) {
    return {
      valid: false,
      error: 'Lifecycle phase must be an integer.',
    }
  }

  if (position < 1 || position > 5) {
    return {
      valid: false,
      error: `Lifecycle phase must be between 1 and 5. Got: ${position}`,
    }
  }

  return { valid: true }
}
