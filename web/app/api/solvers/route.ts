import { NextRequest, NextResponse } from "next/server"
import { SolverFactory } from "@/lib/solver-factory"
import type { SolverConfig } from "@/lib/solver-config"

// GET /api/solvers - List all solvers
export async function GET() {
  try {
    const solvers = SolverFactory.getAllSolvers()
    console.log(`[API] GET /api/solvers - Found ${solvers.length} solvers`)
    
    // Convert BigInt to string for JSON serialization
    const serializedSolvers = solvers.map((solver) => ({
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
    }))

    return NextResponse.json({ solvers: serializedSolvers })
  } catch (error: any) {
    console.error("[API] Error getting solvers:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/solvers - Create a new solver
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.networks || body.networks.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: name, networks" },
        { status: 400 }
      )
    }

    // Convert minSolverFee from string to BigInt if provided
    const config: SolverConfig = {
      name: body.name,
      agent: body.agent || {
        healthcheck_listen_addr: "0.0.0.0",
        healthcheck_port: 8081,
        log_level: "info",
        log_json: false,
      },
      networks: body.networks,
      useV2: body.useV2 !== undefined ? body.useV2 : true,
      maxRisk: body.maxRisk || 0.5,
      minSolverFee: body.minSolverFee
        ? BigInt(body.minSolverFee)
        : BigInt("10000000000000000"), // 0.01 tokens default
    }

    const solver = SolverFactory.createSolver(config)
    
    // Verify solver was created
    const allSolvers = SolverFactory.getAllSolvers()
    console.log(`[API] Created solver ${solver.id}. Total solvers: ${allSolvers.length}`)

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

    return NextResponse.json({ solver: serializedSolver }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

