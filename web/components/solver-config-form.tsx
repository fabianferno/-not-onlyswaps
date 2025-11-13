"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSolvers } from "@/hooks/use-solvers"
import { Plus, X } from "lucide-react"
import type { NetworkConfig, AgentConfig } from "@/lib/solver-config"
import { LOCAL_CHAIN_1, LOCAL_CHAIN_2, ROUTER_ADDRESS, RUSD_ADDRESS } from "@/lib/chains"

interface SolverConfigFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function SolverConfigForm({ onSuccess, onCancel }: SolverConfigFormProps) {
  const { createSolver } = useSolvers()
  const [name, setName] = useState("")
  const [useV2, setUseV2] = useState(true)
  const [maxRisk, setMaxRisk] = useState("0.5")
  const [minSolverFee, setMinSolverFee] = useState("0.01")
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    healthcheck_listen_addr: "0.0.0.0",
    healthcheck_port: 8081,
    log_level: "info",
    log_json: false,
  })
  const [networks, setNetworks] = useState<NetworkConfig[]>([
    {
      chain_id: LOCAL_CHAIN_1.id,
      rpc_url: LOCAL_CHAIN_1.rpcUrls.default.http[0],
      tokens: [RUSD_ADDRESS],
      router_address: ROUTER_ADDRESS,
    },
  ])

  const addNetwork = () => {
    setNetworks([
      ...networks,
      {
        chain_id: 0,
        rpc_url: "",
        tokens: [],
        router_address: "",
      },
    ])
  }

  const removeNetwork = (index: number) => {
    setNetworks(networks.filter((_, i) => i !== index))
  }

  const updateNetwork = (index: number, updates: Partial<NetworkConfig>) => {
    const updated = [...networks]
    updated[index] = { ...updated[index], ...updates }
    setNetworks(updated)
  }

  const addToken = (networkIndex: number, token: string) => {
    if (!token) return
    const updated = [...networks]
    updated[networkIndex].tokens = [...updated[networkIndex].tokens, token]
    setNetworks(updated)
  }

  const removeToken = (networkIndex: number, tokenIndex: number) => {
    const updated = [...networks]
    updated[networkIndex].tokens = updated[networkIndex].tokens.filter((_, i) => i !== tokenIndex)
    setNetworks(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const config = {
        name,
        agent: agentConfig,
        networks: networks.filter((n) => n.chain_id > 0 && n.rpc_url && n.router_address),
        useV2,
        maxRisk: parseFloat(maxRisk),
        minSolverFee: (parseFloat(minSolverFee) * 1e18).toString(), // Convert to wei
      }

      await createSolver(config)
      onSuccess()
    } catch (error: any) {
      console.error("Failed to create solver:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label className="text-white mb-2 block">Solver Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Custom Solver"
            className="bg-black border-gray-800 text-white"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white mb-2 block">Use SolverV2</Label>
            <Select value={useV2.toString()} onValueChange={(v) => setUseV2(v === "true")}>
              <SelectTrigger className="bg-black border-gray-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes (Recommended)</SelectItem>
                <SelectItem value="false">No (Legacy)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white mb-2 block">Max Risk (0-1)</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={maxRisk}
              onChange={(e) => setMaxRisk(e.target.value)}
              className="bg-black border-gray-800 text-white"
            />
          </div>
        </div>

        <div>
          <Label className="text-white mb-2 block">Min Solver Fee (tokens)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={minSolverFee}
            onChange={(e) => setMinSolverFee(e.target.value)}
            className="bg-black border-gray-800 text-white"
          />
        </div>
      </div>

      {/* Agent Config */}
      <div className="space-y-4 border-t border-gray-800 pt-4">
        <h3 className="text-white font-semibold">Agent Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white mb-2 block">Listen Address</Label>
            <Input
              value={agentConfig.healthcheck_listen_addr}
              onChange={(e) =>
                setAgentConfig({ ...agentConfig, healthcheck_listen_addr: e.target.value })
              }
              className="bg-black border-gray-800 text-white"
            />
          </div>
          <div>
            <Label className="text-white mb-2 block">Port</Label>
            <Input
              type="number"
              value={agentConfig.healthcheck_port}
              onChange={(e) =>
                setAgentConfig({ ...agentConfig, healthcheck_port: parseInt(e.target.value) })
              }
              className="bg-black border-gray-800 text-white"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white mb-2 block">Log Level</Label>
            <Select
              value={agentConfig.log_level || "info"}
              onValueChange={(v) => setAgentConfig({ ...agentConfig, log_level: v })}
            >
              <SelectTrigger className="bg-black border-gray-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debug">Debug</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warn</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Networks */}
      <div className="space-y-4 border-t border-gray-800 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Networks</h3>
          <Button type="button" onClick={addNetwork} variant="outline" className="border-gray-800">
            <Plus className="w-4 h-4 mr-2" />
            Add Network
          </Button>
        </div>

        {networks.map((network, idx) => (
          <div key={idx} className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Network {idx + 1}</span>
              {networks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeNetwork(idx)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-400 mb-1 block">Chain ID</Label>
                <Input
                  type="number"
                  value={network.chain_id || ""}
                  onChange={(e) => updateNetwork(idx, { chain_id: parseInt(e.target.value) })}
                  className="bg-black border-gray-800 text-white text-sm"
                  placeholder="31337"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400 mb-1 block">Router Address</Label>
                <Input
                  value={network.router_address}
                  onChange={(e) => updateNetwork(idx, { router_address: e.target.value })}
                  className="bg-black border-gray-800 text-white text-sm"
                  placeholder="0x..."
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-400 mb-1 block">RPC URL</Label>
              <Input
                value={network.rpc_url}
                onChange={(e) => updateNetwork(idx, { rpc_url: e.target.value })}
                className="bg-black border-gray-800 text-white text-sm"
                placeholder="https://..."
              />
            </div>

            <div>
              <Label className="text-xs text-gray-400 mb-1 block">Tokens</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {network.tokens.map((token, tokenIdx) => (
                  <div
                    key={tokenIdx}
                    className="bg-gray-800 rounded px-2 py-1 text-xs text-gray-300 flex items-center gap-1"
                  >
                    {token.slice(0, 10)}...
                    <button
                      type="button"
                      onClick={() => removeToken(idx, tokenIdx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="0x..."
                  className="bg-black border-gray-800 text-white text-sm flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addToken(idx, e.currentTarget.value)
                      e.currentTarget.value = ""
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    const input = document.querySelector(
                      `input[placeholder="0x..."]`
                    ) as HTMLInputElement
                    if (input?.value) {
                      addToken(idx, input.value)
                      input.value = ""
                    }
                  }}
                  variant="outline"
                  className="border-gray-800"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
        <Button type="button" onClick={onCancel} variant="outline" className="border-gray-800">
          Cancel
        </Button>
        <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-black">
          Create Solver
        </Button>
      </div>
    </form>
  )
}

