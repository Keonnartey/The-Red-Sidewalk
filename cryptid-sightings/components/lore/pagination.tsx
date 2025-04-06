"use client"

import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="max-w-5xl mx-auto mt-8 flex justify-center items-center gap-2">
      <Button
        variant="outline"
        className="bg-[#d9d9d9] rounded-md"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Previous
      </Button>

      {/* Page Numbers */}
      {[...Array(totalPages)].map((_, index) => (
        <Button
          key={index}
          variant="outline"
          className={`rounded-md px-3 py-1 min-w-[40px] ${currentPage === index + 1 ? "bg-[#d9d9d9]" : ""}`}
          onClick={() => onPageChange(index + 1)}
        >
          {index + 1}
        </Button>
      ))}

      <Button
        variant="outline"
        className="bg-[#d9d9d9] rounded-md"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
        <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 18L15 12L9 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>
    </div>
  )
}

