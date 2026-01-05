import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";

import BottomNav from "./components/BottomNav";
import FarcasterMiniAppReady from "./components/FarcasterMiniAppReady";
import FarcasterWalletProvider from "./providers/FarcasterWalletProvider";
import AutoBindReferral from "./components/AutoBindReferral";
import ErrorBoundary from "./components/MinimalErrorBoundary";
import ToastProvider from "./providers/ToastProvider";
import ThemeProvider from "./components/ThemeProvider";

export const metadata: Metadata = {
  title: "FarFISH – Mint & Rewards",
  description: "Mint. Stake. Earn. Dominate the Seas.",

  openGraph: {
    title: "FarFISH",
    description: "Mint. Stake. Earn. Dominate the Seas.",
    type: "website",
    url: "https://farfish-baseapp.vercel.app",
    images: ["https://farfish-baseapp.vercel.app/og-image.png"],
  },

  twitter: {
    card: "summary_large_image",
    title: "FarFISH",
    description: "Mint. Stake. Earn. Dominate the Seas.",
    images: ["https://farfish-baseapp.vercel.app/og-image.png"],
  },

  other: {
    "base:app_id": "694e9098c63ad876c908143e",
    
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://farfish-baseapp.vercel.app/og-image.png",
      button: {
        title: "Open FarFISH",
        action: {
          type: "launch_miniapp",
          url: "https://farfish-baseapp.vercel.app",
          name: "FarFISH",
          splashImageUrl: "https://farfish-baseapp.vercel.app/splash.png",
          splashBackgroundColor: "#000000"
        }
      }
    }),

    "fc:frame": JSON.stringify({
      version: "1",
      imageUrl: "https://farfish-baseapp.vercel.app/og-image.png",
      button: {
        title: "Open FarFISH",
        action: {
          type: "launch_frame",
          url: "https://farfish-baseapp.vercel.app",
          name: "FarFISH",
          splashImageUrl: "https://farfish-baseapp.vercel.app/splash.png",
          splashBackgroundColor: "#000000"
        }
      }
    })
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col relative items-center overflow-x-hidden text-white">
        <ThemeProvider>
          <ErrorBoundary>
          {/* Premium atmospheric elements - minimal and clean */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Primary accent orb - reduced opacity */}
            <div className="absolute -top-48 -right-48 w-[24rem] h-[24rem] bg-primary/5 rounded-full blur-3xl opacity-40"></div>
            
            {/* Secondary accent orb - reduced opacity */}
            <div className="absolute -bottom-48 -left-48 w-[28rem] h-[28rem] bg-primary/3 rounded-full blur-3xl opacity-30"></div>
            
            {/* Subtle floating elements - minimal */}
            <div className="absolute top-20 left-20 w-1 h-1 bg-primary/20 rounded-full"></div>
            <div className="absolute bottom-32 right-16 w-1 h-1 bg-primary/15 rounded-full"></div>
          </div>

          <FarcasterMiniAppReady />
          <FarcasterWalletProvider>
            <ToastProvider>
              <AutoBindReferral />

              {/* FIXED: Stable content wrapper with consistent dimensions */}
              <div className="w-full max-w-md min-h-screen flex flex-col relative z-10">
                <main
                  className="flex-1 px-4 flex flex-col min-h-0 overflow-y-auto"
                  style={{
                    paddingTop: "env(safe-area-inset-top, 0px)",
                    paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 5rem)",
                  }}
                >
                  {/* FIXED: Prevent layout shift during async loading */}
                  <div className="min-h-0 flex-1 flex flex-col">
                    {children}
                  </div>
                </main>
              </div>

              <BottomNav />
            </ToastProvider>
          </FarcasterWalletProvider>
        </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}