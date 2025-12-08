/**
 * Assets API Route - List and Create
 * CS499 Capstone Project
 *
 * This file handles:
 * - GET /api/assets - List all asset components with optional filtering
 * - POST /api/assets - Create a new asset component
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auditCreate } from '@/lib/audit'
import { ApiResponse, AssetComponent, CreateAssetInput, AssetStatus } from '@/types'

/**
 * GET /api/assets
 *
 * Retrieves all asset components, optionally filtered by status.
 * Results are ordered by most recently updated first
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters from the URL
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Build the where clause dynamically based on filters
    const whereClause: { status?: string } = {}
    if (status && Object.values(AssetStatus).includes(status as AssetStatus)) {
      whereClause.status = status
    }

    // Fetch assets from database with optional filtering
    const assets = await prisma.assetComponent.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      // Include the most recent service record for each asset allows for showing the Last Service Date in the list view
      include: {
        serviceRecords: {
          orderBy: { serviceDate: 'desc' },
          take: 1,
          include: {
            vendor: true,
          },
        },
      },
    })

    const response: ApiResponse<typeof assets> = {
      success: true,
      data: assets,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching assets:', error)

    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch asset components',
    }

    return NextResponse.json(response, { status: 500 })
  }
}

/**
 * POST /api/assets
 *
 * Creates a new asset component in the system.
 * New assets start at lifecycle phase 1 with status IN_SERVICE by default.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body: CreateAssetInput = await request.json()

    // Validate required fields
    if (!body.partNumber || !body.serialNumber) {
      const response: ApiResponse = {
        success: false,
        error: 'Part number and serial number are required',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Validate lifecycle phase if provided
    const lifecyclePhase = body.lifecyclePhase ?? 1
    if (lifecyclePhase < 1 || lifecyclePhase > 5) {
      const response: ApiResponse = {
        success: false,
        error: 'Lifecycle phase must be between 1 and 5',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Validate status if provided
    const status = body.status ?? AssetStatus.IN_SERVICE
    if (!Object.values(AssetStatus).includes(status as AssetStatus)) {
      const response: ApiResponse = {
        success: false,
        error: `Invalid status. Must be one of: ${Object.values(AssetStatus).join(', ')}`,
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Check if an asset with this part number and serial number already exists
    const existingAsset = await prisma.assetComponent.findUnique({
      where: {
        partNumber_serialNumber: {
          partNumber: body.partNumber,
          serialNumber: body.serialNumber,
        },
      },
    })

    if (existingAsset) {
      const response: ApiResponse = {
        success: false,
        error: `An asset with part number "${body.partNumber}" and serial number "${body.serialNumber}" already exists`,
      }
      return NextResponse.json(response, { status: 409 }) // 409 Conflict
    }

    // Create the new asset component
    const asset = await prisma.assetComponent.create({
      data: {
        partNumber: body.partNumber.toUpperCase().trim(),
        serialNumber: body.serialNumber.toUpperCase().trim(),
        lifecyclePhase,
        status,
        notes: body.notes?.trim() || null,
        totalServiceCount: 0,
      },
    })

    // Create an audit log entry for the new asset
    await auditCreate(
      'AssetComponent',
      asset.id,
      {
        partNumber: asset.partNumber,
        serialNumber: asset.serialNumber,
        lifecyclePhase: asset.lifecyclePhase,
        status: asset.status,
        notes: asset.notes,
      },
      'SYSTEM'
    )

    const response: ApiResponse<AssetComponent> = {
      success: true,
      data: asset as AssetComponent,
      message: 'Asset component created successfully',
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating asset:', error)

    const response: ApiResponse = {
      success: false,
      error: 'Failed to create asset component',
    }

    return NextResponse.json(response, { status: 500 })
  }
}
