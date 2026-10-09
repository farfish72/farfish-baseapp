"use client";
import { ReactNode, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, useReconnect } from "wagmi";
import { wagmiConfig } from "@/app/lib/wagmi";
import { BaseAppAuthProvider } from "@/app/contexts/BaseAppAuthContext";

function WalletReconnectHandler() {
  const { reconnect } = useReconnect();

  useEffect(() => {
    reconnect();
  }, [reconnect]);

  return null;
}

// Create query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Root Provider for Base App (2026)
 * 
 * Standard web app configuration:
 * - Wagmi for wallet connection and blockchain interactions
 * - TanStack Query for data fetching and caching
 * - BaseAppAuthProvider for wallet-first authentication
 * 
 * Multi-wallet support:
 * - Coinbase Wallet (Base App smart wallets)
 * - WalletConnect (Rainbow, Trust Wallet, etc.)
 * - Injected (MetaMask, Brave Wallet, browser extensions)
 * 
 * @see https://docs.base.org/apps/guides/migrate-to-standard-web-app
 */
export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletReconnectHandler />
        <BaseAppAuthProvider>
          {children}
        </BaseAppAuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
