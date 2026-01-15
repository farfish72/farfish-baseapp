import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

/**
 * Wagmi Configuration for Base Network
 * 
 * Uses Base's public RPC endpoint for read operations.
 * Pimlico paymaster is handled separately for gas sponsorship.
 * 
 * @see https://docs.base.org/
 */
export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: 'FarFISH',
      preference: 'smartWalletOnly',
    }),
  ],
  transports: {
    // Use Base's public RPC endpoint for all operations
    [base.id]: http('https://mainnet.base.org'),
  },
});