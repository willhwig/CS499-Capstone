/**
 * Audit Logging Utilities
 * CS499 Capstone Project
 *
 * This module provides functions for creating audit log entries.
 * In regulated industries, complete traceability is required by regulations.
 */

import prisma from './prisma'

// The types of actions that can be audited
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}


// Parameters for creating an audit log entry
export interface AuditLogParams {
  // The name of the table that was modified 
  tableName: string
  // The ID of the record that was modified
  recordId: number
  // The type of action performed 
  action: AuditAction
  // Who performed the action
  changedBy: string
  // The old values before the change
  oldValues?: Record<string, unknown> | null
  // The new values after the change 
  newValues: Record<string, unknown>
}

/**
 * Creates an audit log entry in the database.
 * @param params - The audit log parameters
 * @returns The created audit log entry
 */
export async function createAuditLog(params: AuditLogParams) {
  const { tableName, recordId, action, changedBy, oldValues, newValues } = params

  // I'm wrapping this in a try-catch because audit logging should never cause the main operation to fail
  try {
    const auditEntry = await prisma.auditLog.create({
      data: {
        tableName,
        recordId,
        action,
        changedBy,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: JSON.stringify(newValues),
      },
    })

    return auditEntry
  } catch (error) {
    // Log the error but don't throw
    console.error('Failed to create audit log entry:', error)
    console.error('Audit params:', params)
    return null
  }
}

/**
 * Helper function to create an audit log for a CREATE operation
 * @param tableName - The table where the record was created
 * @param recordId - The ID of the new record
 * @param newValues - The values of the new record
 * @param changedBy - Who created the record
 */
export async function auditCreate(
  tableName: string,
  recordId: number,
  newValues: Record<string, unknown>,
  changedBy: string
) {
  return createAuditLog({
    tableName,
    recordId,
    action: AuditAction.CREATE,
    changedBy,
    oldValues: null,
    newValues,
  })
}

/**
 * Helper function to create an audit log for an UPDATE operation
 * @param tableName - The table where the record was updated
 * @param recordId - The ID of the updated record
 * @param oldValues - The values before the update
 * @param newValues - The values after the update
 * @param changedBy - Who made the update
 */
export async function auditUpdate(
  tableName: string,
  recordId: number,
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>,
  changedBy: string
) {
  return createAuditLog({
    tableName,
    recordId,
    action: AuditAction.UPDATE,
    changedBy,
    oldValues,
    newValues,
  })
}

/**
 * Helper function to create an audit log for a DELETE operation
 * @param tableName - The table where the record was deleted
 * @param recordId - The ID of the deleted record
 * @param oldValues - The values of the record before deletion
 * @param changedBy - Who deleted the record
 */
export async function auditDelete(
  tableName: string,
  recordId: number,
  oldValues: Record<string, unknown>,
  changedBy: string
) {
  return createAuditLog({
    tableName,
    recordId,
    action: AuditAction.DELETE,
    changedBy,
    oldValues,
    newValues: { deleted: true, deletedAt: new Date().toISOString() },
  })
}

/**
 * Calculates what fields changed between two objects.
 * @param oldValues - The original values
 * @param newValues - The updated values
 * @returns An object containing only the changed fields
 */
export function calculateChangedFields(
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>
): { oldFields: Record<string, unknown>; newFields: Record<string, unknown> } {
  const oldFields: Record<string, unknown> = {}
  const newFields: Record<string, unknown> = {}

  // Check all keys in newValues for changes
  for (const key of Object.keys(newValues)) {
    // Skip internal fields that we don't need to audit
    if (key === 'updatedAt' || key === 'createdAt') continue

    // Compare values
    if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
      oldFields[key] = oldValues[key]
      newFields[key] = newValues[key]
    }
  }

  return { oldFields, newFields }
}
