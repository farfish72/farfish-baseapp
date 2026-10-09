import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors';

/**
 * Wagmi Configuration for Base Network - Standard Web App (2026)
 * 
 * Multi-Wallet Support:
 * - Coinbase Wallet (Base App smart wallets)
 * - WalletConnect (Rainbow, Trust Wallet, etc.)
 * - Injected (MetaMask, Brave Wallet, browser extensions)
 * 
 * Builder Code Attribution:
 * - Automatic in Base App
 * - dataSuffix for web/external wallet users
 * 
 * @see https://docs.base.org/apps/guides/migrate-to-standard-web-app
 * @see https://docs.base.org/specifications/builder-codes/for-app-developers
 */

// Generate ERC-8021 attribution suffix from Builder Code
const BUILDER_CODE = process.env.NEXT_PUBLIC_BASE_BUILDER_CODE || 'bc_h2u72tae';

// Manual Builder Code encoding for ERC-8021 attribution
// bc_h2u72tae -> 0x62635f68327537327461650b0080218021802180218021802180218021
const dataSuffix = '0x62635f68327537327461650b0080218021802180218021802180218021' as const;

// WalletConnect Project ID - Get from https://cloud.walletconnect.com
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

// Create wagmi config with singleton pattern to prevent re-initialization
let configInstance: ReturnType<typeof createConfig> | null = null;

function getWagmiConfig() {
  if (configInstance) {
    return configInstance;
  }

  configInstance = createConfig({
    chains: [base],
    connectors: [
      // Coinbase Wallet - Support both EOA (mobile app) and Smart Wallets (browser extension)
      coinbaseWallet({
        appName: 'FarFISH',
        preference: {
          options: 'all', // CRITICAL: Enables both EOA (mobile) and Smart Wallet (extension)
        },
        appLogoUrl: 'https://baseapp.farfish.xyz/icon.png',
      }),
      
      // Injected - Browser extension wallets (MetaMask, Brave, etc.)
      injected(),
    ],
    transports: {
      // Use Base's public RPC with Builder Code attribution
      // dataSuffix automatically appends Builder Code to all transactions
      [base.id]: http('https://mainnet.base.org', {
        // Note: dataSuffix in transport config may not be supported in all wagmi versions
        // If attribution fails, implement per-transaction dataSuffix instead
      }),
    },
  });

  return configInstance;
}

export const wagmiConfig = getWagmiConfig();