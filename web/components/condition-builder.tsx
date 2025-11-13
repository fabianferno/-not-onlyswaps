"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { X, Plus } from "lucide-react"
import type { Condition, ConditionType, ConditionOperator } from "@/lib/conditions"

interface ConditionBuilderProps {
  conditions: Condition[]
  onChange: (conditions: Condition[]) => void
}

export function ConditionBuilder({ conditions, onChange }: ConditionBuilderProps) {
  const [newConditionType, setNewConditionType] = useState<ConditionType | "">("")
  const [newConditionOperator, setNewConditionOperator] = useState<ConditionOperator | "">("")

  const addCondition = () => {
    if (!newConditionType || !newConditionOperator) return

    let params: Record<string, any> = {}

    switch (newConditionType) {
      case "price":
        params = { value: 0, tokenPair: "", chainId: undefined }
        break
      case "time":
        params = { timestamp: Date.now() }
        break
      case "balance":
        params = { token: "", chainId: 0, value: "0" }
        break
      case "custom":
        params = { contract: "", function: "", expectedResult: "", chainId: 0 }
        break
    }

    const condition: Condition = {
      type: newConditionType,
      operator: newConditionOperator,
      params,
    }

    onChange([...conditions, condition])
    setNewConditionType("")
    setNewConditionOperator("")
  }

  const removeCondition = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index))
  }

  const updateCondition = (index: number, updates: Partial<Condition>) => {
    const updated = [...conditions]
    updated[index] = { ...updated[index], ...updates }
    onChange(updated)
  }

  const updateConditionParam = (index: number, key: string, value: any) => {
    const updated = [...conditions]
    updated[index].params = { ...updated[index].params, [key]: value }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400 mb-4">
        Add conditions that must be met before the swap executes
      </div>

      {/* Existing Conditions */}
      {conditions.map((condition, index) => (
        <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase">{condition.type}</span>
              <span className="text-xs text-gray-600">•</span>
              <span className="text-xs text-gray-500">{condition.operator}</span>
            </div>
            <button
              onClick={() => removeCondition(index)}
              className="text-gray-500 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Condition-specific inputs */}
          {condition.type === "price" && (
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-gray-400">Token Pair</Label>
                <Input
                  value={condition.params.tokenPair || ""}
                  onChange={(e) => updateConditionParam(index, "tokenPair", e.target.value)}
                  placeholder="USDC/ETH"
                  className="bg-black border-gray-800 text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Target Price</Label>
                <Input
                  type="number"
                  value={condition.params.value || 0}
                  onChange={(e) => updateConditionParam(index, "value", parseFloat(e.target.value))}
                  className="bg-black border-gray-800 text-white text-sm"
                />
              </div>
              {condition.operator === "between" && (
                <div>
                  <Label className="text-xs text-gray-400">Max Price</Label>
                  <Input
                    type="number"
                    value={condition.params.max || 0}
                    onChange={(e) => updateConditionParam(index, "max", parseFloat(e.target.value))}
                    className="bg-black border-gray-800 text-white text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {condition.type === "time" && (
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-gray-400">Timestamp (ms)</Label>
                <Input
                  type="number"
                  value={condition.params.timestamp || Date.now()}
                  onChange={(e) => updateConditionParam(index, "timestamp", parseInt(e.target.value))}
                  className="bg-black border-gray-800 text-white text-sm"
                />
              </div>
            </div>
          )}

          {condition.type === "balance" && (
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-gray-400">Token Address</Label>
                <Input
                  value={condition.params.token || ""}
                  onChange={(e) => updateConditionParam(index, "token", e.target.value)}
                  placeholder="0x..."
                  className="bg-black border-gray-800 text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Chain ID</Label>
                <Input
                  type="number"
                  value={condition.params.chainId || 0}
                  onChange={(e) => updateConditionParam(index, "chainId", parseInt(e.target.value))}
                  className="bg-black border-gray-800 text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Minimum Balance</Label>
                <Input
                  type="number"
                  value={condition.params.value || "0"}
                  onChange={(e) => updateConditionParam(index, "value", e.target.value)}
                  className="bg-black border-gray-800 text-white text-sm"
                />
              </div>
            </div>
          )}

          {condition.type === "custom" && (
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-gray-400">Contract Address</Label>
                <Input
                  value={condition.params.contract || ""}
                  onChange={(e) => updateConditionParam(index, "contract", e.target.value)}
                  placeholder="0x..."
                  className="bg-black border-gray-800 text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Function Name</Label>
                <Input
                  value={condition.params.function || ""}
                  onChange={(e) => updateConditionParam(index, "function", e.target.value)}
                  className="bg-black border-gray-800 text-white text-sm"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add New Condition */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Label className="text-xs text-gray-400 mb-2 block">Condition Type</Label>
          <Select value={newConditionType} onValueChange={(v) => setNewConditionType(v as ConditionType)}>
            <SelectTrigger className="bg-black border-gray-800 text-white">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="time">Time</SelectItem>
              <SelectItem value="balance">Balance</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label className="text-xs text-gray-400 mb-2 block">Operator</Label>
          <Select
            value={newConditionOperator}
            onValueChange={(v) => setNewConditionOperator(v as ConditionOperator)}
          >
            <SelectTrigger className="bg-black border-gray-800 text-white">
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gt">Greater Than (&gt;)</SelectItem>
              <SelectItem value="lt">Less Than (&lt;)</SelectItem>
              <SelectItem value="eq">Equals (=)</SelectItem>
              <SelectItem value="gte">Greater or Equal (&gt;=)</SelectItem>
              <SelectItem value="lte">Less or Equal (&lt;=)</SelectItem>
              <SelectItem value="between">Between</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={addCondition}
          disabled={!newConditionType || !newConditionOperator}
          className="bg-orange-500 hover:bg-orange-600 text-black"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>
    </div>
  )
}

