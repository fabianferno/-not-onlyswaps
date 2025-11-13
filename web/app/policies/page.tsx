"use client"

import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConditionBuilder } from "@/components/condition-builder"
import { SolverManager } from "@/components/solver-manager"
import { useState } from "react"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { LOCAL_CHAIN_1, LOCAL_CHAIN_2, RUSD_ADDRESS } from "@/lib/chains"
import { parseTokenAmount } from "@/lib/swap-utils"
import type { Condition } from "@/lib/conditions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useConditionalTransfers } from "@/hooks/use-conditional-transfers"
import { formatTokenAmount } from "@/lib/swap-utils"
import { Trash2, Clock, CheckCircle } from "lucide-react"

export default function PoliciesPage() {
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState("")
  const [conditions, setConditions] = useState<Condition[]>([])
  const [maxWaitTime, setMaxWaitTime] = useState("300000") // 5 minutes default
  const [priority, setPriority] = useState("5")
  const { transfers, isLoading: transfersLoading, cancelTransfer } = useConditionalTransfers()

  const handleCreatePolicy = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet")
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (conditions.length === 0) {
      toast.error("Please add at least one condition")
      return
    }

    try {
      // First, fetch fees
      const feeResponse = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceToken: RUSD_ADDRESS,
          destinationToken: RUSD_ADDRESS,
          sourceChainId: LOCAL_CHAIN_1.id,
          destinationChainId: LOCAL_CHAIN_2.id,
          amount: parseTokenAmount(amount, 18).toString(),
        }),
      })

      let fee = BigInt("10000000000000000") // Default 0.01
      if (feeResponse.ok) {
        const feeData = await feeResponse.json()
        fee = BigInt(feeData.fees?.solver || "10000000000000000")
      }

      // Create conditional transfer
      const response = await fetch("/api/conditional-transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: address,
          amount,
          srcToken: RUSD_ADDRESS,
          destToken: RUSD_ADDRESS,
          destChainId: LOCAL_CHAIN_2.id,
          fee: fee.toString(),
          conditions,
          maxWaitTime: parseInt(maxWaitTime),
          priority: parseInt(priority),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create conditional transfer")
      }

      const data = await response.json()
      toast.success(`Conditional transfer created! ID: ${data.transfer.id.slice(0, 8)}...`)
      
      // Reset form
      setAmount("")
      setConditions([])
      setMaxWaitTime("300000")
      setPriority("5")
    } catch (error: any) {
      toast.error(error?.message || "Failed to create conditional transfer")
    }
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 ml-64 p-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-4 h-4 bg-orange-500 transform -rotate-45"></div>
            <h1 className="text-4xl font-bold text-white">only policies</h1>
          </div>
          <p className="text-gray-400 text-sm max-w-2xl">
            Define conditions that must be met before your funds move. Use SolverV2's advanced
            features to create conditional transfers with price, time, balance, and custom
            conditions.
          </p>
        </div>

        {!isConnected && (
          <div className="max-w-2xl mb-8">
            <div className="bg-gray-900/30 rounded-lg p-8 border border-gray-800 text-center">
              <div className="text-gray-500 text-sm mb-4">CONNECT YOUR WALLET TO CREATE POLICIES</div>
              <ConnectButton />
            </div>
          </div>
        )}

        {isConnected && (
          <Tabs defaultValue="create" className="max-w-4xl">
            <TabsList className="bg-gray-900/30 border border-gray-800">
              <TabsTrigger value="create" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">
                Create Policy
              </TabsTrigger>
              <TabsTrigger value="list" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">
                My Policies ({transfers.length})
              </TabsTrigger>
              <TabsTrigger value="solvers" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">
                Manage Solvers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-6">
              <div className="bg-gray-900/30 rounded-lg p-8 border border-gray-800 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Create Conditional Transfer</h2>
                  <p className="text-sm text-gray-400 mb-6">
                    Set up a transfer that only executes when your specified conditions are met.
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <Label className="text-white mb-2 block">Amount to Transfer</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-black border-gray-800 text-white text-2xl font-bold h-14"
                    step="0.01"
                    min="0"
                  />
                  <div className="text-gray-500 text-sm mt-2">RUSD</div>
                </div>

                {/* Source Chain */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white mb-2 block">Source Chain</Label>
                    <Select defaultValue={LOCAL_CHAIN_1.id.toString()}>
                      <SelectTrigger className="bg-black border-gray-800 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={LOCAL_CHAIN_1.id.toString()}>
                          {LOCAL_CHAIN_1.name} (ID: {LOCAL_CHAIN_1.id})
                        </SelectItem>
                        <SelectItem value={LOCAL_CHAIN_2.id.toString()}>
                          {LOCAL_CHAIN_2.name} (ID: {LOCAL_CHAIN_2.id})
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Destination Chain</Label>
                    <Select defaultValue={LOCAL_CHAIN_2.id.toString()}>
                      <SelectTrigger className="bg-black border-gray-800 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={LOCAL_CHAIN_1.id.toString()}>
                          {LOCAL_CHAIN_1.name} (ID: {LOCAL_CHAIN_1.id})
                        </SelectItem>
                        <SelectItem value={LOCAL_CHAIN_2.id.toString()}>
                          {LOCAL_CHAIN_2.name} (ID: {LOCAL_CHAIN_2.id})
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Conditions */}
                <div>
                  <Label className="text-white mb-2 block">Conditions</Label>
                  <ConditionBuilder conditions={conditions} onChange={setConditions} />
                </div>

                {/* Advanced Options */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                  <div>
                    <Label className="text-white mb-2 block">Max Wait Time (ms)</Label>
                    <Input
                      type="number"
                      value={maxWaitTime}
                      onChange={(e) => setMaxWaitTime(e.target.value)}
                      className="bg-black border-gray-800 text-white"
                      placeholder="300000"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {parseInt(maxWaitTime) / 1000 / 60} minutes
                    </div>
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Priority (1-10)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="bg-black border-gray-800 text-white"
                    />
                    <div className="text-xs text-gray-500 mt-1">Higher = more important</div>
                  </div>
                </div>

                {/* Create Button */}
                <Button
                  onClick={handleCreatePolicy}
                  disabled={!amount || parseFloat(amount) <= 0 || conditions.length === 0}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold py-6 text-lg"
                >
                  Create Conditional Transfer
                </Button>

                {/* Info */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-sm text-gray-400">
                    <strong className="text-white">How it works:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Your transfer will be created but won't execute until all conditions are met</li>
                      <li>SolverV2 will continuously monitor and evaluate your conditions</li>
                      <li>Once conditions are met, the solver will automatically execute the transfer</li>
                      <li>If conditions aren't met within the max wait time, the transfer expires</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="list" className="mt-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white mb-4">My Conditional Transfers</h2>
                
                {transfersLoading ? (
                  <div className="text-center py-12 text-gray-500">Loading...</div>
                ) : transfers.length === 0 ? (
                  <div className="bg-gray-900/30 rounded-lg p-12 border border-gray-800 text-center">
                    <div className="text-gray-500 mb-4">No conditional transfers yet</div>
                    <p className="text-sm text-gray-600">Create your first conditional transfer in the "Create Policy" tab</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transfers.map((transfer) => (
                      <div
                        key={transfer.id}
                        className="bg-gray-900/30 rounded-lg p-6 border border-gray-800"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-gray-400">ID: {transfer.id.slice(0, 12)}...</span>
                              <span className="text-gray-600">•</span>
                              <span
                                className={`text-sm ${
                                  transfer.status === "fulfilled"
                                    ? "text-green-400"
                                    : transfer.status === "expired" || transfer.status === "cancelled"
                                    ? "text-red-400"
                                    : "text-yellow-400"
                                }`}
                              >
                                {transfer.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-lg font-semibold text-white">
                              {formatTokenAmount(BigInt(transfer.amount), 18)} RUSD
                            </div>
                          </div>
                          {transfer.status === "pending" && (
                            <Button
                              onClick={async () => {
                                if (confirm("Cancel this conditional transfer?")) {
                                  try {
                                    await cancelTransfer(transfer.id)
                                    toast.success("Transfer cancelled")
                                  } catch (error: any) {
                                    toast.error(error?.message || "Failed to cancel")
                                  }
                                }
                              }}
                              variant="outline"
                              className="border-red-800 text-red-400 hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-500">Destination Chain:</span>
                            <span className="text-white ml-2">Chain {transfer.destChainId}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Fee:</span>
                            <span className="text-white ml-2">
                              {formatTokenAmount(BigInt(transfer.fee), 18)} RUSD
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Priority:</span>
                            <span className="text-white ml-2">{transfer.priority || 5}/10</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Created:</span>
                            <span className="text-white ml-2">
                              {new Date(transfer.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Conditions */}
                        <div className="pt-4 border-t border-gray-800">
                          <div className="text-xs text-gray-500 mb-2">Conditions ({transfer.conditions.length})</div>
                          <div className="space-y-2">
                            {transfer.conditions.map((condition, idx) => (
                              <div
                                key={idx}
                                className="bg-gray-800/50 rounded px-3 py-2 text-xs text-gray-300"
                              >
                                <span className="text-orange-400">{condition.type}</span>
                                <span className="text-gray-600 mx-2">•</span>
                                <span>{condition.operator}</span>
                                {condition.params.value && (
                                  <>
                                    <span className="text-gray-600 mx-2">•</span>
                                    <span>Value: {condition.params.value}</span>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Status Info */}
                        {transfer.status === "pending" && transfer.maxWaitTime && (
                          <div className="mt-4 pt-4 border-t border-gray-800">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span>
                                Time remaining:{" "}
                                {Math.max(
                                  0,
                                  Math.floor(
                                    (transfer.maxWaitTime - (Date.now() - transfer.createdAt)) / 1000 / 60
                                  )
                                )}{" "}
                                minutes
                              </span>
                            </div>
                          </div>
                        )}

                        {transfer.status === "fulfilled" && transfer.fulfilledAt && (
                          <div className="mt-4 pt-4 border-t border-gray-800">
                            <div className="flex items-center gap-2 text-sm text-green-400">
                              <CheckCircle className="w-4 h-4" />
                              <span>
                                Fulfilled at {new Date(transfer.fulfilledAt).toLocaleString()}
                              </span>
                            </div>
                            {transfer.requestId && (
                              <div className="text-xs text-gray-500 mt-1 font-mono">
                                Request ID: {transfer.requestId.slice(0, 16)}...
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="solvers" className="mt-6">
              <SolverManager />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
