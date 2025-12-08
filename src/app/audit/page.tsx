/**
 * Audit Trail Page
 * CS499 Capstone Project
 *
 * This page displays the audit log 
 * made to the system. This is essential for aviation maintenance compliance
 * where full traceability is required.
 *
 * The audit trail shows what changed, when it changed, who made the change, what the old and new values were
 */

import Link from 'next/link'
import prisma from '@/lib/prisma'
import { AuditAction } from '@/types'


 // Page props
interface PageProps {
  searchParams: Promise<{
    tableName?: string
    action?: string
    page?: string
  }>
}


// Fetches audit log entries with optional filtering and pagination
async function getAuditLogs(
  tableName?: string,
  action?: string,
  page: number = 1,
  limit: number = 20
) {
  const whereClause: { tableName?: string; action?: string } = {}

  if (tableName) {
    whereClause.tableName = tableName
  }
  if (action && Object.values(AuditAction).includes(action as AuditAction)) {
    whereClause.action = action
  }

  const skip = (page - 1) * limit

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where: whereClause }),
  ])

  return {
    entries,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}


// Gets unique table names from the audit log for the filter dropdown
async function getTableNames() {
  const results = await prisma.auditLog.findMany({
    distinct: ['tableName'],
    select: { tableName: true },
  })
  return results.map((r) => r.tableName)
}

export default async function AuditPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const { entries, total, totalPages } = await getAuditLogs(
    params.tableName,
    params.action,
    page
  )
  const tableNames = await getTableNames()

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Audit Trail</h1>
        <p className="page-description">
          Complete history of all changes made to the system
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <form method="GET" className="flex flex-wrap gap-4 items-end">
          {/* Table filter */}
          <div className="w-full sm:w-48">
            <label htmlFor="tableName" className="label">
              Table
            </label>
            <select
              id="tableName"
              name="tableName"
              defaultValue={params.tableName || ''}
              className="input"
            >
              <option value="">All Tables</option>
              {tableNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Action filter */}
          <div className="w-full sm:w-40">
            <label htmlFor="action" className="label">
              Action
            </label>
            <select
              id="action"
              name="action"
              defaultValue={params.action || ''}
              className="input"
            >
              <option value="">All Actions</option>
              {Object.values(AuditAction).map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button type="submit" className="btn-primary">
            Filter
          </button>

          {/* Clear */}
          {(params.tableName || params.action) && (
            <Link href="/audit" className="btn-secondary">
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Results info */}
      <p className="text-sm text-gray-600 mb-4">
        Showing {entries.length} of {total} entries
        {totalPages > 1 && ` (page ${page} of ${totalPages})`}
      </p>

      {/* Audit entries */}
      {entries.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No audit log entries found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            // Parse JSON values for display
            let oldValues: Record<string, unknown> | null = null
            let newValues: Record<string, unknown> = {}
            try {
              if (entry.oldValues) {
                oldValues = JSON.parse(entry.oldValues)
              }
              newValues = JSON.parse(entry.newValues)
            } catch (e) {
            }

            return (
              <div key={entry.id} className="card">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Left side for main info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <ActionBadge action={entry.action} />
                      <span className="font-medium text-gray-900">
                        {entry.tableName}
                      </span>
                      <span className="text-gray-500">#{entry.recordId}</span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      By <span className="font-medium">{entry.changedBy}</span>
                    </p>

                    {/* Values display */}
                    <div className="space-y-2">
                      {entry.action === 'UPDATE' && oldValues && (
                        <div className="text-sm">
                          <span className="text-gray-500">Changed: </span>
                          <ValueDiff oldValues={oldValues} newValues={newValues} />
                        </div>
                      )}
                      {entry.action === 'CREATE' && (
                        <div className="text-sm">
                          <span className="text-gray-500">Created with: </span>
                          <ValuesDisplay values={newValues} />
                        </div>
                      )}
                      {entry.action === 'DELETE' && oldValues && (
                        <div className="text-sm">
                          <span className="text-gray-500">Deleted values: </span>
                          <ValuesDisplay values={oldValues} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side for timestamp */}
                  <div className="text-sm text-gray-500">
                    <time dateTime={new Date(entry.timestamp).toISOString()}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </time>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {/* Previous page */}
          {page > 1 && (
            <Link
              href={`/audit?${new URLSearchParams({
                ...(params.tableName && { tableName: params.tableName }),
                ...(params.action && { action: params.action }),
                page: String(page - 1),
              })}`}
              className="btn-secondary"
            >
              ← Previous
            </Link>
          )}

          {/* Page indicator */}
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          {/* Next page */}
          {page < totalPages && (
            <Link
              href={`/audit?${new URLSearchParams({
                ...(params.tableName && { tableName: params.tableName }),
                ...(params.action && { action: params.action }),
                page: String(page + 1),
              })}`}
              className="btn-secondary"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Badge component for action types
 */
function ActionBadge({ action }: { action: string }) {
  const styles = {
    CREATE: 'bg-green-100 text-green-800 border-green-200',
    UPDATE: 'bg-blue-100 text-blue-800 border-blue-200',
    DELETE: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <span
      className={`px-2 py-0.5 text-xs font-medium rounded border ${
        styles[action as keyof typeof styles] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {action}
    </span>
  )
}

/**
 * Displays the difference between old and new values
 */
function ValueDiff({
  oldValues,
  newValues,
}: {
  oldValues: Record<string, unknown>
  newValues: Record<string, unknown>
}) {
  const changes = Object.entries(newValues)
    .filter(([key]) => JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key]))
    .map(([key, newVal]) => ({
      key,
      oldVal: oldValues[key],
      newVal,
    }))

  if (changes.length === 0) {
    return <span className="text-gray-400">No visible changes</span>
  }

  return (
    <span className="text-gray-700">
      {changes.map((change, i) => (
        <span key={change.key}>
          {i > 0 && ', '}
          <span className="font-medium">{change.key}</span>:{' '}
          <span className="text-red-600 line-through">
            {formatValue(change.oldVal)}
          </span>{' '}
          → <span className="text-green-600">{formatValue(change.newVal)}</span>
        </span>
      ))}
    </span>
  )
}

/**
 * Displays a simple list of values
 */
function ValuesDisplay({ values }: { values: Record<string, unknown> }) {
  const entries = Object.entries(values).filter(
    ([key]) => !['createdAt', 'updatedAt', 'id'].includes(key)
  )

  if (entries.length === 0) {
    return <span className="text-gray-400">No data</span>
  }

  return (
    <span className="text-gray-700">
      {entries.map(([key, val], i) => (
        <span key={key}>
          {i > 0 && ', '}
          <span className="font-medium">{key}</span>: {formatValue(val)}
        </span>
      ))}
    </span>
  )
}

/**
 * Formats a value for display
 */
function formatValue(val: unknown): string {
  if (val === null || val === undefined) return 'null'
  if (typeof val === 'boolean') return val ? 'true' : 'false'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}
