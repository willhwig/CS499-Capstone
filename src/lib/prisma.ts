/**
 * Prisma Client
 * CS499 Capstone Project
 *
 * This file creates a single instance of the Prisma client to prevent
 * multiple instances from being created during development with hot reloading.
 */

import { PrismaClient } from '@prisma/client'

// I'm using TypeScripts global augmentation to add our prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create the Prisma client instance
// In development, reuse the existing instance if it exists
// In production, always create a new instance
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // Log queries in development for debugging purposes
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Save the instance to the global object in development to prevents creating multiple instances during hot reloading
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
