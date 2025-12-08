/**
 * Record Service Page
 * CS499 Capstone Project
 *
 * This is one of the most important pages in the application. It allows
 * vendors to record completed services on asset components.
 *
 * When a service is recorded:
 * 1. The system validates the service type matches the asset's position
 * 2. Creates a service record
 * 3. Updates the asset's lifecycle phase
 * 4. Creates audit log entries
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import ServiceTypeBadge from '@/components/ServiceTypeBadge'
import CycleIndicator from '@/components/CycleIndicator'
import { AssetComponentWithHistory, ServiceType, Vendor } from '@/types'

export default function RecordServicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedAssetId = searchParams.get('assetId')

  // Asset selection state
  const [assetSearchTerm, setAssetSearchTerm] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<AssetComponentWithHistory | null>(null)
  const [isLoadingAsset, setIsLoadingAsset] = useState(false)

  // Vendors list
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoadingVendors, setIsLoadingVendors] = useState(true)

  // Form state
  const [vendorId, setVendorId] = useState('')
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0])
  const [workPerformed, setWorkPerformed] = useState('')
  const [findings, setFindings] = useState('')
  const [consumablesReplaced, setConsumablesReplaced] = useState(false)
  const [inspectorName, setInspectorName] = useState('')
  const [notes, setNotes] = useState('')

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Load vendors
  useEffect(() => {
    async function loadVendors() {
      try {
        const response = await fetch('/api/vendors?active=true')
        const data = await response.json()
        if (data.success) {
          setVendors(data.data)
        }
      } catch (err) {
        console.error('Failed to load vendors:', err)
      } finally {
        setIsLoadingVendors(false)
      }
    }
    loadVendors()
  }, [])

  // Load preselected asset if provided in URL
  useEffect(() => {
    if (preselectedAssetId) {
      loadAssetById(parseInt(preselectedAssetId, 10))
    }
  }, [preselectedAssetId])

  /**
   * Loads an asset by its ID
   */
  async function loadAssetById(id: number) {
    setIsLoadingAsset(true)
    try {
      const response = await fetch(`/api/assets/${id}`)
      const data = await response.json()
      if (data.success) {
        setSelectedAsset(data.data)
      }
    } catch (err) {
      console.error('Failed to load asset:', err)
    } finally {
      setIsLoadingAsset(false)
    }
  }

  /**
   * Searches for an asset by part number and serial number
   */
  async function handleAssetSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!assetSearchTerm.trim()) return

    setIsLoadingAsset(true)
    setError(null)

    // Parse search term
    const parts = assetSearchTerm.trim().toUpperCase().split(/\s+/)

    if (parts.length < 2) {
      setError('Enter both part number and serial number separated by space')
      setIsLoadingAsset(false)
      return
    }

    const [partNumber, serialNumber] = parts

    try {
      const params = new URLSearchParams({ partNumber, serialNumber })
      const response = await fetch(`/api/assets/lookup?${params}`)
      const data = await response.json()

      if (data.success) {
        setSelectedAsset(data.data)
        setError(null)
      } else {
        setError(data.error || 'Asset not found')
        setSelectedAsset(null)
      }
    } catch (err) {
      setError('Search failed. Please try again.')
    } finally {
      setIsLoadingAsset(false)
    }
  }

  /**
   * Submits the service record
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedAsset) return

    setError(null)
    setIsSubmitting(true)

    // Determine the correct service type based on position
    const serviceType = selectedAsset.lifecyclePhase === 5
      ? ServiceType.OVERHAUL
      : ServiceType.STANDARD

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetComponentId: selectedAsset.id,
          vendorId: parseInt(vendorId, 10),
          serviceType,
          serviceDate,
          workPerformed: workPerformed.trim(),
          findings: findings.trim() || undefined,
          consumablesReplaced,
          inspectorName: inspectorName.trim(),
          notes: notes.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        // Redirect to asset detail after short delay
        setTimeout(() => {
          router.push(`/assets/${selectedAsset.id}`)
        }, 1500)
      } else {
        setError(data.error || 'Failed to record service')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Clears the selected asset
   */
  function clearAsset() {
    setSelectedAsset(null)
    setAssetSearchTerm('')
    setError(null)
  }

  // Success message
  if (success) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="text-green-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Recorded!</h2>
        <p className="text-gray-600">Redirecting to asset details...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Record Service</h1>
        <p className="page-description">
          Record a completed service for an asset component
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1 Select Asset */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Step 1: Select Asset Component
            </h2>

            {!selectedAsset ? (
              <form onSubmit={handleAssetSearch} className="space-y-4">
                <div>
                  <label htmlFor="assetSearch" className="label">
                    Search by Part Number and Serial Number
                  </label>
                  <input
                    type="text"
                    id="assetSearch"
                    value={assetSearchTerm}
                    onChange={(e) => setAssetSearchTerm(e.target.value.toUpperCase())}
                    className="input"
                    placeholder="e.g., B737-800-MW-001 SN12345"
                    disabled={isLoadingAsset}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Enter part number and serial number separated by a space
                  </p>
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoadingAsset || !assetSearchTerm.trim()}
                >
                  {isLoadingAsset ? 'Searching...' : 'Find Asset'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Selected asset display */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg text-gray-900">{selectedAsset.partNumber}</p>
                      <p className="text-gray-600">S/N: {selectedAsset.serialNumber}</p>
                    </div>
                    <StatusBadge status={selectedAsset.status} />
                  </div>
                  <CycleIndicator
                    currentPosition={selectedAsset.lifecyclePhase}
                    showLabels={false}
                    size="sm"
                  />
                </div>
                <button onClick={clearAsset} className="btn-secondary">
                  Select Different Asset
                </button>
              </div>
            )}
          </div>

          {/* Step 2 Service Details */}
          {selectedAsset && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 2: Service Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Service Type auto set */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Service Type:</span>
                    <ServiceTypeBadge
                      serviceType={selectedAsset.lifecyclePhase === 5 ? ServiceType.OVERHAUL : ServiceType.STANDARD}
                      size="md"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Determined automatically based on asset&apos;s current position ({selectedAsset.lifecyclePhase})
                  </p>
                </div>

                {/* Vendor */}
                <div>
                  <label htmlFor="vendor" className="label">
                    Vendor <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="vendor"
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    className="input"
                    required
                    disabled={isLoadingVendors || isSubmitting}
                  >
                    <option value="">Select vendor...</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name} ({vendor.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service Date */}
                <div>
                  <label htmlFor="serviceDate" className="label">
                    Service Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="serviceDate"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="input"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Work Performed */}
                <div>
                  <label htmlFor="workPerformed" className="label">
                    Work Performed <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="workPerformed"
                    value={workPerformed}
                    onChange={(e) => setWorkPerformed(e.target.value)}
                    className="input min-h-[100px]"
                    placeholder="Describe the work performed during this service..."
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Findings */}
                <div>
                  <label htmlFor="findings" className="label">
                    Inspection Findings
                  </label>
                  <textarea
                    id="findings"
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    className="input min-h-[80px]"
                    placeholder="Any notable findings from inspection..."
                    disabled={isSubmitting}
                  />
                </div>

                {/* Consumables Used */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="consumablesReplaced"
                    checked={consumablesReplaced}
                    onChange={(e) => setConsumablesReplaced(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="consumablesReplaced" className="text-sm font-medium text-gray-700">
                    Consumables were replaced during this service
                  </label>
                </div>

                {/* Inspector Name */}
                <div>
                  <label htmlFor="inspectorName" className="label">
                    Inspector Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="inspectorName"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="input"
                    placeholder="Name of inspector signing off on this service"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="label">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input"
                    placeholder="Any additional notes..."
                    disabled={isSubmitting}
                  />
                </div>

                {/* Error message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Submit button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={isSubmitting || !vendorId || !workPerformed.trim() || !inspectorName.trim()}
                  >
                    {isSubmitting ? 'Recording Service...' : 'Record Service'}
                  </button>
                  <Link href="/" className="btn-secondary">
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Info sidebar */}
        <div className="space-y-6">
          {/* Selected asset info */}
          {selectedAsset && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Selected Asset</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Part Number</dt>
                  <dd className="font-medium">{selectedAsset.partNumber}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Serial Number</dt>
                  <dd className="font-medium">{selectedAsset.serialNumber}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Current Position</dt>
                  <dd className="font-medium">{selectedAsset.lifecyclePhase} of 5</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Total Services</dt>
                  <dd className="font-medium">{selectedAsset.totalServiceCount}</dd>
                </div>
              </dl>
              <Link
                href={`/assets/${selectedAsset.id}`}
                className="text-sm text-blue-600 hover:text-blue-800 mt-4 inline-block"
              >
                View full details →
              </Link>
            </div>
          )}

          {/* Help info */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Service Guidelines</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>
                <strong>Standard Service:</strong> Positions 1-4. Includes inspection, consumable replacement, and minor repairs.
              </li>
              <li>
                <strong>Overhaul:</strong> Position 5 only. Full teardown, NDT inspection, and complete rebuild.
              </li>
              <li>
                The service type is automatically determined based on the asset&apos;s current lifecycle phase.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
