"use client"

import { useState, useEffect, useCallback } from "react"

export interface SolverInstance {
  id: string
  config: {
    id?: string
    name: string
    agent: {
      healthcheck_listen_addr: string
      healthcheck_port: number
      log_level?: string
      log_json?: boolean
    }
    networks: Array<{
      chain_id: number
      rpc_url: string
      tokens: string[]
      router_address: string
      tx_gas_buffer?: number
      tx_gas_price_buffer?: number
    }>
    useV2?: boolean
    maxRisk?: number
    minSolverFee?: string
    enabled?: boolean
    createdAt?: number
    startedAt?: number
  }
  status: "running" | "stopped" | "error"
  stats?: {
    tradesExecuted: number
    totalVolume: string
    averageRisk: number
    uptime: number
  }
}

const SOLVER_API_URL = "/api/solvers"

export function useSolvers() {
  const [solvers, setSolvers] = useState<SolverInstance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load all solvers
  const loadSolvers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${SOLVER_API_URL}`)
      if (!response.ok) {
        throw new Error("Failed to fetch solvers")
      }
      const data = await response.json()
      console.log("Loaded solvers:", data.solvers)
      setSolvers(data.solvers || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load solvers")
      // For now, use empty array if API is not available
      setSolvers([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create a new solver
  const createSolver = useCallback(async (config: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${SOLVER_API_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create solver")
      }

      const data = await response.json()
      console.log("Created solver:", data.solver)
      // Small delay to ensure server has processed the creation
      await new Promise((resolve) => setTimeout(resolve, 100))
      await loadSolvers()
      return data.solver
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create solver"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [loadSolvers])

  // Start a solver
  const startSolver = useCallback(async (solverId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${SOLVER_API_URL}/${solverId}/start`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to start solver")
      }

      await loadSolvers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start solver")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [loadSolvers])

  // Stop a solver
  const stopSolver = useCallback(async (solverId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${SOLVER_API_URL}/${solverId}/stop`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to stop solver")
      }

      await loadSolvers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stop solver")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [loadSolvers])

  // Delete a solver
  const deleteSolver = useCallback(async (solverId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${SOLVER_API_URL}/${solverId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete solver")
      }

      await loadSolvers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete solver")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [loadSolvers])

  useEffect(() => {
    loadSolvers()
  }, [loadSolvers])

  return {
    solvers,
    isLoading,
    error,
    loadSolvers,
    createSolver,
    startSolver,
    stopSolver,
    deleteSolver,
  }
}

