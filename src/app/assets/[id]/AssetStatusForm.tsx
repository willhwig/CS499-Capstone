/**
 * AssetStatusForm Component (Client Component)
 * CS499 Capstone Project
 *
 * A form component for updating an asset's status and notes.
 * This is a client component because it needs to handle form submission
 * and display loading/success/error states.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AssetStatus } from '@/types'

interface AssetStatusFormProps {
  assetId: number
  currentStatus: string
  currentNotes: string
}

export default function AssetStatusForm({
  assetId,
  currentStatus,
  currentNotes,
}: AssetStatusFormProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [notes, setNotes] = useState(currentNotes)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  /**
   * Handles form submission
   * Calls the API to update the asset status
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Status updated successfully!' })
        // Refresh the page to show updated data
        router.refresh()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update status' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Status select */}
      <div>
        <label htmlFor="status" className="label">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input"
          disabled={isSubmitting}
        >
          {Object.values(AssetStatus).map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Notes text area */}
      <div>
        <label htmlFor="notes" className="label">
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input min-h-[80px]"
          placeholder="Add notes about this asset..."
          disabled={isSubmitting}
        />
      </div>

      {/* Message display */}
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

      {/* Submit button */}
      <button
        type="submit"
        className="btn-primary w-full justify-center"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Updating...' : 'Update Status'}
      </button>
    </form>
  )
}
