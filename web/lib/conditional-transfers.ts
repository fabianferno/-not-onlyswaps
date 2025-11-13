// Conditional Transfer Storage and Management
import type { ConditionalTransfer, Condition } from "./conditions"
import { parseTokenAmount } from "./swap-utils"

export interface StoredConditionalTransfer extends ConditionalTransfer {
  id: string
  createdAt: number
  status: "pending" | "fulfilled" | "expired" | "cancelled"
  requestId?: `0x${string}`
  fulfilledAt?: number
  conditionsMetAt?: number
}

// In-memory storage (in production, use a database)
const conditionalTransfers = new Map<string, StoredConditionalTransfer>()

export class ConditionalTransferManager {
  /**
   * Create a new conditional transfer
   */
  static createTransfer(
    transfer: ConditionalTransfer,
    userAddress: string
  ): StoredConditionalTransfer {
    const id = `ct-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const stored: StoredConditionalTransfer = {
      ...transfer,
      id,
      createdAt: Date.now(),
      status: "pending",
    }

    conditionalTransfers.set(id, stored)
    return stored
  }

  /**
   * Get all conditional transfers for a user
   */
  static getUserTransfers(userAddress: string): StoredConditionalTransfer[] {
    return Array.from(conditionalTransfers.values()).filter(
      (ct) => ct.recipient.toLowerCase() === userAddress.toLowerCase()
    )
  }

  /**
   * Get a specific conditional transfer
   */
  static getTransfer(id: string): StoredConditionalTransfer | undefined {
    return conditionalTransfers.get(id)
  }

  /**
   * Update transfer status
   */
  static updateTransferStatus(
    id: string,
    status: StoredConditionalTransfer["status"],
    requestId?: `0x${string}`,
    fulfilledAt?: number
  ): void {
    const transfer = conditionalTransfers.get(id)
    if (!transfer) return

    transfer.status = status
    if (requestId) transfer.requestId = requestId
    if (fulfilledAt) transfer.fulfilledAt = fulfilledAt
    if (status === "fulfilled") transfer.conditionsMetAt = Date.now()

    conditionalTransfers.set(id, transfer)
  }

  /**
   * Check if transfer has expired
   */
  static checkExpiration(id: string): boolean {
    const transfer = conditionalTransfers.get(id)
    if (!transfer || transfer.status !== "pending") return false

    const maxWaitTime = transfer.maxWaitTime || 300000 // 5 minutes default
    const elapsed = Date.now() - transfer.createdAt

    if (elapsed > maxWaitTime) {
      transfer.status = "expired"
      conditionalTransfers.set(id, transfer)
      return true
    }

    return false
  }

  /**
   * Cancel a transfer
   */
  static cancelTransfer(id: string): void {
    const transfer = conditionalTransfers.get(id)
    if (!transfer) return

    if (transfer.status === "pending") {
      transfer.status = "cancelled"
      conditionalTransfers.set(id, transfer)
    }
  }

  /**
   * Get all pending transfers
   */
  static getPendingTransfers(): StoredConditionalTransfer[] {
    return Array.from(conditionalTransfers.values()).filter(
      (ct) => ct.status === "pending"
    )
  }
}

