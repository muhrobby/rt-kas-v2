export interface PaginationResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  startItem: number
  endItem: number
}

export function paginateItems<T>(items: T[], page: number, pageSize: number): PaginationResult<T> {
  const totalItems = items.length

  if (totalItems === 0) {
    return {
      items: [],
      page: 1,
      pageSize,
      totalItems: 0,
      totalPages: 0,
      startItem: 0,
      endItem: 0,
    }
  }

  const totalPages = Math.ceil(totalItems / pageSize)

  const safePage = Math.max(1, Math.min(page, totalPages))

  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)

  const paginatedItems = items.slice(startIndex, endIndex)

  return {
    items: paginatedItems,
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    startItem: startIndex + 1,
    endItem: endIndex,
  }
}