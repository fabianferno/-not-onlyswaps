// Solver configuration types matching config.ts
export interface NetworkConfig {
  chain_id: number
  rpc_url: string
  tokens: string[]
  router_address: string
  tx_gas_buffer?: number
  tx_gas_price_buffer?: number
}

export interface AgentConfig {
  healthcheck_listen_addr: string
  healthcheck_port: number
  log_level?: string
  log_json?: boolean
}

export interface SolverConfig {
  id?: string // Generated ID for the solver instance
  name: string // User-friendly name
  agent: AgentConfig
  networks: NetworkConfig[]
  useV2?: boolean // Use SolverV2 (default: true)
  maxRisk?: number // 0-1, maximum acceptable risk (default: 0.5)
  minSolverFee?: bigint // Minimum solver fee to accept
  enabled?: boolean // Is solver currently running
  createdAt?: number // Timestamp
  startedAt?: number // When solver was started
}

export interface SolverInstance {
  id: string
  config: SolverConfig
  status: 'running' | 'stopped' | 'error'
  stats?: {
    tradesExecuted: number
    totalVolume: bigint
    averageRisk: number
    uptime: number // seconds
  }
}

// Default config values
export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  healthcheck_listen_addr: '0.0.0.0',
  healthcheck_port: 8081,
  log_level: 'info',
  log_json: false,
}

export const DEFAULT_SOLVER_CONFIG: Partial<SolverConfig> = {
  useV2: true,
  maxRisk: 0.5,
  minSolverFee: BigInt('10000000000000000'), // 0.01 tokens
  enabled: false,
}

