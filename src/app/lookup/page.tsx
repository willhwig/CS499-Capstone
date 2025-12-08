/**
 * Asset Lookup Page
 * CS499 Capstone Project
 *
 * This page provides a simple interface for vendors to look up an asset
 * by its part number and serial number. This is how a technician would
 * find out what service is required when an asset arrives at their facility.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import ServiceTypeBadge from '@/components/ServiceTypeBadge'
import CycleIndicator from '@/components/CycleIndicator'
import { AssetComponentWithHistory, ServiceType } from '@/types'

export default function LookupPage() {
  // Form state
  const [partNumber, setPartNumber] = useState('')
  const [serialNumber, setSerialNumber] = useState('')

  // Results state
  const [asset, setAsset] = useState<AssetComponentWithHistory | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  /**
   * Handles the lookup form submission
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setAsset(null)

    // Validation
    if (!partNumber.trim() || !serialNumber.trim()) {
      setError('Both part number and serial number are required')
      return
    }

    setIsSearching(true)
    setSearched(true)

    try {
      const params = new URLSearchParams({
        partNumber: partNumber.trim(),
        serialNumber: serialNumber.trim(),
      })

      const response = await fetch(`/api/assets/lookup?${params}`)
      const data = await response.json()

      if (data.success) {
        setAsset(data.data)
      } else {
        setError(data.error || 'Asset not found')
      }
    } catch (err) {
      setError('An error occurred while searching. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  /**
   * Clears the search results
   */
  function handleClear() {
    setPartNumber('')
    setSerialNumber('')
    setAsset(null)
    setError(null)
    setSearched(false)
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Asset Lookup</h1>
        <p className="page-description">
          Enter the part number and serial number to find asset service information
        </p>
      </div>

      {/* Search Form */}
      <div className="card max-w-xl mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="partNumber" className="label">
              Part Number
            </label>
            <input
              type="text"
              id="partNumber"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value.toUpperCase())}
              className="input text-lg"
              placeholder="e.g., B737-800-MW-001"
              disabled={isSearching}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="serialNumber" className="label">
              Serial Number
            </label>
            <input
              type="text"
              id="serialNumber"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
              className="input text-lg"
              placeholder="e.g., SN12345"
              disabled={isSearching}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Look Up Asset'}
            </button>
            {searched && (
              <button
                type="button"
                onClick={handleClear}
                className="btn-secondary"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && searched && (
        <div className="card max-w-xl border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <div className="text-red-500 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-red-900">Asset Not Found</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <Link href="/assets/new" className="text-sm text-red-800 underline mt-2 inline-block">
                Register this asset as new →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {asset && (
        <div className="space-y-6">
          {/* Main Result Card */}
          <div className="card max-w-xl border-green-200 bg-green-50">
            <div className="flex items-start gap-3 mb-4">
              <div className="text-green-500 mt-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-green-900">Asset Found</h3>
              </div>
            </div>

            {/* Asset identification */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{asset.partNumber}</p>
                  <p className="text-gray-600">S/N: {asset.serialNumber}</p>
                </div>
                <StatusBadge status={asset.status} size="lg" />
              </div>
            </div>

            {/* Cycle indicator */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <CycleIndicator
                currentPosition={asset.lifecyclePhase}
                showLabels={true}
                size="md"
              />
            </div>

            {/* Service info */}
            <div className="bg-white rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Required Service:</span>
                <ServiceTypeBadge
                  serviceType={asset.lifecyclePhase === 5 ? ServiceType.OVERHAUL : ServiceType.STANDARD}
                  size="lg"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {asset.lifecyclePhase === 5
                  ? 'This asset requires a complete overhaul: full teardown, NDT inspection, and rebuild.'
                  : 'Standard service: inspection, consumable replacement if needed, minor repairs.'
                }
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 max-w-xl">
            <Link
              href={`/assets/${asset.id}`}
              className="btn-primary flex-1 justify-center"
            >
              View Full Details
            </Link>
            <Link
              href={`/service?assetId=${asset.id}`}
              className="btn-secondary flex-1 justify-center"
            >
              Record Service
            </Link>
          </div>

          {/* Recent service history preview */}
          {asset.serviceRecords && asset.serviceRecords.length > 0 && (
            <div className="card max-w-xl">
              <h3 className="font-medium text-gray-900 mb-3">Recent Service History</h3>
              <div className="space-y-2">
                {asset.serviceRecords.slice(0, 3).map((service) => (
                  <div key={service.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <ServiceTypeBadge serviceType={service.serviceType} size="sm" />
                      <span className="text-gray-600">by {service.vendor.code}</span>
                    </div>
                    <time className="text-gray-500">
                      {new Date(service.serviceDate).toLocaleDateString()}
                    </time>
                  </div>
                ))}
              </div>
              {asset.serviceRecords.length > 3 && (
                <p className="text-sm text-gray-500 mt-2">
                  + {asset.serviceRecords.length - 3} more services
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions when no search performed */}
      {!searched && (
        <div className="max-w-xl p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">How to Use</h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Enter the part number stamped on the asset component</li>
            <li>Enter the serial number (usually near the part number)</li>
            <li>Click &quot;Look Up Asset&quot; to see service requirements</li>
          </ol>
          <p className="text-sm text-blue-700 mt-3">
            If the asset is not found, you can register it as a new asset component.
          </p>
        </div>
      )}
    </div>
  )
}
