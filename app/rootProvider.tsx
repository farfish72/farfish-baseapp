"use client";
import { ReactNode, useEffect, useState } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/app/lib/wagmi";
import { BaseAuthProvider } from "@/app/contexts/BaseAuthContext";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { sdk } from "@farcaster/miniapp-sdk";
import "@coinbase/onchainkit/styles.css";

function MiniAppReadyHandler() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();

  useEffect(() => {
    try {
      if (!isMiniAppReady && typeof setMiniAppReady === "function") {
        setMiniAppReady();
      }
    } catch (e) {
      // safe fallback
    }

    try {
      if (typeof sdk !== "undefined" && sdk?.actions && typeof sdk.actions.ready === "function") {
        sdk.actions.ready();
      }
    } catch (e) {
      // safe fallback
    }
  }, [isMiniAppReady, setMiniAppReady]);

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

export function RootProvider({ children }: { children: ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;
  
  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
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
            <MiniAppReadyHandler />
            {children}
          </BaseAuthProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
