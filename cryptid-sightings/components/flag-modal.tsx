"use client"

import { useState } from "react"

interface FlagModalProps {
  title: string
  open: boolean
  onClose: () => void
  onSubmit: (reasonCode: string, customReason: string) => void
}

const FlagModal: React.FC<FlagModalProps> = ({ title, open, onClose, onSubmit }) => {
  const [reason, setReason] = useState("spam")
  const [customReason, setCustomReason] = useState("")

  const handleSubmit = () => {
    onSubmit(reason, customReason)
    setReason("spam")
    setCustomReason("")
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-[1200] flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
        <h3 className="text-lg font-bold mb-4">{title}</h3>

        <label className="block mb-2 text-sm font-medium">Reason</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        >
          <option value="spam">Spam</option>
          <option value="misleading">Misleading</option>
          <option value="inappropriate">Inappropriate</option>
          <option value="offensive">Offensive</option>
        </select>

        <label className="block mb-2 text-sm font-medium">Custom Reason (Optional)</label>
        <textarea
          value={customReason}
          onChange={(e) => setCustomReason(e.target.value)}
          placeholder="Add more details..."
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          rows={3}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  )
}

export default FlagModal
