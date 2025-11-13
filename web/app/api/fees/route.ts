import { NextRequest, NextResponse } from "next/server"
import { fetchRecommendedFees } from "@/lib/swap-utils"

// POST /api/fees - Get recommended fees
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const fees = await fetchRecommendedFees({
      sourceToken: body.sourceToken,
      destinationToken: body.destinationToken,
      sourceChainId: BigInt(body.sourceChainId),
      destinationChainId: BigInt(body.destinationChainId),
      amount: BigInt(body.amount),
    })

    return NextResponse.json({
      fees: {
        solver: fees.fees.solver.toString(),
        network: fees.fees.network.toString(),
        total: fees.fees.total.toString(),
      },
      transferAmount: fees.transferAmount.toString(),
      approvalAmount: fees.approvalAmount.toString(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

