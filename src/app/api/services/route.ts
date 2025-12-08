/**
 * Services API Route - List and Create
 * CS499 Capstone Project
 *
 * This file handles:
 * - GET /api/services - List service records with optional filtering
 * - POST /api/services - Record a new service (THIS IS THE CORE LIFECYCLE LOGIC)
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auditCreate, auditUpdate } from '@/lib/audit'
import {
  validateServiceType,
  validateAssetCanBeServiced,
  calculateNextPosition,
} from '@/lib/lifecycle'
import {
  ApiResponse,
  ServiceRecordWithDetails,
  CreateServiceInput,
  ServiceType,
  AssetStatus,
} from '@/types'

/**
 * GET /api/services
 *
 * Retrieves service records with optional filtering.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    const vendorId = searchParams.get('vendorId')
    const serviceType = searchParams.get('serviceType')
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    // Build the where clause dynamically based on filters
    const whereClause: {
      assetComponentId?: number
      vendorId?: number
      serviceType?: string
    } = {}

    if (assetId) {
      whereClause.assetComponentId = parseInt(assetId, 10)
    }
    if (vendorId) {
      whereClause.vendorId = parseInt(vendorId, 10)
    }
    if (serviceType && Object.values(ServiceType).includes(serviceType as ServiceType)) {
      whereClause.serviceType = serviceType
    }

    // Fetch service records with related data
    const services = await prisma.serviceRecord.findMany({
      where: whereClause,
      orderBy: { serviceDate: 'desc' },
      take: Math.min(limit, 100), // Cap at 100 to prevent large queries
      include: {
        vendor: true,
        assetComponent: true,
      },
    })

    const response: ApiResponse<ServiceRecordWithDetails[]> = {
      success: true,
      data: services as ServiceRecordWithDetails[],
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching services:', error)

    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch service records',
    }

    return NextResponse.json(response, { status: 500 })
  }
}

/**
 * POST /api/services
 *
 * Records a new service record and updates the asset's lifecycle phase.
 *
 * Business Rules Enforced:
 * 1. Cannot service a RETIRED or BER asset
 * 2. At positions 1-4, only STANDARD service is allowed
 * 3. At position 5, only OVERHAUL is allowed
 * 4. After STANDARD service, position increments
 * 5. After OVERHAUL, position resets to 1
 *
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateServiceInput = await request.json()

    // Validate required fields
    const requiredFields = ['assetComponentId', 'vendorId', 'serviceType', 'serviceDate', 'workPerformed', 'inspectorName']
    for (const field of requiredFields) {
      if (!body[field as keyof CreateServiceInput]) {
        const response: ApiResponse = {
          success: false,
          error: `${field} is required`,
        }
        return NextResponse.json(response, { status: 400 })
      }
    }

    // Validate service type
    if (!Object.values(ServiceType).includes(body.serviceType as ServiceType)) {
      const response: ApiResponse = {
        success: false,
        error: `Invalid service type. Must be one of: ${Object.values(ServiceType).join(', ')}`,
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Fetch the asset component to get its current state
    const asset = await prisma.assetComponent.findUnique({
      where: { id: body.assetComponentId },
    })

    if (!asset) {
      const response: ApiResponse = {
        success: false,
        error: `Asset component with ID ${body.assetComponentId} not found`,
      }
      return NextResponse.json(response, { status: 404 })
    }

    // Verify the vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: body.vendorId },
    })

    if (!vendor) {
      const response: ApiResponse = {
        success: false,
        error: `Vendor with ID ${body.vendorId} not found`,
      }
      return NextResponse.json(response, { status: 404 })
    }

    // First validation, can the asset be serviced?
    // Retired and BER assets cannot receive any service
    const canServiceResult = validateAssetCanBeServiced(asset.status as AssetStatus)
    if (!canServiceResult.valid) {
      const response: ApiResponse = {
        success: false,
        error: canServiceResult.error,
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Second validation, is the service type correct for this position?
    // positions 1-4 get STANDARD, position 5 gets OVERHAUL
    const serviceTypeResult = validateServiceType(asset.lifecyclePhase, body.serviceType as ServiceType)
    if (!serviceTypeResult.valid) {
      const response: ApiResponse = {
        success: false,
        error: serviceTypeResult.error,
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Calculate the new lifecycle phase after this service
    // This is the state transition of the lifecycle state machine
    const newLifecyclePhase = calculateNextPosition(asset.lifecyclePhase, body.serviceType as ServiceType)

    // Parse the service date
    const serviceDate = new Date(body.serviceDate)
    if (isNaN(serviceDate.getTime())) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid service date format. Please use ISO 8601 format.',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Use a transaction to ensure both the service record and asset update are created. If either fails, both are rolled back.
    const result = await prisma.$transaction(async (tx) => {
      // Create the service record
      const serviceRecord = await tx.serviceRecord.create({
        data: {
          assetComponentId: body.assetComponentId,
          vendorId: body.vendorId,
          serviceType: body.serviceType,
          serviceDate,
          lifecyclePhaseAtService: asset.lifecyclePhase, // Record position before update
          workPerformed: body.workPerformed.trim(),
          findings: body.findings?.trim() || null,
          consumablesReplaced: body.consumablesReplaced ?? false,
          inspectorName: body.inspectorName.trim(),
          notes: body.notes?.trim() || null,
        },
        include: {
          vendor: true,
          assetComponent: true,
        },
      })

      // Update the asset component with new position and increment service count
      const updatedAsset = await tx.assetComponent.update({
        where: { id: body.assetComponentId },
        data: {
          lifecyclePhase: newLifecyclePhase,
          totalServiceCount: asset.totalServiceCount + 1,
          // Update status back to IN_SERVICE after service
          status: AssetStatus.IN_SERVICE,
        },
      })

      return { serviceRecord, updatedAsset }
    })

    // Create audit log entries for both operations
    await auditCreate(
      'ServiceRecord',
      result.serviceRecord.id,
      {
        assetComponentId: result.serviceRecord.assetComponentId,
        vendorId: result.serviceRecord.vendorId,
        serviceType: result.serviceRecord.serviceType,
        serviceDate: result.serviceRecord.serviceDate.toISOString(),
        lifecyclePhaseAtService: result.serviceRecord.lifecyclePhaseAtService,
        workPerformed: result.serviceRecord.workPerformed,
        inspectorName: result.serviceRecord.inspectorName,
      },
      vendor.code // Use vendor code for traceability
    )

    await auditUpdate(
      'AssetComponent',
      asset.id,
      {
        lifecyclePhase: asset.lifecyclePhase,
        totalServiceCount: asset.totalServiceCount,
        status: asset.status,
      },
      {
        lifecyclePhase: result.updatedAsset.lifecyclePhase,
        totalServiceCount: result.updatedAsset.totalServiceCount,
        status: result.updatedAsset.status,
      },
      vendor.code
    )

    const response: ApiResponse<ServiceRecordWithDetails> = {
      success: true,
      data: result.serviceRecord as ServiceRecordWithDetails,
      message: `Service recorded successfully. Asset moved from position ${asset.lifecyclePhase} to position ${newLifecyclePhase}.`,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error recording service:', error)

    const response: ApiResponse = {
      success: false,
      error: 'Failed to record service',
    }

    return NextResponse.json(response, { status: 500 })
  }
}
