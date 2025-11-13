"use client"

import { useState, useEffect, useCallback } from "react"
import { useAccount } from "wagmi"

export interface ConditionalTransfer {
  id: string
  recipient: string
  srcToken: string
  destToken: string
  amount: string
  fee: string
  destChainId: string
  conditions: any[]
  maxWaitTime?: number
  priority?: number
  createdAt: number
  status: "pending" | "fulfilled" | "expired" | "cancelled"
  requestId?: string
  fulfilledAt?: number
  conditionsMetAt?: number
}

export function useConditionalTransfers() {
  const { address } = useAccount()
  const [transfers, setTransfers] = useState<ConditionalTransfer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTransfers = useCallback(async () => {
    if (!address) {
      setTransfers([])
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/conditional-transfers?userAddress=${address}`)
      if (!response.ok) {
        throw new Error("Failed to fetch conditional transfers")
      }
      const data = await response.json()
      setTransfers(data.transfers || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transfers")
      setTransfers([])
    } finally {
      setIsLoading(false)
    }
  }, [address])

  const cancelTransfer = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/conditional-transfers/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to cancel transfer")
      }

      await loadTransfers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel transfer")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [loadTransfers])

  const checkStatus = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/conditional-transfers/${id}/status`)
      if (!response.ok) {
        throw new Error("Failed to check status")
      }
      return await response.json()
    } catch (err) {
      console.error("Failed to check status:", err)
      return null
    }
  }, [])

  useEffect(() => {
    if (address) {
      loadTransfers()
      // Poll for updates every 10 seconds
      const interval = setInterval(loadTransfers, 10000)
      return () => clearInterval(interval)
    }
  }, [address, loadTransfers])

  return {
    transfers,
    isLoading,
    error,
    loadTransfers,
    cancelTransfer,
    checkStatus,
  }
}

