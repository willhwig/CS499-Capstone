/**
 * Vendors API Route - List and Create
 * CS499 Capstone Project
 *
 * This file handles:
 * - GET /api/vendors - List all vendors with service counts
 * - POST /api/vendors - Create a new vendor
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auditCreate } from '@/lib/audit'
import { ApiResponse, Vendor, CreateVendorInput } from '@/types'

/**
 * Vendor with service count for list view
 */
interface VendorWithServiceCount extends Vendor {
  _count: {
    serviceRecords: number
  }
}

/**
 * GET /api/vendors
 *
 * Retrieves all vendors, optionally filtered by active status.
 * Includes a count of services performed by each vendor.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeParam = searchParams.get('active')

    // Build where clause based on active filter
    const whereClause: { active?: boolean } = {}
    if (activeParam === 'true') {
      whereClause.active = true
    } else if (activeParam === 'false') {
      whereClause.active = false
    }

    // Fetch vendors with service counts using Prisma
    const vendors = await prisma.vendor.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { serviceRecords: true },
        },
      },
    })

    const response: ApiResponse<VendorWithServiceCount[]> = {
      success: true,
      data: vendors as VendorWithServiceCount[],
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching vendors:', error)

    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch vendors',
    }

    return NextResponse.json(response, { status: 500 })
  }
}

/**
 * POST /api/vendors
 *
 * Creates a new vendor in the system.
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateVendorInput = await request.json()

    // Validate required fields
    if (!body.name || !body.code) {
      const response: ApiResponse = {
        success: false,
        error: 'Name and code are required',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Validate code format should be alphanumeric, 2-10 characters
    const codeRegex = /^[A-Za-z0-9]{2,10}$/
    if (!codeRegex.test(body.code)) {
      const response: ApiResponse = {
        success: false,
        error: 'Code must be 2-10 alphanumeric characters',
      }
      return NextResponse.json(response, { status: 400 })
    }

    // Check if vendor code already exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { code: body.code.toUpperCase() },
    })

    if (existingVendor) {
      const response: ApiResponse = {
        success: false,
        error: `A vendor with code "${body.code.toUpperCase()}" already exists`,
      }
      return NextResponse.json(response, { status: 409 })
    }

    // Create the vendor
    const vendor = await prisma.vendor.create({
      data: {
        name: body.name.trim(),
        code: body.code.toUpperCase().trim(),
        contactInfo: body.contactInfo?.trim() || null,
        active: body.active ?? true,
      },
    })

    // Create audit log entry
    await auditCreate(
      'Vendor',
      vendor.id,
      {
        name: vendor.name,
        code: vendor.code,
        contactInfo: vendor.contactInfo,
        active: vendor.active,
      },
      'SYSTEM'
    )

    const response: ApiResponse<Vendor> = {
      success: true,
      data: vendor as Vendor,
      message: 'Vendor created successfully',
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating vendor:', error)

    const response: ApiResponse = {
      success: false,
      error: 'Failed to create vendor',
    }

    return NextResponse.json(response, { status: 500 })
  }
}
