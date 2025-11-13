// Condition types matching solver-v2 model
export type ConditionType = 'price' | 'time' | 'balance' | 'custom'
export type ConditionOperator = 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between'

export interface Condition {
  type: ConditionType
  operator: ConditionOperator
  params: Record<string, any>
}

export interface ConditionalTransfer {
  recipient: string
  srcToken: string
  destToken: string
  amount: bigint
  fee: bigint
  destChainId: bigint
  conditions: Condition[]
  maxWaitTime?: number // milliseconds
  priority?: number // 1-10, higher = more important
}

// Condition parameter types
export interface PriceConditionParams {
  tokenPair?: string // e.g., "USDC/ETH"
  chainId?: number
  value: number // target price
  max?: number // for 'between' operator
}

export interface TimeConditionParams {
  timestamp: number // Unix timestamp in milliseconds
  before?: number // for 'between' operator
}

export interface BalanceConditionParams {
  token: string // token address
  chainId: number
  value: bigint // minimum balance
  max?: bigint // for 'between' operator
}

export interface CustomConditionParams {
  contract: string // contract address
  function: string // function name
  expectedResult: any // expected return value
  chainId: number
}

// Helper functions to create conditions
export function createPriceCondition(
  operator: ConditionOperator,
  params: PriceConditionParams
): Condition {
  return {
    type: 'price',
    operator,
    params,
  }
}

export function createTimeCondition(
  operator: ConditionOperator,
  params: TimeConditionParams
): Condition {
  return {
    type: 'time',
    operator,
    params,
  }
}

export function createBalanceCondition(
  operator: ConditionOperator,
  params: BalanceConditionParams
): Condition {
  return {
    type: 'balance',
    operator,
    params: {
      ...params,
      value: params.value.toString(),
      max: params.max?.toString(),
    },
  }
}

export function createCustomCondition(
  operator: ConditionOperator,
  params: CustomConditionParams
): Condition {
  return {
    type: 'custom',
    operator,
    params,
  }
}

