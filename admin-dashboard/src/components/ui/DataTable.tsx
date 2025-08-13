import React from 'react'
import { clsx } from 'clsx'
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from './Button'

export interface Column<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (value: any, item: T) => React.ReactNode
  className?: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  pagination?: PaginationMeta
  onPageChange?: (page: number) => void
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  isLoading?: boolean
  emptyMessage?: string
}

export function DataTable<T>({
  data,
  columns,
  pagination,
  onPageChange,
  onSort,
  sortColumn,
  sortDirection,
  isLoading = false,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return

    const columnKey = String(column.key)
    const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc'

    onSort(columnKey, newDirection)
  }

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null

    const columnKey = String(column.key)
    if (sortColumn !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 opacity-50" />
    }

    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    )
  }

  const renderPagination = () => {
    if (!pagination || !onPageChange) return null

    const { page, totalPages } = pagination
    const showPrevious = page > 1
    const showNext = page < totalPages

    return (
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700">
          Showing {(page - 1) * pagination.limit + 1} to{' '}
          {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} results
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={!showPrevious}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={!showNext}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={clsx(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-gray-100',
                    column.className
                  )}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {getSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((column, colIndex) => {
                    const value = column.key === 'index' ? rowIndex + 1 : (item as any)[column.key]

                    return (
                      <td
                        key={colIndex}
                        className={clsx(
                          'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
                          column.className
                        )}
                      >
                        {column.render ? column.render(value, item) : value}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {renderPagination()}
    </div>
  )
}
