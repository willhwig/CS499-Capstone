/**
 * Asset Detail Page
 * CS499 Capstone Project
 *
 * This page displays information about a single asset component:
 * - Basic information
 * - Current lifecycle status
 * - Complete service history
 * - Ability to update status
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import StatusBadge from '@/components/StatusBadge'
import ServiceTypeBadge from '@/components/ServiceTypeBadge'
import CycleIndicator from '@/components/CycleIndicator'
import { AssetStatus, ServiceType } from '@/types'
import { getLifecycleDescription } from '@/lib/lifecycle'
import AssetStatusForm from './AssetStatusForm'

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * Fetches an asset component with its complete service history
 */
async function getAsset(id: number) {
  return prisma.assetComponent.findUnique({
    where: { id },
    include: {
      serviceRecords: {
        orderBy: { serviceDate: 'desc' },
        include: {
          vendor: true,
        },
      },
    },
  })
}

export default async function AssetDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const id = parseInt(resolvedParams.id, 10)

  // Validate ID
  if (isNaN(id)) {
    notFound()
  }

  const asset = await getAsset(id)

  if (!asset) {
    notFound()
  }

  const lifecycleDescription = getLifecycleDescription(
    asset.lifecyclePhase,
    asset.totalServiceCount
  )
  const nextServiceType = asset.lifecyclePhase === 5
    ? ServiceType.OVERHAUL
    : ServiceType.STANDARD

  return (
    <div>
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/assets" className="hover:text-gray-700">
          Assets
        </Link>
        <span className="mx-2">→</span>
        <span className="text-gray-900">{asset.partNumber}</span>
      </nav>

      {/* Page Header */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="page-title">{asset.partNumber}</h1>
            <p className="page-description">
              Serial Number: {asset.serialNumber}
            </p>
          </div>
          <div className="flex gap-3">
            <StatusBadge status={asset.status} size="lg" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column for Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lifecycle Status Card */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Lifecycle Status
            </h2>

            {/* Cycle Position Indicator */}
            <div className="flex justify-center py-4">
              <CycleIndicator
                currentPosition={asset.lifecyclePhase}
                showLabels={true}
                size="lg"
              />
            </div>

            {/* Description */}
            <p className="text-center text-gray-600 mt-4">
              {lifecycleDescription}
            </p>

            {/* Next service info */}
            <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Next Required Service:
                </span>
                <ServiceTypeBadge serviceType={nextServiceType} size="md" />
              </div>
            </div>
          </div>

          {/* Service History Card */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Service History
              </h2>
              <span className="text-sm text-gray-500">
                {asset.totalServiceCount} total services
              </span>
            </div>

            {asset.serviceRecords.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No service history recorded for this asset.
              </p>
            ) : (
              <div className="space-y-4">
                {asset.serviceRecords.map((service, index) => (
                  <div
                    key={service.id}
                    className={`p-4 rounded-lg border ${
                      index === 0
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <ServiceTypeBadge
                          serviceType={service.serviceType}
                          size="sm"
                        />
                        <span className="text-sm text-gray-500">
                          Position {service.lifecyclePhaseAtService}
                        </span>
                      </div>
                      <time className="text-sm text-gray-600">
                        {new Date(service.serviceDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </time>
                    </div>

                    <p className="text-gray-900 mb-2">
                      {service.workPerformed}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>
                        <strong>Vendor:</strong> {service.vendor.name} ({service.vendor.code})
                      </span>
                      <span>
                        <strong>Inspector:</strong> {service.inspectorName}
                      </span>
                      {service.consumablesReplaced && (
                        <span className="text-amber-600">
                          Consumables Replaced
                        </span>
                      )}
                    </div>

                    {service.findings && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Findings: </span>
                        <span className="text-sm text-gray-600">{service.findings}</span>
                      </div>
                    )}

                    {service.notes && (
                      <p className="mt-2 text-sm text-gray-500 italic">
                        Note: {service.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column for Actions and metadata */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href={`/service?assetId=${asset.id}`}
                className="btn-primary w-full justify-center"
              >
                Record Service
              </Link>
            </div>
          </div>

          {/* Update Status Card */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Update Status
            </h2>
            <AssetStatusForm
              assetId={asset.id}
              currentStatus={asset.status}
              currentNotes={asset.notes || ''}
            />
          </div>

          {/* Metadata Card */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Details
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Part Number</dt>
                <dd className="font-medium text-gray-900">{asset.partNumber}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Serial Number</dt>
                <dd className="font-medium text-gray-900">{asset.serialNumber}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd><StatusBadge status={asset.status} size="sm" /></dd>
              </div>
              <div>
                <dt className="text-gray-500">Lifecycle Phase</dt>
                <dd className="font-medium text-gray-900">{asset.lifecyclePhase} of 5</dd>
              </div>
              <div>
                <dt className="text-gray-500">Total Services</dt>
                <dd className="font-medium text-gray-900">{asset.totalServiceCount}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-900">
                  {new Date(asset.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Last Updated</dt>
                <dd className="text-gray-900">
                  {new Date(asset.updatedAt).toLocaleDateString()}
                </dd>
              </div>
              {asset.notes && (
                <div>
                  <dt className="text-gray-500">Notes</dt>
                  <dd className="text-gray-900">{asset.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
