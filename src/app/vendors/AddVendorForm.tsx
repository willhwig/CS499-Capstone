/**
 * AddVendorForm Component (Client Component)
 * CS499 Capstone Project
 *
 * A form for adding new vendors to the system.
 * This is a client component because it needs to handle form submission
 * and display loading/success/error states.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddVendorForm() {
  const router = useRouter()

  // Form state
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [contactInfo, setContactInfo] = useState('')

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  /**
   * Handles form submission
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    // Client side validation
    if (!name.trim() || !code.trim()) {
      setMessage({ type: 'error', text: 'Name and code are required' })
      return
    }

    // Validate code format
    if (!/^[A-Za-z0-9]{2,10}$/.test(code)) {
      setMessage({ type: 'error', text: 'Code must be 2-10 alphanumeric characters' })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim(),
          contactInfo: contactInfo.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Vendor added successfully!' })
        // Clear form
        setName('')
        setCode('')
        setContactInfo('')
        // Refresh page to show new vendor
        router.refresh()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add vendor' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className="label">
          Vendor Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder="e.g., Delta TechOps"
          disabled={isSubmitting}
          required
        />
      </div>

      {/* Code */}
      <div>
        <label htmlFor="code" className="label">
          Vendor Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="input font-mono"
          placeholder="e.g., DLT"
          maxLength={10}
          disabled={isSubmitting}
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          2-10 alphanumeric characters, used for identification
        </p>
      </div>

      {/* Contact Info */}
      <div>
        <label htmlFor="contactInfo" className="label">
          Contact Information
        </label>
        <input
          type="text"
          id="contactInfo"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          className="input"
          placeholder="e.g., Atlanta, GA - contact@example.com"
          disabled={isSubmitting}
        />
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="btn-primary w-full justify-center"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Adding...' : 'Add Vendor'}
      </button>
    </form>
  )
}
