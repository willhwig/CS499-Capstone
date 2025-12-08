/**
 * Database Seed Script
 * CS499 Capstone Project
 *
 * This script populates the database with sample data for development
 * and demonstration purposes. It creates:
 *   - Sample vendors
 *   - Sample asset components in various lifecycle states
 *   - Sample service records showing lifecycle progression
 *
 * Run this script with: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Main seed function
 */
async function main() {
  console.log('Starting database seed...')

  // Clear existing data
  console.log('Clearing existing data...')
  await prisma.auditLog.deleteMany()
  await prisma.serviceRecord.deleteMany()
  await prisma.assetComponent.deleteMany()
  await prisma.vendor.deleteMany()

  // Create vendors
  console.log('Creating vendors...')
  const vendors = await Promise.all([
    prisma.vendor.create({
      data: {
        name: 'Apex Maintenance Solutions',
        code: 'AMS',
        contactInfo: 'Chicago, IL - (312) 555-0100 - service@apexmaint.com',
        active: true,
      },
    }),
    prisma.vendor.create({
      data: {
        name: 'Precision Component Services',
        code: 'PCS',
        contactInfo: 'Dallas, TX - (214) 555-0200 - info@precisioncomponent.com',
        active: true,
      },
    }),
    prisma.vendor.create({
      data: {
        name: 'GlobalTech Repair Center',
        code: 'GRC',
        contactInfo: 'Miami, FL - (305) 555-0300 - repairs@globaltechrc.com',
        active: true,
      },
    }),
    prisma.vendor.create({
      data: {
        name: 'Summit Industrial Maintenance',
        code: 'SIM',
        contactInfo: 'Denver, CO - (303) 555-0400 - support@summitim.com',
        active: false, 
      },
    }),
  ])

  console.log(`Created ${vendors.length} vendors`)

  // Create asset components in various states
  console.log('Creating asset components...')
  const assets = await Promise.all([
    // Asset at position 1 
    prisma.assetComponent.create({
      data: {
        partNumber: 'B737-800-MW-001',
        serialNumber: 'SN10001',
        lifecyclePhase: 1,
        totalServiceCount: 5, 
        status: 'IN_SERVICE',
        notes: 'Recently completed overhaul - returned to service',
      },
    }),
    // Asset at position 2
    prisma.assetComponent.create({
      data: {
        partNumber: 'B737-800-MW-001',
        serialNumber: 'SN10002',
        lifecyclePhase: 2,
        totalServiceCount: 1,
        status: 'IN_SERVICE',
      },
    }),
    // Asset at position 3
    prisma.assetComponent.create({
      data: {
        partNumber: 'A320-200-NW-001',
        serialNumber: 'SN20001',
        lifecyclePhase: 3,
        totalServiceCount: 7,
        status: 'IN_SERVICE',
        notes: 'Minor wear observed during last inspection',
      },
    }),
    // Asset at position 4
    prisma.assetComponent.create({
      data: {
        partNumber: 'A320-200-NW-001',
        serialNumber: 'SN20002',
        lifecyclePhase: 4,
        totalServiceCount: 3,
        status: 'IN_SERVICE',
      },
    }),
    // Asset at position 5
    prisma.assetComponent.create({
      data: {
        partNumber: 'B737-800-MW-002',
        serialNumber: 'SN10003',
        lifecyclePhase: 5,
        totalServiceCount: 4,
        status: 'IN_SERVICE',
        notes: 'Due for overhaul - schedule with vendor',
      },
    }),
    // Asset currently at vendor
    prisma.assetComponent.create({
      data: {
        partNumber: 'B777-300-LW-001',
        serialNumber: 'SN30001',
        lifecyclePhase: 3,
        totalServiceCount: 2,
        status: 'AT_VENDOR',
        notes: 'Currently at Precision Component Services for standard service',
      },
    }),
    // Retired asset
    prisma.assetComponent.create({
      data: {
        partNumber: 'B737-700-MW-001',
        serialNumber: 'SN40001',
        lifecyclePhase: 2,
        totalServiceCount: 15,
        status: 'RETIRED',
        notes: 'Retired from service - replaced by newer model',
      },
    }),
    // BER asset
    prisma.assetComponent.create({
      data: {
        partNumber: 'A319-100-NW-001',
        serialNumber: 'SN50001',
        lifecyclePhase: 4,
        totalServiceCount: 8,
        status: 'BER',
        notes: 'Beyond economical repair - significant corrosion damage',
      },
    }),
    // Additional assets for variety
    prisma.assetComponent.create({
      data: {
        partNumber: 'B787-800-MW-001',
        serialNumber: 'SN60001',
        lifecyclePhase: 1,
        totalServiceCount: 0,
        status: 'IN_SERVICE',
        notes: 'New component - just entered tracking system',
      },
    }),
    prisma.assetComponent.create({
      data: {
        partNumber: 'B787-800-MW-001',
        serialNumber: 'SN60002',
        lifecyclePhase: 5,
        totalServiceCount: 9,
        status: 'AT_VENDOR',
        notes: 'At GlobalTech for overhaul',
      },
    }),
  ])

  console.log(`Created ${assets.length} asset components`)

  // Create service records for history
  console.log('Creating service records...')

  // Get specific assets for service records
  const asset1 = assets[0] 
  const asset2 = assets[2] 

  const serviceRecords = await Promise.all([
    // Historical services for asset1
    prisma.serviceRecord.create({
      data: {
        assetComponentId: asset1.id,
        vendorId: vendors[0].id, 
        serviceType: 'STANDARD',
        serviceDate: new Date('2024-01-15'),
        lifecyclePhaseAtService: 1,
        workPerformed: 'Initial inspection and consumable replacement. All components within specification.',
        findings: 'No significant wear observed',
        consumablesReplaced: true,
        inspectorName: 'J. Martinez',
      },
    }),
    prisma.serviceRecord.create({
      data: {
        assetComponentId: asset1.id,
        vendorId: vendors[1].id, 
        serviceType: 'STANDARD',
        serviceDate: new Date('2024-04-20'),
        lifecyclePhaseAtService: 2,
        workPerformed: 'Standard service completed. Consumables replaced per schedule.',
        findings: 'Minor surface wear - within acceptable limits',
        consumablesReplaced: true,
        inspectorName: 'R. Thompson',
      },
    }),
    prisma.serviceRecord.create({
      data: {
        assetComponentId: asset1.id,
        vendorId: vendors[0].id, 
        serviceType: 'STANDARD',
        serviceDate: new Date('2024-07-10'),
        lifecyclePhaseAtService: 3,
        workPerformed: 'Routine service and inspection. All checks passed.',
        consumablesReplaced: true,
        inspectorName: 'J. Martinez',
      },
    }),
    prisma.serviceRecord.create({
      data: {
        assetComponentId: asset1.id,
        vendorId: vendors[2].id, 
        serviceType: 'STANDARD',
        serviceDate: new Date('2024-09-25'),
        lifecyclePhaseAtService: 4,
        workPerformed: 'Pre-overhaul standard service. Documented wear patterns for overhaul planning.',
        findings: 'Wear consistent with expected lifecycle progression',
        consumablesReplaced: true,
        inspectorName: 'M. Chen',
      },
    }),
    prisma.serviceRecord.create({
      data: {
        assetComponentId: asset1.id,
        vendorId: vendors[0].id, 
        serviceType: 'OVERHAUL',
        serviceDate: new Date('2024-11-15'),
        lifecyclePhaseAtService: 5,
        workPerformed: 'Complete overhaul performed. Full teardown, NDT inspection, bearing replacement, surface treatment, and reassembly. All components replaced or refurbished to new condition.',
        findings: 'Bearing wear within limits, no cracks detected in NDT, minor corrosion treated',
        consumablesReplaced: true,
        inspectorName: 'J. Martinez',
        notes: 'Component returned to position 1 - ready for next service cycle',
      },
    }),

    // Some services for asset2
    prisma.serviceRecord.create({
      data: {
        assetComponentId: asset2.id,
        vendorId: vendors[1].id, 
        serviceType: 'STANDARD',
        serviceDate: new Date('2024-03-05'),
        lifecyclePhaseAtService: 1,
        workPerformed: 'First service after new installation. All specifications verified.',
        consumablesReplaced: false,
        inspectorName: 'R. Thompson',
      },
    }),
    prisma.serviceRecord.create({
      data: {
        assetComponentId: asset2.id,
        vendorId: vendors[2].id, 
        serviceType: 'STANDARD',
        serviceDate: new Date('2024-08-12'),
        lifecyclePhaseAtService: 2,
        workPerformed: 'Standard service with consumable replacement.',
        findings: 'Minor wear noted on outer surface',
        consumablesReplaced: true,
        inspectorName: 'M. Chen',
        notes: 'Recommend monitoring during next service',
      },
    }),
  ])

  console.log(`Created ${serviceRecords.length} service records`)

  // Create audit log entries
  console.log('Creating audit log entries...')
  await Promise.all([
    prisma.auditLog.create({
      data: {
        tableName: 'AssetComponent',
        recordId: asset1.id,
        action: 'CREATE',
        changedBy: 'SYSTEM',
        newValues: JSON.stringify({
          partNumber: asset1.partNumber,
          serialNumber: asset1.serialNumber,
          lifecyclePhase: 1,
          status: 'IN_SERVICE',
        }),
      },
    }),
    prisma.auditLog.create({
      data: {
        tableName: 'ServiceRecord',
        recordId: serviceRecords[4].id,
        action: 'CREATE',
        changedBy: 'AMS',
        newValues: JSON.stringify({
          serviceType: 'OVERHAUL',
          assetComponentId: asset1.id,
        }),
      },
    }),
  ])

  console.log('Database seed completed successfully!')

  // Print summary
  console.log('\n--- Seed Summary ---')
  console.log(`Vendors: ${vendors.length}`)
  console.log(`Asset Components: ${assets.length}`)
  console.log(`Service Records: ${serviceRecords.length}`)
  console.log('\nVendor Codes:')
  vendors.forEach((v) => console.log(`  - ${v.code}: ${v.name}`))
}

// Execute the seed function
main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
