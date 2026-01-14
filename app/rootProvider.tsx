"use client";
import { ReactNode, useEffect, useState } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, useAccount, useConnect } from "wagmi";
import { wagmiConfig } from "@/app/lib/wagmi";
import { BaseAuthProvider } from "@/app/contexts/BaseAuthContext";
import { ReferralHandler } from "@/app/components/ReferralHandler";
import "@coinbase/onchainkit/styles.css";

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

// Loading screen component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );
}

// Auto-connect component that runs inside WagmiProvider
function AutoConnectWallet() {
  const { isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const [hasAttemptedConnect, setHasAttemptedConnect] = useState(false);

  useEffect(() => {
    // Only attempt auto-connect once when app loads
    if (!isConnected && !isConnecting && !hasAttemptedConnect && connectors.length > 0) {
      const coinbaseConnector = connectors.find(
        connector => connector.id === 'coinbaseWalletSDK'
      );
      
      if (coinbaseConnector) {
        setHasAttemptedConnect(true);
        // Connect immediately when app opens
        connect({ connector: coinbaseConnector });
      }
    }
  }, [isConnected, isConnecting, connect, connectors, hasAttemptedConnect]);

  return null;
}

export function RootProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering wagmi until mounted
  if (!mounted) {
    return <LoadingScreen />;
  }
  
  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={apiKey || undefined}
          chain={base}
          config={{
            appearance: {
              mode: "auto",
            },
            wallet: {
              display: "modal",
              preference: "all",
            },
          }}
          miniKit={{
            enabled: true,
          }}
        >
          <BaseAuthProvider>
            <AutoConnectWallet />
            <ReferralHandler />
            {children}
          </BaseAuthProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
