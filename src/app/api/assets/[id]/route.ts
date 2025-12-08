/**
 * Single Asset API Route - Get and Update
 * CS499 Capstone Project
 *
 * - GET /api/assets/[id] - Get a single asset with full service history
 * - PUT /api/assets/[id] - Update an asset's status or notes
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auditUpdate } from '@/lib/audit'
import { ApiResponse, AssetComponentWithHistory, UpdateAssetInput, AssetStatus } from '@/types'

/**
 * Route context type for dynamic routes
 */
type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/assets/[id]
 *
 * Retrieves a single asset component by ID with its complete service history.
 * The service history is ordered by date descending so the most recent
 * service appears first.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params
    const id = parseInt(params.id, 10)

    // Validate that the ID is a valid number
    if (isNaN(id)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid asset ID',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Fetch the asset with its complete service history
    const asset = await prisma.assetComponent.findUnique({
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

    if (!asset) {
      const response: ApiResponse = {
        success: false,
        error: `Asset component with ID ${id} not found`,
      }
      return NextResponse.json(response, { status: 404 })
    }

    const response: ApiResponse<AssetComponentWithHistory> = {
      success: true,
      data: asset as AssetComponentWithHistory,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching asset:', error)

    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch asset component',
    }

    return NextResponse.json(response, { status: 500 })
  }
}

/**
 * PUT /api/assets/[id]
 *
 * Updates an asset component's status or notes.
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params
    const id = parseInt(params.id, 10)

    // Validate that the ID is a valid number
    if (isNaN(id)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid asset ID',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Parse the request body
    const body: UpdateAssetInput = await request.json()

    // Fetch the current asset to verify it exists and to capture old values for audit
    const existingAsset = await prisma.assetComponent.findUnique({
      where: { id },
    })

    if (!existingAsset) {
      const response: ApiResponse = {
        success: false,
        error: `Asset component with ID ${id} not found`,
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Validate status if provided
    if (body.status && !Object.values(AssetStatus).includes(body.status as AssetStatus)) {
      const response: ApiResponse = {
        success: false,
        error: `Invalid status. Must be one of: ${Object.values(AssetStatus).join(', ')}`,
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Build the update data object
    const updateData: { status?: string; notes?: string } = {}
    if (body.status !== undefined) {
      updateData.status = body.status
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes?.trim()
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      const response: ApiResponse = {
        success: false,
        error: 'No valid fields to update. You can update: status, notes',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Perform the update
    const updatedAsset = await prisma.assetComponent.update({
      where: { id },
      data: updateData,
    })

    // Create an audit log entry for the update
    await auditUpdate(
      'AssetComponent',
      id,
      {
        status: existingAsset.status,
        notes: existingAsset.notes,
      },
      {
        status: updatedAsset.status,
        notes: updatedAsset.notes,
      },
      'SYSTEM'
    )

    const response: ApiResponse<typeof updatedAsset> = {
      success: true,
      data: updatedAsset,
      message: 'Asset component updated successfully',
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating asset:', error)

    const response: ApiResponse = {
      success: false,
      error: 'Failed to update asset component',
    }

    return NextResponse.json(response, { status: 500 })
  }
}
