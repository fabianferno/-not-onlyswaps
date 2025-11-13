// Solver Factory Service - Manages solver instances
import type { SolverConfig, SolverInstance } from "./solver-config"

// In-memory storage (in production, use a database)
// Using a global to ensure persistence across module reloads in Next.js
declare global {
  // eslint-disable-next-line no-var
  var __solverFactoryStorage: Map<string, SolverInstance> | undefined
  // eslint-disable-next-line no-var
  var __solverFactoryProcesses: Map<string, any> | undefined
}

const solvers = globalThis.__solverFactoryStorage || new Map<string, SolverInstance>()
const solverProcesses = globalThis.__solverFactoryProcesses || new Map<string, any>()

// Initialize globals if they don't exist
if (!globalThis.__solverFactoryStorage) {
  globalThis.__solverFactoryStorage = solvers
}
if (!globalThis.__solverFactoryProcesses) {
  globalThis.__solverFactoryProcesses = solverProcesses
}

export class SolverFactory {
  /**
   * Create a new solver instance
   */
  static createSolver(config: SolverConfig): SolverInstance {
    const id = config.id || `solver-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const createdAt = Date.now()

    const instance: SolverInstance = {
      id,
      config: {
        ...config,
        id,
        createdAt,
        enabled: false,
      },
      status: "stopped",
      stats: {
        tradesExecuted: 0,
        totalVolume: BigInt(0),
        averageRisk: 0,
        uptime: 0,
      },
    }

    solvers.set(id, instance)
    return instance
  }

  /**
   * Get all solvers
   */
  static getAllSolvers(): SolverInstance[] {
    return Array.from(solvers.values())
  }

  /**
   * Get solver by ID
   */
  static getSolver(id: string): SolverInstance | undefined {
    return solvers.get(id)
  }

  /**
   * Start a solver instance
   */
  static async startSolver(id: string): Promise<void> {
    const solver = solvers.get(id)
    if (!solver) {
      throw new Error(`Solver ${id} not found`)
    }

    if (solver.status === "running") {
      throw new Error(`Solver ${id} is already running`)
    }

    // In a real implementation, this would spawn a solver process
    // For now, we'll simulate it by updating the status
    solver.status = "running"
    solver.config.enabled = true
    solver.config.startedAt = Date.now()

    // Store process reference (in real implementation, this would be a child process)
    solverProcesses.set(id, {
      startTime: Date.now(),
      process: null, // Would be actual process in production
    })

    solvers.set(id, solver)
  }

  /**
   * Stop a solver instance
   */
  static async stopSolver(id: string): Promise<void> {
    const solver = solvers.get(id)
    if (!solver) {
      throw new Error(`Solver ${id} not found`)
    }

    if (solver.status !== "running") {
      throw new Error(`Solver ${id} is not running`)
    }

    // In a real implementation, this would kill the solver process
    const process = solverProcesses.get(id)
    if (process?.process) {
      // process.process.kill() // In production
    }

    solver.status = "stopped"
    solver.config.enabled = false
    if (solver.config.startedAt && solver.stats) {
      solver.stats.uptime += Date.now() - solver.config.startedAt
    }
    solver.config.startedAt = undefined

    solverProcesses.delete(id)
    solvers.set(id, solver)
  }

  /**
   * Delete a solver instance
   */
  static async deleteSolver(id: string): Promise<void> {
    const solver = solvers.get(id)
    if (!solver) {
      throw new Error(`Solver ${id} not found`)
    }

    // Stop if running
    if (solver.status === "running") {
      await this.stopSolver(id)
    }

    solvers.delete(id)
    solverProcesses.delete(id)
  }

  /**
   * Update solver stats
   */
  static updateSolverStats(id: string, stats: Partial<SolverInstance["stats"]>): void {
    const solver = solvers.get(id)
    if (!solver) return

    if (solver.stats) {
      solver.stats = {
        ...solver.stats,
        ...stats,
      }
    }

    // Update uptime if running
    if (solver.status === "running" && solver.config.startedAt) {
      solver.stats.uptime = Date.now() - solver.config.startedAt
    }

    solvers.set(id, solver)
  }

  /**
   * Get solver status with real-time stats
   */
  static getSolverStatus(id: string): SolverInstance | undefined {
    const solver = solvers.get(id)
    if (!solver) return undefined

    // Update uptime if running
    if (solver.status === "running" && solver.config.startedAt && solver.stats) {
      solver.stats.uptime = Date.now() - solver.config.startedAt
    }

    return solver
  }
}

