/**
 * Asset Lookup API Route
 * CS499 Capstone Project
 *
 * This file handles:
 * - GET /api/assets/lookup?partNumber=XXX&serialNumber=YYY
 *
 * This endpoint provides a way to look up an asset by its composite key
 * (part number + serial number) rather than by database ID. This is
 * essential for real-world usage because vendors don't know the internal
 * database ID - they only know what's stamped on the component.
 *
 * When an asset arrives at a vendor, the technician can look it up by
 * reading the part number and serial number off the component itself.
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ApiResponse, AssetComponentWithHistory } from '@/types'

/**
 * GET /api/assets/lookup
 *
 * Looks up an asset component by part number and serial number.
 * Returns the asset with its full service history if found.
 *
 * Query Parameters:
 * - partNumber: string (required) - The component part number
 * - serialNumber: string (required) - The component's serial number
 *
 * Example: GET /api/assets/lookup?partNumber=B737-800-MW-001&serialNumber=SN12345
 *
 * This is one of the most important endpoints in the system because it's
 * how vendors determine what service is needed when an asset arrives.
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters from the URL
    const { searchParams } = new URL(request.url)
    const partNumber = searchParams.get('partNumber')
    const serialNumber = searchParams.get('serialNumber')

    // Validate that both parameters are provided
    if (!partNumber || !serialNumber) {
      const response: ApiResponse = {
        success: false,
        error: 'Both partNumber and serialNumber are required',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Look up the asset using the composite unique constraint
    // I'm normalizing the input to uppercase to match how we store the data
    const asset = await prisma.assetComponent.findUnique({
      where: {
        partNumber_serialNumber: {
          partNumber: partNumber.toUpperCase().trim(),
          serialNumber: serialNumber.toUpperCase().trim(),
        },
      },
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
        error: `No asset found with part number "${partNumber.toUpperCase()}" and serial number "${serialNumber.toUpperCase()}"`,
        message: 'The asset may not be registered in the system yet. Please add it as a new asset component.',
      }
      return NextResponse.json(response, { status: 404 })
    }

    const response: ApiResponse<AssetComponentWithHistory> = {
      success: true,
      data: asset as AssetComponentWithHistory,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error looking up asset:', error)

    const response: ApiResponse = {
      success: false,
      error: 'Failed to look up asset component',
    }

    return NextResponse.json(response, { status: 500 })
  }
}
