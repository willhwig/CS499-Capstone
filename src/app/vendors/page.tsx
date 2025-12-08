/**
 * Vendors Page
 * CS499 Capstone Project
 *
 * This page displays all vendors (maintenance facilities) in the system
 * and allows adding new vendors. Vendors are the companies that can
 * perform wheel services.
 */

import Link from 'next/link'
import prisma from '@/lib/prisma'
import AddVendorForm from './AddVendorForm'

/**
 * Fetches all vendors with their service counts
 */
async function getVendors() {
  return prisma.vendor.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { serviceRecords: true },
      },
    },
  })
}

export default async function VendorsPage() {
  const vendors = await getVendors()

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Vendors</h1>
        <p className="page-description">
          Maintenance facilities registered in the system
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendors List */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Registered Vendors ({vendors.length})
            </h2>

            {vendors.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No vendors registered yet. Add your first vendor using the form.
              </p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Vendor</th>
                      <th>Code</th>
                      <th>Services Performed</th>
                      <th>Status</th>
                      <th>Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {vendors.map((vendor) => (
                      <tr key={vendor.id}>
                        <td className="font-medium">{vendor.name}</td>
                        <td>
                          <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                            {vendor.code}
                          </span>
                        </td>
                        <td>{vendor._count.serviceRecords}</td>
                        <td>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              vendor.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {vendor.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="text-sm text-gray-600">
                          {vendor.contactInfo || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add Vendor Form */}
        <div>
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Vendor
            </h2>
            <AddVendorForm />
          </div>

          {/* Info box */}
          <div className="card mt-6 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">About Vendors</h3>
            <p className="text-sm text-blue-800">
              Vendors are the maintenance facilities authorized to perform
              wheel services. Each vendor is assigned a unique code that
              identifies them in the audit trail.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
