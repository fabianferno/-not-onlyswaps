import { NextRequest, NextResponse } from "next/server"
import { SolverFactory } from "@/lib/solver-factory"

// POST /api/solvers/[id]/stop - Stop a solver
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await SolverFactory.stopSolver(id)
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

