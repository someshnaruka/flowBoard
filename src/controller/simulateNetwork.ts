import { fail, ok, type Result } from '@/model/errors'

export type NetworkConfig = {
  /** Force the next request to fail, then clear. */
  failNext: boolean
}

export const defaultNetworkConfig = (): NetworkConfig => ({
  failNext: false,
})

/**
 * Simulated network gate used by every store mutation.
 * One-shot `failNext` forces NETWORK_ERROR on the next request.
 */
export async function simulateNetwork(
  config: NetworkConfig,
): Promise<Result<true>> {
  if (config.failNext) {
    return fail('NETWORK_ERROR', 'Simulated network failure')
  }

  return ok(true)
}
