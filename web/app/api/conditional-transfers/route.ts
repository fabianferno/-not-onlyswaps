import { NextRequest, NextResponse } from "next/server"
import { ConditionalTransferManager } from "@/lib/conditional-transfers"
import { parseTokenAmount } from "@/lib/swap-utils"
import type { ConditionalTransfer } from "@/lib/conditions"

// GET /api/conditional-transfers - Get user's conditional transfers
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userAddress = searchParams.get("userAddress")

    if (!userAddress) {
      return NextResponse.json(
        { error: "userAddress query parameter is required" },
        { status: 400 }
      )
    }

    const transfers = ConditionalTransferManager.getUserTransfers(userAddress)

    // Serialize BigInt values
    const serialized = transfers.map((t) => ({
      ...t,
      amount: t.amount.toString(),
      fee: t.fee.toString(),
      destChainId: t.destChainId.toString(),
    }))

    return NextResponse.json({ transfers: serialized })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/conditional-transfers - Create a new conditional transfer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userAddress = body.userAddress

    if (!userAddress) {
      return NextResponse.json(
        { error: "userAddress is required" },
        { status: 400 }
      )
    }

    // Validate required fields
    if (
      !body.amount ||
      !body.srcToken ||
      !body.destToken ||
      !body.destChainId ||
      !body.conditions ||
      body.conditions.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: amount, srcToken, destToken, destChainId, conditions",
        },
        { status: 400 }
      )
    }

    // Convert string amounts to BigInt
    const transfer: ConditionalTransfer = {
      recipient: userAddress,
      srcToken: body.srcToken,
      destToken: body.destToken,
      amount: parseTokenAmount(body.amount, 18),
      fee: body.fee ? BigInt(body.fee) : BigInt("10000000000000000"), // Default 0.01
      destChainId: BigInt(body.destChainId),
      conditions: body.conditions,
      maxWaitTime: body.maxWaitTime || 300000, // 5 minutes default
      priority: body.priority || 5,
    }

    const stored = ConditionalTransferManager.createTransfer(transfer, userAddress)

    // Serialize for response
    const serialized = {
      ...stored,
      amount: stored.amount.toString(),
      fee: stored.fee.toString(),
      destChainId: stored.destChainId.toString(),
    }

    return NextResponse.json({ transfer: serialized }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

