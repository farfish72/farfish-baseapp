import type { Metadata, Viewport } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { RootProvider } from "./rootProvider";
import Header from "./components/Header";
import "./globals.css";

/**
 * Root Layout for Standalone Base App (2026)
 * 
 * Standard web app configuration:
 * - No SafeArea wrapper (Farcaster-specific)
 * - No fc:miniapp metadata
 * - Standard OpenGraph and viewport settings
 * - Works in any web browser
 * 
 * @see https://docs.base.org/apps/guides/migrate-to-standard-web-app
 */

const APP_NAME = "FarFISH";
const APP_DESCRIPTION = "Mint. Stake. Earn. Dominate the Seas. Premium NFT collection built on Base. NFT Staking • Leaderboard • Monthly Rewards.";
const APP_URL = process.env.NEXT_PUBLIC_URL || "https://baseapp.farfish.xyz";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - Mint, Stake, Earn on Base`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  
  keywords: [
    "NFT",
    "Base",
    "staking",
    "rewards",
    "onchain",
    "crypto",
    "web3",
    "blockchain",
    "ethereum",
    "L2",
  ],
  
  authors: [
    {
      name: APP_NAME,
      url: APP_URL,
    },
  ],
  
  creator: APP_NAME,
  publisher: APP_NAME,
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} - Mint, Stake, Earn on Base`,
    description: APP_DESCRIPTION,
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${APP_NAME} - Premium NFT Collection on Base`,
        type: "image/png",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} - Mint, Stake, Earn on Base`,
    description: APP_DESCRIPTION,
    images: [`${APP_URL}/og-image.png`],
    creator: "@FarFISH",
  },
  
  manifest: "/manifest.json",
  
  icons: {
    icon: [
      { url: "/icon.png", sizes: "any" },
    ],
    apple: [
      { url: "/icon.png" },
    ],
  },
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sourceCodePro.variable}`}>
        <RootProvider>
          <div className="w-full max-w-md min-h-screen flex flex-col relative z-10 mx-auto px-4 pt-0">
            <Header />
            <main 
              className="w-full"
              style={{
                paddingTop: '0',
                paddingBottom: '0'
              }}
            >
              {children}
            </main>
          </div>
        </RootProvider>
      </body>
    </html>
  );
}
