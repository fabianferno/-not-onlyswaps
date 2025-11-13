"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSolvers } from "@/hooks/use-solvers"
import { Play, Square, Trash2, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SolverConfigForm } from "./solver-config-form"

export function SolverManager() {
  const { solvers, isLoading, error, startSolver, stopSolver, deleteSolver } = useSolvers()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const handleStart = async (id: string) => {
    try {
      await startSolver(id)
      toast.success("Solver started successfully")
    } catch (error: any) {
      toast.error(error?.message || "Failed to start solver")
    }
  }

  const handleStop = async (id: string) => {
    try {
      await stopSolver(id)
      toast.success("Solver stopped successfully")
    } catch (error: any) {
      toast.error(error?.message || "Failed to stop solver")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this solver?")) return

    try {
      await deleteSolver(id)
      toast.success("Solver deleted successfully")
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete solver")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Solver Management</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Create New Solver
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Solver</DialogTitle>
            </DialogHeader>
            <SolverConfigForm
              onSuccess={() => {
                setShowCreateDialog(false)
                toast.success("Solver created successfully")
              }}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {isLoading && solvers.length === 0 && !error ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        </div>
      ) : solvers.length === 0 ? (
        <div className="bg-gray-900/30 rounded-lg p-12 border border-gray-800 text-center">
          <div className="text-gray-500 mb-4">No solvers configured</div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-orange-500 hover:bg-orange-600 text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Solver
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500 mr-2" />
              <span className="text-sm text-gray-500">Refreshing...</span>
            </div>
          )}
          {solvers.map((solver) => (
            <div
              key={solver.id}
              className="bg-gray-900/30 rounded-lg p-6 border border-gray-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {solver.config.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>ID: {solver.id.slice(0, 8)}...</span>
                    <span>•</span>
                    <span
                      className={`${
                        solver.status === "running"
                          ? "text-green-400"
                          : solver.status === "error"
                          ? "text-red-400"
                          : "text-gray-400"
                      }`}
                    >
                      {solver.status.toUpperCase()}
                    </span>
                    {solver.config.useV2 && (
                      <>
                        <span>•</span>
                        <span className="text-orange-400">SolverV2</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {solver.status === "running" ? (
                    <Button
                      onClick={() => handleStop(solver.id)}
                      variant="outline"
                      className="border-gray-800 text-gray-300 hover:bg-gray-900"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleStart(solver.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(solver.id)}
                    variant="outline"
                    className="border-red-800 text-red-400 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Solver Stats */}
              {solver.stats && (
                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-800">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Trades Executed</div>
                    <div className="text-lg font-semibold text-white">
                      {solver.stats.tradesExecuted}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Total Volume</div>
                    <div className="text-lg font-semibold text-white">
                      {parseFloat(solver.stats.totalVolume) / 1e18} RUSD
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Avg Risk</div>
                    <div className="text-lg font-semibold text-white">
                      {(solver.stats.averageRisk * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Uptime</div>
                    <div className="text-lg font-semibold text-white">
                      {Math.floor(solver.stats.uptime / 3600)}h
                    </div>
                  </div>
                </div>
              )}

              {/* Network Info */}
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="text-xs text-gray-500 mb-2">Networks</div>
                <div className="flex flex-wrap gap-2">
                  {solver.config.networks.map((net, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-800/50 rounded px-2 py-1 text-xs text-gray-300"
                    >
                      Chain {net.chain_id}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

