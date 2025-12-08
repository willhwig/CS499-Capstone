/**
 * Assets Registry Page
 * CS499 Capstone Project
 *
 * This page displays a table of all asset components in the system.
 * - Filter by status
 * - Search by part number or serial number
 * - View details for each asset
 *
 * This is a server component for initial data loading, but includes
 * client components for filtering.
 */

import Link from 'next/link'
import prisma from '@/lib/prisma'
import StatusBadge from '@/components/StatusBadge'
import ServiceTypeBadge from '@/components/ServiceTypeBadge'
import { AssetStatus, ServiceType } from '@/types'


// Page props searchParams for query string parsing

interface PageProps {
  searchParams: Promise<{
    status?: string
    search?: string
    position?: string
  }>
}


// Fetches asset components with optional filtering
async function getAssets(status?: string, search?: string, position?: string) {
  // Build the where clause
  const whereClause: {
    status?: string
    lifecyclePhase?: number
    OR?: Array<{ partNumber: { contains: string } } | { serialNumber: { contains: string } }>
  } = {}

  // Filter by status if provided
  if (status && Object.values(AssetStatus).includes(status as AssetStatus)) {
    whereClause.status = status
  }

  // Filter by lifecycle if provided
  if (position) {
    const posNum = parseInt(position, 10)
    if (posNum >= 1 && posNum <= 5) {
      whereClause.lifecyclePhase = posNum
    }
  }

  // Search by part number or serial number
  if (search) {
    const searchTerm = search.toUpperCase()
    whereClause.OR = [
      { partNumber: { contains: searchTerm } },
      { serialNumber: { contains: searchTerm } },
    ]
  }

  return prisma.assetComponent.findMany({
    where: whereClause,
    orderBy: { updatedAt: 'desc' },
    include: {
      serviceRecords: {
        orderBy: { serviceDate: 'desc' },
        take: 1,
      },
    },
  })
}

export default async function AssetsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const assets = await getAssets(params.status, params.search, params.position)

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">Asset Registry</h1>
            <p className="page-description">
              All asset components tracked in the system
            </p>
          </div>
          <Link href="/assets/new" className="btn-primary">
            Add New Asset
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <form method="GET" className="flex flex-wrap gap-4 items-end">
          {/* Search input */}
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="search" className="label">
              Search
            </label>
            <input
              type="text"
              id="search"
              name="search"
              placeholder="Part number or serial number..."
              defaultValue={params.search || ''}
              className="input"
            />
          </div>

          {/* Status filter */}
          <div className="w-full sm:w-48">
            <label htmlFor="status" className="label">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={params.status || ''}
              className="input"
            >
              <option value="">All Statuses</option>
              {Object.values(AssetStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Position filter */}
          <div className="w-full sm:w-36">
            <label htmlFor="position" className="label">
              Position
            </label>
            <select
              id="position"
              name="position"
              defaultValue={params.position || ''}
              className="input"
            >
              <option value="">All</option>
              <option value="1">Position 1</option>
              <option value="2">Position 2</option>
              <option value="3">Position 3</option>
              <option value="4">Position 4</option>
              <option value="5">Position 5 (Overhaul)</option>
            </select>
          </div>

          {/* Submit button */}
          <button type="submit" className="btn-primary">
            Filter
          </button>

          {/* Clear filters */}
          {(params.status || params.search || params.position) && (
            <Link href="/assets" className="btn-secondary">
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-600 mb-4">
        Showing {assets.length} asset{assets.length !== 1 ? 's' : ''}
      </p>

      {/* Assets table */}
      {assets.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No assets found matching your criteria.</p>
          <Link href="/assets/new" className="btn-primary">
            Add First Asset
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Part Number</th>
                <th>Serial Number</th>
                <th>Status</th>
                <th>Position</th>
                <th>Next Service</th>
                <th>Total Services</th>
                <th>Last Service</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assets.map((asset) => {
                const lastService = asset.serviceRecords[0]
                const nextServiceType = asset.lifecyclePhase === 5
                  ? ServiceType.OVERHAUL
                  : ServiceType.STANDARD

                return (
                  <tr key={asset.id}>
                    <td className="font-medium">{asset.partNumber}</td>
                    <td>{asset.serialNumber}</td>
                    <td>
                      <StatusBadge status={asset.status} size="sm" />
                    </td>
                    <td>
                      <span className={`font-medium ${asset.lifecyclePhase === 5 ? 'text-purple-600' : ''}`}>
                        {asset.lifecyclePhase} / 5
                      </span>
                    </td>
                    <td>
                      <ServiceTypeBadge serviceType={nextServiceType} size="sm" />
                    </td>
                    <td>{asset.totalServiceCount}</td>
                    <td>
                      {lastService ? (
                        <span className="text-gray-600">
                          {new Date(lastService.serviceDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td>
                      <Link
                        href={`/assets/${asset.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
