import { NextRequest, NextResponse } from "next/server"
import { SolverFactory } from "@/lib/solver-factory"

// GET /api/solvers/[id] - Get a specific solver
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const solver = SolverFactory.getSolverStatus(id)
    
    if (!solver) {
      return NextResponse.json({ error: "Solver not found" }, { status: 404 })
    }

    // Serialize for response
    const serializedSolver = {
      ...solver,
      config: {
        ...solver.config,
        minSolverFee: solver.config.minSolverFee?.toString(),
      },
      stats: solver.stats
        ? {
            ...solver.stats,
            totalVolume: solver.stats.totalVolume.toString(),
          }
        : undefined,
    }

    return NextResponse.json({ solver: serializedSolver })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/solvers/[id] - Delete a solver
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await SolverFactory.deleteSolver(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

