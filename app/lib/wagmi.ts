import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: 'FarFISH',
      preference: 'smartWalletOnly',
    }),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
});