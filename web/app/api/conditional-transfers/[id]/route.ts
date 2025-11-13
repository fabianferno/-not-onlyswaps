import { NextRequest, NextResponse } from "next/server"
import { ConditionalTransferManager } from "@/lib/conditional-transfers"

// GET /api/conditional-transfers/[id] - Get a specific conditional transfer
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
    ConditionalTransferManager.checkExpiration(id)

    // Serialize for response
    const serialized = {
      ...transfer,
      amount: transfer.amount.toString(),
      fee: transfer.fee.toString(),
      destChainId: transfer.destChainId.toString(),
    }

    return NextResponse.json({ transfer: serialized })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/conditional-transfers/[id] - Cancel a conditional transfer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    ConditionalTransferManager.cancelTransfer(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

