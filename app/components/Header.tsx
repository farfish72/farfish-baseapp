'use client';

import Image from 'next/image';
import { ArrowSquareOut } from '@phosphor-icons/react';
import { usePathname } from 'next/navigation';

// Page metadata mapping
const pageMetadata: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Overview', subtitle: 'Start your daily habit' },
  '/home': { title: 'Overview', subtitle: 'Start your daily habit' },
  '/chest': { title: 'Rewards', subtitle: 'Check in & collect' },
  '/stake': { title: 'Staking', subtitle: 'Lock NFTs, grow yield' },
  '/rank': { title: 'Leaderboard', subtitle: 'How you stack up' },
  '/profile': { title: 'Account', subtitle: 'Your identity & stats' },
};

interface HeaderProps {
  page?: string;
  title?: string;
  subtitle?: string;
}

export default function Header({ page, title, subtitle }: HeaderProps = {}) {
  const pathname = usePathname();
  
  // Use provided title/subtitle, or page key, or auto-detect from pathname
  const routeKey = page || pathname || '/';
  const metadata = pageMetadata[routeKey] || pageMetadata['/'];
  
  const displayTitle = title || metadata.title;
  const displaySubtitle = subtitle || metadata.subtitle;

  return (
    <header className="w-full border-b border-surface bg-surface pb-4 pt-6 rounded-xl" style={{ background: '#181a20', borderColor: '#181a20' }}>
      {/* First row: Logo and Follow button */}
      <div className="flex items-center justify-between px-4 mt-2">
        <Image 
          src="/farfish-logo-optimized.webp"
          alt="FarFISH"
          width={40}
          height={40}
          className="rounded-control object-cover"
        />
        
        <a
          href="https://farfish.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="app-control inline-flex items-center gap-1 border border-muted text-xs font-semibold text-white transition-colors hover:border-accent hover:text-accent"
        >
          Find us
          <ArrowSquareOut size={16} weight="bold" />
        </a>
      </div>

      {/* Second row: Title and subtitle */}
      <div className="mt-3 px-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white leading-tight">
          {displayTitle}
        </h2>
        {displaySubtitle && (
          <p className="mt-1.5 text-xs text-muted leading-relaxed">
            {displaySubtitle}
          </p>
        )}
      </div>
    </header>
  );
}