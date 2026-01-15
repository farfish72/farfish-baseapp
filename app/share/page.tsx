import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

const ROOT_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

/**
 * Share page metadata with Base App frame support
 * Enables rich social sharing in Base App
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'FarFISH - Mint • Stake • Earn',
    description: 'Premium NFT collection built on Base. Mint your FarFISH, stake for rewards, and dominate the seas.',
    openGraph: {
      title: 'FarFISH - Mint • Stake • Earn',
      description: 'Premium NFT collection built on Base. Mint your FarFISH, stake for rewards, and dominate the seas.',
      images: [
        {
          url: `${ROOT_URL}/og-image-optimized.webp`,
          width: 1200,
          height: 630,
          alt: 'FarFISH - Premium NFT Collection',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'FarFISH - Mint • Stake • Earn',
      description: 'Premium NFT collection built on Base',
      images: [`${ROOT_URL}/og-image-optimized.webp`],
    },
    other: {
      // Base App frame metadata
      'base:frame': 'vNext',
      'base:frame:image': `${ROOT_URL}/og-image-optimized.webp`,
      'base:frame:image:aspect_ratio': '1.91:1',
      'base:frame:button:1': 'Launch FarFISH',
      'base:frame:button:1:action': 'link',
      'base:frame:button:1:target': ROOT_URL,
      
      // Mini app metadata
      'base:miniapp': JSON.stringify({
        version: '1',
        name: 'FarFISH',
        imageUrl: `${ROOT_URL}/og-image-optimized.webp`,
        button: {
          title: 'Launch FarFISH',
          action: {
            name: 'Launch FarFISH',
            type: 'launch_miniapp',
          },
        },
      }),
    },
  };
}

/**
 * Share page component
 * Displays shareable content and provides launch button
 */
export default function SharePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Share Card */}
        <div className="glass-card rounded-3xl overflow-hidden">
          {/* Hero Image */}
          <div className="relative w-full aspect-[1.91/1]">
            <Image
              src="/og-image-optimized.webp"
              alt="FarFISH - Premium NFT Collection"
              fill
              priority
              className="object-cover"
            />
          </div>
          
          {/* Content */}
          <div className="p-8">
            {/* Logo and Title */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                <Image
                  src="/icon-optimized.webp"
                  alt="FarFISH Logo"
                  width={48}
                  height={48}
                  className="rounded-xl"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">FarFISH</h1>
                <p className="text-white/70">Mint • Stake • Earn</p>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-white/90 text-lg mb-6">
              Premium NFT collection built on Base. Mint your FarFISH, stake for rewards, and dominate the seas.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-surface rounded-2xl p-4 text-center">
                <div className="text-3xl mb-2">🐟</div>
                <div className="text-white font-semibold">Mint NFTs</div>
                <div className="text-white/60 text-sm">4 rarities</div>
              </div>
              <div className="bg-surface rounded-2xl p-4 text-center">
                <div className="text-3xl mb-2">💎</div>
                <div className="text-white font-semibold">Stake & Earn</div>
                <div className="text-white/60 text-sm">Daily rewards</div>
              </div>
              <div className="bg-surface rounded-2xl p-4 text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-white font-semibold">Leaderboard</div>
                <div className="text-white/60 text-sm">Compete</div>
              </div>
            </div>
            
            {/* Launch Button */}
            <Link
              href="/"
              className="block w-full py-4 rounded-2xl bg-gradient-primary text-black font-bold text-lg text-center transition-all duration-300 hover:shadow-lg"
            >
              Launch FarFISH
            </Link>
            
            {/* Network Badge */}
            <div className="mt-6 text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 text-sm">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Built on Base
              </span>
            </div>
          </div>
        </div>
        
        {/* Share Instructions */}
        <div className="mt-6 text-center text-white/60 text-sm">
          <p>Share this link to invite others to FarFISH</p>
        </div>
      </div>
    </div>
  );
}
