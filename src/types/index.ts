/**
 * TypeScript Type Definitions
 * CS499 Capstone Project
 *
 * This file contains all the TypeScript types and enums used in
 * the application. 
 */

// Enum for asset component status values
export enum AssetStatus {
  // Asset is in use or ready for use
  IN_SERVICE = 'IN_SERVICE',
  // Asset is currently at a repair facility for service 
  AT_VENDOR = 'AT_VENDOR',
  // Asset has been retired from active service but not scrapped 
  RETIRED = 'RETIRED',
  // Beyond Economical Repair ie too damaged or worn to be worth repairing 
  BER = 'BER',
}

// Enum for service record types
export enum ServiceType {
  // Standard service: inspection, consumable replacement, minor repairs 
  STANDARD = 'STANDARD',
  // Overhaul: complete teardown, NDT inspection, full rebuild 
  OVERHAUL = 'OVERHAUL',
}

// Enum for audit log action types
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

// Interface for Vendor data
export interface Vendor {
  id: number
  name: string
  code: string
  contactInfo: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

// Interface for creating a new vendor
export interface CreateVendorInput {
  name: string
  code: string
  contactInfo?: string
  active?: boolean
}

// Interface for AssetComponent data
export interface AssetComponent {
  id: number
  partNumber: string
  serialNumber: string
  lifecyclePhase: number
  totalServiceCount: number
  status: AssetStatus | string
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

// Extended asset component interface yo includes related service records
export interface AssetComponentWithHistory extends AssetComponent {
  serviceRecords: ServiceRecordWithVendor[]
}

// Interface for creating a new asset component
export interface CreateAssetInput {
  partNumber: string
  serialNumber: string
  lifecyclePhase?: number
  status?: AssetStatus
  notes?: string
}

// Interface for updating an asset component
export interface UpdateAssetInput {
  status?: AssetStatus
  notes?: string
}

// Interface for ServiceRecord data
export interface ServiceRecord {
  id: number
  assetComponentId: number
  vendorId: number
  serviceType: ServiceType | string
  serviceDate: Date
  lifecyclePhaseAtService: number
  workPerformed: string
  findings: string | null
  consumablesReplaced: boolean
  inspectorName: string
  notes: string | null
  createdAt: Date
}


// Extended service record that includes vendor details
export interface ServiceRecordWithVendor extends ServiceRecord {
  vendor: Vendor
}

//Extended service record that includes both asset and vendor details
export interface ServiceRecordWithDetails extends ServiceRecord {
  vendor: Vendor
  assetComponent: AssetComponent
}

// Interface for creating a new service record
export interface CreateServiceInput {
  assetComponentId: number
  vendorId: number
  serviceType: ServiceType
  serviceDate: string | Date
  workPerformed: string
  findings?: string
  consumablesReplaced?: boolean
  inspectorName: string
  notes?: string
}

// Interface for AuditLog data
export interface AuditLog {
  id: number
  tableName: string
  recordId: number
  action: AuditAction | string
  changedBy: string
  oldValues: string | null
  newValues: string
  timestamp: Date
}


// Parsed audit log with JSON values converted to objects
export interface ParsedAuditLog extends Omit<AuditLog, 'oldValues' | 'newValues'> {
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown>
}


// Standard API response structure
export interface ApiResponse<T = unknown> {
  // Whether the operation was successful
  success: boolean
  // The data payloa
  data?: T
  // Error message
  error?: string
  // Optional additional message
  message?: string
}

// Dashboard statistics interface
export interface DashboardStats {
  totalAssets: number
  inService: number
  atVendor: number
  dueForOverhaul: number
  retired: number
  ber: number
}

//Lookup query parameters
export interface LookupQuery {
  partNumber: string
  serialNumber: string
}
