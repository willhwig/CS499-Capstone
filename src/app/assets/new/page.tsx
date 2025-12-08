/**
 * Add New Asset Page
 * CS499 Capstone Project
 *
 * A form page for adding new asset components to the system.
 * This page demonstrates form handling with validation and
 * API integration.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AssetStatus } from '@/types'

export default function NewAssetPage() {
  const router = useRouter()

  // Form state
  const [partNumber, setPartNumber] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [lifecyclePhase, setLifecyclePhase] = useState('1')
  const [status, setStatus] = useState(AssetStatus.IN_SERVICE)
  const [notes, setNotes] = useState('')

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Handles form submission
   * Validates input and calls the API to create a new asset
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Client side validation
    if (!partNumber.trim()) {
      setError('Part number is required')
      return
    }
    if (!serialNumber.trim()) {
      setError('Serial number is required')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partNumber: partNumber.trim(),
          serialNumber: serialNumber.trim(),
          lifecyclePhase: parseInt(lifecyclePhase, 10),
          status,
          notes: notes.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to the new assets detail page
        router.push(`/assets/${data.data.id}`)
      } else {
        setError(data.error || 'Failed to create asset component')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/assets" className="hover:text-gray-700">
          Assets
        </Link>
        <span className="mx-2">→</span>
        <span className="text-gray-900">Add New</span>
      </nav>

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Add New Asset Component</h1>
        <p className="page-description">
          Register a new asset component in the tracking system
        </p>
      </div>

      {/* Form Card */}
      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Part Number */}
          <div>
            <label htmlFor="partNumber" className="label">
              Part Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="partNumber"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value.toUpperCase())}
              className="input"
              placeholder="e.g., B737-800-MW-001"
              disabled={isSubmitting}
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              The component part number
            </p>
          </div>

          {/* Serial Number */}
          <div>
            <label htmlFor="serialNumber" className="label">
              Serial Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="serialNumber"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
              className="input"
              placeholder="e.g., SN12345"
              disabled={isSubmitting}
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Unique serial number (within this part number)
            </p>
          </div>

          {/* Two-column layout for smaller fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Lifecycle Phase */}
            <div>
              <label htmlFor="lifecyclePhase" className="label">
                Starting Lifecycle Phase
              </label>
              <select
                id="lifecyclePhase"
                value={lifecyclePhase}
                onChange={(e) => setLifecyclePhase(e.target.value)}
                className="input"
                disabled={isSubmitting}
              >
                <option value="1">Position 1 (New/After Overhaul)</option>
                <option value="2">Position 2</option>
                <option value="3">Position 3</option>
                <option value="4">Position 4</option>
                <option value="5">Position 5 (Due for Overhaul)</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Where in the service cycle this asset starts
              </p>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="label">
                Initial Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as AssetStatus)}
                className="input"
                disabled={isSubmitting}
              >
                {Object.values(AssetStatus).map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="label">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input min-h-[100px]"
              placeholder="Any additional notes about this asset..."
              disabled={isSubmitting}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Form actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Asset Component'}
            </button>
            <Link href="/assets" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Info box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-2xl">
        <h3 className="font-medium text-blue-900 mb-2">About Lifecycle Phases</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Position 1:</strong> New asset or asset just after overhaul</li>
          <li><strong>Positions 2-4:</strong> Asset has had 1-3 standard services</li>
          <li><strong>Position 5:</strong> Asset is due for complete overhaul</li>
        </ul>
        <p className="text-sm text-blue-700 mt-2">
          Most new assets should start at Position 1. Only use other positions
          if you&apos;re importing an existing asset with known service history.
        </p>
      </div>
    </div>
  )
}
