/**
 * Dashboard Page
 * CS499 Capstone Project
 *
 * This is the main dashboard that provides an overview of the system:
 * - Statistics cards showing asset counts by status
 * - List of assets due for overhaul
 * - Recent activity feed from the audit log
 */

import Link from 'next/link'
import prisma from '@/lib/prisma'
import { StatsCard, AssetIcon, WrenchIcon, AlertIcon, CheckCircleIcon, ArchiveIcon } from '@/components/StatsCard'
import StatusBadge from '@/components/StatusBadge'
import { AssetStatus } from '@/types'

/**
 * Fetches dashboard statistics from the database
 * Using Promise.all to run all queries in parallel for better performance
 */
async function getDashboardStats() {
  const [
    totalAssets,
    inService,
    atVendor,
    dueForOverhaul,
    retired,
    ber,
  ] = await Promise.all([
    prisma.assetComponent.count(),
    prisma.assetComponent.count({ where: { status: AssetStatus.IN_SERVICE } }),
    prisma.assetComponent.count({ where: { status: AssetStatus.AT_VENDOR } }),
    prisma.assetComponent.count({ where: { lifecyclePhase: 5 } }),
    prisma.assetComponent.count({ where: { status: AssetStatus.RETIRED } }),
    prisma.assetComponent.count({ where: { status: AssetStatus.BER } }),
  ])

  return { totalAssets, inService, atVendor, dueForOverhaul, retired, ber }
}


 // Fetches assets that are due for overhaul
async function getAssetsDueForOverhaul() {
  return prisma.assetComponent.findMany({
    where: { lifecyclePhase: 5 },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  })
}


// Fetches recent audit log entries for the activity feed
async function getRecentActivity() {
  return prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 10,
  })
}

export default async function DashboardPage() {
  // Fetch all data in parallel
  const [stats, assetsForOverhaul, recentActivity] = await Promise.all([
    getDashboardStats(),
    getAssetsDueForOverhaul(),
    getRecentActivity(),
  ])

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Overview of asset component lifecycle tracking system
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatsCard
          title="Total Assets"
          value={stats.totalAssets}
          icon={<AssetIcon />}
          variant="default"
        />
        <StatsCard
          title="In Service"
          value={stats.inService}
          description="Active assets"
          icon={<CheckCircleIcon />}
          variant="success"
        />
        <StatsCard
          title="At Vendor"
          value={stats.atVendor}
          description="Being serviced"
          icon={<WrenchIcon />}
          variant="warning"
        />
        <StatsCard
          title="Due for Overhaul"
          value={stats.dueForOverhaul}
          description="At position 5"
          icon={<AlertIcon />}
          variant="danger"
        />
        <StatsCard
          title="Retired"
          value={stats.retired}
          icon={<ArchiveIcon />}
          variant="default"
        />
        <StatsCard
          title="BER"
          value={stats.ber}
          description="Beyond repair"
          variant="danger"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/assets/new" className="btn-primary">
          Add New Asset
        </Link>
        <Link href="/lookup" className="btn-secondary">
          Lookup Asset
        </Link>
        <Link href="/service" className="btn-secondary">
          Record Service
        </Link>
      </div>

      {/* Two-column layout for lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets Due for Overhaul */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Due for Overhaul
            </h2>
            <Link
              href="/assets?position=5"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all →
            </Link>
          </div>

          {assetsForOverhaul.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No assets currently due for overhaul.
            </p>
          ) : (
            <div className="space-y-3">
              {assetsForOverhaul.map((asset) => (
                <Link
                  key={asset.id}
                  href={`/assets/${asset.id}`}
                  className="block p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {asset.partNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        S/N: {asset.serialNumber}
                      </p>
                    </div>
                    <StatusBadge status={asset.status} size="sm" />
                  </div>
                  <p className="text-xs text-purple-600 mt-2">
                    Overhaul required • {asset.totalServiceCount} total services
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h2>
            <Link
              href="/audit"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all →
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No recent activity to display.
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        <span className={getActionColor(entry.action)}>
                          {entry.action}
                        </span>
                        {' '}{entry.tableName} #{entry.recordId}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        By {entry.changedBy}
                      </p>
                    </div>
                    <time className="text-xs text-gray-400">
                      {formatRelativeTime(entry.timestamp)}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// Returns a CSS class for coloring the action type
function getActionColor(action: string): string {
  switch (action) {
    case 'CREATE':
      return 'text-green-600'
    case 'UPDATE':
      return 'text-blue-600'
    case 'DELETE':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}


// Formats a date as relative time (e.g., "2 hours ago")
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}
