import { fail, ok, type Result } from '@/model/errors'

export type NetworkConfig = {
  latencyMs: number
  /** Probability 0–1 of a random NETWORK_ERROR after latency. */
  failureRate: number
  /** Force the next request to fail, then clear. */
  failNext: boolean
}

export const defaultNetworkConfig = (): NetworkConfig => ({
  latencyMs: 0,
  failureRate: 0,
  failNext: false,
})

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Simulated network gate used by every store mutation.
 * Pure aside from awaiting latency and reading Math.random for failureRate.
 */
export async function simulateNetwork(
  config: NetworkConfig,
): Promise<Result<true>> {
  if (config.latencyMs > 0) {
    await delay(config.latencyMs)
  }

  if (config.failNext) {
    return fail('NETWORK_ERROR', 'Simulated network failure')
  }

  if (config.failureRate > 0 && Math.random() < config.failureRate) {
    return fail('NETWORK_ERROR', 'Simulated network failure')
  }

  return ok(true)
}
