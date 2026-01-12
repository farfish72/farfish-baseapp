"use client";
import { ReactNode } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/app/lib/wagmi";
import { BaseAuthProvider } from "@/app/contexts/BaseAuthContext";
import { ReferralHandler } from "@/app/components/ReferralHandler";
import "@coinbase/onchainkit/styles.css";

const queryClient = new QueryClient();

export function RootProvider({ children }: { children: ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;
  
  return (
    <WagmiProvider config={wagmiConfig}>
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
            <ReferralHandler />
            {children}
          </BaseAuthProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
