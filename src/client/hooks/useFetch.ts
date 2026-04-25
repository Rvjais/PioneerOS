'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

interface UseFetchState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  isError: boolean
  isSuccess: boolean
}

interface UseFetchOptions<T> {
  /** Initial data */
  initialData?: T | null
  /** Whether to fetch immediately on mount */
  immediate?: boolean
  /** Transform the response data */
  transform?: (data: unknown) => T
  /** Retry count on failure */
  retryCount?: number
  /** Delay between retries in ms */
  retryDelay?: number
  /** Callback on success */
  onSuccess?: (data: T) => void
  /** Callback on error */
  onError?: (error: Error) => void
}

interface UseFetchReturn<T> extends UseFetchState<T> {
  /** Trigger the fetch manually */
  fetch: () => Promise<T | null>
  /** Retry the last fetch */
  retry: () => Promise<T | null>
  /** Reset state */
  reset: () => void
  /** Set data manually */
  setData: (data: T | null) => void
  /** Refetch with polling interval */
  startPolling: (intervalMs: number) => void
  /** Stop polling */
  stopPolling: () => void
}

/**
 * Custom hook for data fetching with loading, error, and retry states
 */
export function useFetch<T>(
  url: string | (() => string),
  options: UseFetchOptions<T> = {}
): UseFetchReturn<T> {
  const {
    initialData = null,
    immediate = true,
    transform,
    retryCount = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options

  const [state, setState] = useState<UseFetchState<T>>({
    data: initialData,
    isLoading: immediate,
    error: null,
    isError: false,
    isSuccess: false,
  })

  const retriesRef = useRef(0)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const getUrl = useCallback(() => {
    return typeof url === 'function' ? url() : url
  }, [url])

  const fetchData = useCallback(async (): Promise<T | null> => {
    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setState(prev => ({ ...prev, isLoading: true, error: null, isError: false }))

    try {
      const response = await fetch(getUrl(), {
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      let data = await response.json()

      if (transform) {
        data = transform(data)
      }

      setState({
        data,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
      })

      retriesRef.current = 0
      onSuccess?.(data)
      return data
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return null
      }

      const error = err instanceof Error ? err : new Error('Unknown error occurred')

      // Retry logic
      if (retriesRef.current < retryCount) {
        retriesRef.current++
        await new Promise(resolve => setTimeout(resolve, retryDelay * retriesRef.current))
        return fetchData()
      }

      setState({
        data: null,
        isLoading: false,
        error,
        isError: true,
        isSuccess: false,
      })

      onError?.(error)
      return null
    }
  }, [getUrl, transform, retryCount, retryDelay, onSuccess, onError])

  const retry = useCallback(async () => {
    retriesRef.current = 0
    return fetchData()
  }, [fetchData])

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }
    setState({
      data: initialData,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: false,
    })
    retriesRef.current = 0
  }, [initialData])

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }))
  }, [])

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  const startPolling = useCallback((intervalMs: number) => {
    stopPolling()
    pollingRef.current = setInterval(fetchData, intervalMs)
  }, [fetchData, stopPolling])

  // Track URL for refetch on change
  const urlString = typeof url === 'function' ? 'dynamic' : url

  useEffect(() => {
    if (immediate) {
      fetchData()
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [urlString]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    fetch: fetchData,
    retry,
    reset,
    setData,
    startPolling,
    stopPolling,
  }
}

interface UseMutationState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  isError: boolean
  isSuccess: boolean
}

interface UseMutationOptions<T, V> {
  /** HTTP method */
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** Transform the response data */
  transform?: (data: unknown) => T
  /** Callback on success */
  onSuccess?: (data: T, variables: V) => void
  /** Callback on error */
  onError?: (error: Error, variables: V) => void
}

interface UseMutationReturn<T, V> extends UseMutationState<T> {
  /** Execute the mutation */
  mutate: (variables: V) => Promise<T | null>
  /** Reset state */
  reset: () => void
}

/**
 * Custom hook for mutations (POST, PUT, PATCH, DELETE)
 */
export function useMutation<T, V = unknown>(
  url: string | ((variables: V) => string),
  options: UseMutationOptions<T, V> = {}
): UseMutationReturn<T, V> {
  const {
    method = 'POST',
    transform,
    onSuccess,
    onError,
  } = options

  const [state, setState] = useState<UseMutationState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isError: false,
    isSuccess: false,
  })

  const getUrl = useCallback((variables: V) => {
    return typeof url === 'function' ? url(variables) : url
  }, [url])

  const mutate = useCallback(async (variables: V): Promise<T | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null, isError: false }))

    try {
      const response = await fetch(getUrl(variables), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variables),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      let data = await response.json()

      if (transform) {
        data = transform(data)
      }

      setState({
        data,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
      })

      onSuccess?.(data, variables)
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred')

      setState({
        data: null,
        isLoading: false,
        error,
        isError: true,
        isSuccess: false,
      })

      onError?.(error, variables)
      return null
    }
  }, [getUrl, method, transform, onSuccess, onError])

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: false,
    })
  }, [])

  return {
    ...state,
    mutate,
    reset,
  }
}

export default useFetch
