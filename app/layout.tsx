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
          {/* Enhanced premium animated background elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Primary atmospheric orbs - ANIMATIONS DISABLED */}
            <div className="absolute -top-48 -right-48 w-[28rem] h-[28rem] bg-gradient-to-br from-primary-400/25 via-primary-500/20 to-primary-600/10 rounded-full blur-3xl opacity-80"></div>
            <div className="absolute -bottom-48 -left-48 w-[32rem] h-[32rem] bg-gradient-to-tr from-accent-400/25 via-accent-500/20 to-accent-600/10 rounded-full blur-3xl opacity-80"></div>
            <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/15 via-cyan-400/20 to-teal-400/10 rounded-full blur-3xl opacity-70"></div>
            
            {/* Secondary depth orbs - ANIMATIONS DISABLED */}
            <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-bl from-primary-300/15 via-primary-400/10 to-transparent rounded-full blur-2xl opacity-60"></div>
            <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-to-tl from-accent-300/15 via-accent-400/10 to-transparent rounded-full blur-2xl opacity-60"></div>
            <div className="absolute top-2/3 left-1/6 w-64 h-64 bg-gradient-to-r from-emerald-400/12 via-green-400/8 to-transparent rounded-full blur-2xl opacity-50"></div>
            
            {/* Tertiary accent elements - ANIMATIONS DISABLED */}
            <div className="absolute top-1/6 right-1/6 w-48 h-48 bg-gradient-to-br from-pink-400/10 via-rose-400/8 to-transparent rounded-full blur-xl opacity-40"></div>
            <div className="absolute bottom-1/6 left-1/3 w-56 h-56 bg-gradient-to-tl from-indigo-400/12 via-purple-400/8 to-transparent rounded-full blur-xl opacity-45"></div>
            
            {/* Enhanced floating particles - ANIMATIONS DISABLED */}
            <div className="absolute top-20 left-20 w-3 h-3 bg-primary-400 rounded-full opacity-70 shadow-glow"></div>
            <div className="absolute top-40 right-32 w-2 h-2 bg-accent-400 rounded-full opacity-50 shadow-glow-accent"></div>
            <div className="absolute bottom-32 left-16 w-2.5 h-2.5 bg-blue-400 rounded-full opacity-60 shadow-soft"></div>
            <div className="absolute bottom-20 right-20 w-1.5 h-1.5 bg-primary-300 rounded-full opacity-40"></div>
            <div className="absolute top-3/4 left-1/2 w-2 h-2 bg-emerald-400 rounded-full opacity-50"></div>
            <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-pink-400 rounded-full opacity-35"></div>
            
            {/* Morphing background shapes - ANIMATIONS DISABLED */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary-500/5 via-accent-500/8 to-blue-500/5 opacity-30"></div>
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