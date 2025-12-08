/**
 * Audit Log API Route
 * CS499 Capstone Project
 *
 * This file handles:
 * - GET /api/audit - List audit log entries with filtering and pagination
 *
 * This endpoint is read-only - audit logs can never be modified or deleted.
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ApiResponse, AuditLog, AuditAction } from '@/types'

/**
 * Response type that includes pagination info
 */
interface AuditLogResponse {
  entries: AuditLog[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

/**
 * GET /api/audit
 *
 * Retrieves audit log entries with optional filtering and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse filter parameters
    const tableName = searchParams.get('tableName')
    const action = searchParams.get('action')
    const recordId = searchParams.get('recordId')
    const changedBy = searchParams.get('changedBy')

    // Parse pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    // Build the where clause
    const whereClause: {
      tableName?: string
      action?: string
      recordId?: number
      changedBy?: string
    } = {}

    if (tableName) {
      whereClause.tableName = tableName
    }
    if (action && Object.values(AuditAction).includes(action as AuditAction)) {
      whereClause.action = action
    }
    if (recordId) {
      whereClause.recordId = parseInt(recordId, 10)
    }
    if (changedBy) {
      whereClause.changedBy = changedBy
    }

    // Fetch audit logs and total count in parallel
    const [entries, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where: whereClause }),
    ])

    const totalPages = Math.ceil(total / limit)

    const response: ApiResponse<AuditLogResponse> = {
      success: true,
      data: {
        entries: entries as AuditLog[],
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching audit logs:', error)

    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch audit logs',
    }

    return NextResponse.json(response, { status: 500 })
  }
}
