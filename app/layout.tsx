import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";

import BottomNav from "./components/BottomNav";
import FarcasterMiniAppReady from "./components/FarcasterMiniAppReady";
import FarcasterWalletProvider from "./providers/FarcasterWalletProvider";
import AutoBindReferral from "./components/AutoBindReferral";
import ErrorBoundary from "./components/MinimalErrorBoundary";
import ToastProvider from "./providers/ToastProvider";

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
        <ErrorBoundary>
          {/* Premium atmospheric elements - simplified */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Primary accent orb */}
            <div className="absolute -top-48 -right-48 w-[28rem] h-[28rem] bg-primary/10 rounded-full blur-3xl opacity-60"></div>
            
            {/* Secondary accent orb */}
            <div className="absolute -bottom-48 -left-48 w-[32rem] h-[32rem] bg-secondary/8 rounded-full blur-3xl opacity-50"></div>
            
            {/* Success accent orb */}
            <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-success/6 rounded-full blur-3xl opacity-40"></div>
            
            {/* Subtle floating particles */}
            <div className="absolute top-20 left-20 w-2 h-2 bg-primary rounded-full opacity-30"></div>
            <div className="absolute top-40 right-32 w-1.5 h-1.5 bg-secondary rounded-full opacity-25"></div>
            <div className="absolute bottom-32 left-16 w-2 h-2 bg-success rounded-full opacity-20"></div>
            <div className="absolute bottom-20 right-20 w-1 h-1 bg-primary rounded-full opacity-15"></div>
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
      </body>
    </html>
  );
}