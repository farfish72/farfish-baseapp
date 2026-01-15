import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

/**
 * Wagmi Configuration with Pimlico Paymaster (Server-Side Proxy)
 * 
 * Pimlico provides gas sponsorship for transactions, improving UX by removing
 * gas fees from the user's perspective. Users only pay the NFT price.
 * 
 * Security: API key is kept server-side and requests are proxied through
 * /api/pimlico route for maximum security.
 * 
 * @see https://docs.pimlico.io/
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
    [base.id]: http('/api/pimlico'),
  },
});