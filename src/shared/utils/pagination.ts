import { NextRequest } from 'next/server'

export interface PaginationParams {
  page: number
  limit: number
  skip: number
  take: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
    hasPrevious: boolean
  }
}

// Default and max limits
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100
const DEFAULT_PAGE = 1

/**
 * Extract pagination parameters from request URL
 *
 * Usage:
 * ```ts
 * export async function GET(req: NextRequest) {
 *   const { skip, take, page, limit } = getPaginationParams(req)
 *
 *   const items = await prisma.client.findMany({
 *     skip,
 *     take,
 *     orderBy: { createdAt: 'desc' }
 *   })
 *
 *   const total = await prisma.client.count()
 *
 *   return NextResponse.json(paginatedResponse(items, total, page, limit))
 * }
 * ```
 */
export function getPaginationParams(req: NextRequest): PaginationParams {
  const { searchParams } = new URL(req.url)

  // Parse page (1-indexed)
  let page = parseInt(searchParams.get('page') || String(DEFAULT_PAGE), 10)
  if (isNaN(page) || page < 1) page = DEFAULT_PAGE

  // Parse limit with max cap
  let limit = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10)
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT
  if (limit > MAX_LIMIT) limit = MAX_LIMIT

  // Calculate skip for Prisma
  const skip = (page - 1) * limit
  const take = limit

  return { page, limit, skip, take }
}

/**
 * Create a paginated response object
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit)

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
      hasPrevious: page > 1,
    },
  }
}

/**
 * Parse cursor-based pagination params (for infinite scroll)
 */
export interface CursorPaginationParams {
  cursor?: string
  take: number
}

export function getCursorPaginationParams(req: NextRequest): CursorPaginationParams {
  const { searchParams } = new URL(req.url)

  const cursor = searchParams.get('cursor') || undefined

  let take = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10)
  if (isNaN(take) || take < 1) take = DEFAULT_LIMIT
  if (take > MAX_LIMIT) take = MAX_LIMIT

  return { cursor, take }
}

/**
 * Create a cursor-based paginated response
 */
export interface CursorPaginatedResponse<T> {
  data: T[]
  nextCursor: string | null
  hasMore: boolean
}

export function cursorPaginatedResponse<T extends { id: string }>(
  data: T[],
  requestedTake: number
): CursorPaginatedResponse<T> {
  // If we got more items than requested, there are more pages
  const hasMore = data.length > requestedTake
  const trimmedData = hasMore ? data.slice(0, requestedTake) : data
  const nextCursor = hasMore && trimmedData.length > 0 ? trimmedData[trimmedData.length - 1].id : null

  return {
    data: trimmedData,
    nextCursor,
    hasMore,
  }
}

/**
 * Parse pagination params from URLSearchParams directly
 * Useful when you already have searchParams
 */
export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  let page = parseInt(searchParams.get('page') || String(DEFAULT_PAGE), 10)
  if (isNaN(page) || page < 1) page = DEFAULT_PAGE

  let limit = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10)
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT
  if (limit > MAX_LIMIT) limit = MAX_LIMIT

  const skip = (page - 1) * limit
  const take = limit

  return { page, limit, skip, take }
}

/**
 * Parse sort parameters from request
 */
export interface SortParams {
  orderBy: Record<string, 'asc' | 'desc'>
}

const ALLOWED_SORT_FIELDS = new Set([
  'createdAt',
  'updatedAt',
  'name',
  'title',
  'dueDate',
  'date',
  'amount',
  'total',
  'status',
  'priority',
])

export function getSortParams(req: NextRequest, defaultField = 'createdAt', defaultOrder: 'asc' | 'desc' = 'desc'): SortParams {
  const { searchParams } = new URL(req.url)

  let sortField = searchParams.get('sortBy') || defaultField
  const sortOrder = (searchParams.get('sortOrder') || defaultOrder) as 'asc' | 'desc'

  // Validate sort field to prevent injection
  if (!ALLOWED_SORT_FIELDS.has(sortField)) {
    sortField = defaultField
  }

  // Validate sort order
  const order = sortOrder === 'asc' ? 'asc' : 'desc'

  return {
    orderBy: { [sortField]: order },
  }
}
