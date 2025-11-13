import { NextRequest, NextResponse } from "next/server"
import { ConditionalTransferManager } from "@/lib/conditional-transfers"

// GET /api/conditional-transfers/[id]/status - Get transfer status and condition evaluation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const transfer = ConditionalTransferManager.getTransfer(id)

    if (!transfer) {
      return NextResponse.json({ error: "Transfer not found" }, { status: 404 })
    }

    // Check expiration
    const expired = ConditionalTransferManager.checkExpiration(id)

    // In a real implementation, this would evaluate conditions
    // For now, we'll return the current status
    const conditionsMet = transfer.status === "fulfilled"
    const timeRemaining = transfer.maxWaitTime
      ? Math.max(0, transfer.maxWaitTime - (Date.now() - transfer.createdAt))
      : null

    return NextResponse.json({
      id,
      status: transfer.status,
      conditionsMet,
      timeRemaining,
      expired,
      conditions: transfer.conditions,
      createdAt: transfer.createdAt,
      fulfilledAt: transfer.fulfilledAt,
      requestId: transfer.requestId,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

