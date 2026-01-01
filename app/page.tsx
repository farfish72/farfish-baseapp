import type { Metadata } from "next";
import { Suspense } from "react";
import HomeClient from "./HomeClient";

/**
 * Base App SAFE METADATA
 * - No fc:*
 * - No frame
 * - No Farcaster reference
 * - Pure web + Base preview friendly
 */
export const metadata: Metadata = {
  title: "FarFISH – Earn On-Chain Rewards on Base",
  description:
    "Complete on-chain tasks, stake NFTs, and earn rewards on Base. Built for the Base ecosystem.",

  metadataBase: new URL("https://farfish-baseapp.vercel.app"),

  openGraph: {
    title: "FarFISH",
    description:
      "Complete tasks, stake NFTs, and earn rewards on Base.",
    url: "https://farfish-baseapp.vercel.app",
    siteName: "FarFISH",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FarFISH on Base",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "FarFISH",
    description:
      "Complete tasks, stake NFTs, and earn rewards on Base.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="w-40 h-10 rounded-xl bg-white/10 animate-pulse" />
        </div>
      }
    >
      <HomeClient />
    </Suspense>
  );
}