"use client";

import { Fish, Diamond, Trophy } from '@phosphor-icons/react';

export default function ShareFeatures() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-surface rounded-2xl p-4 text-center">
        <div className="flex justify-center mb-2">
          <Fish size={32} weight="duotone" color="#ffffff" />
        </div>
        <div className="text-white font-semibold">Mint Premium Pass</div>
        <div className="text-white/60 text-sm">4 rarities</div>
      </div>
      <div className="bg-surface rounded-2xl p-4 text-center">
        <div className="flex justify-center mb-2">
          <Diamond size={32} weight="duotone" color="#ffffff" />
        </div>
        <div className="text-white font-semibold">Stake & Earn</div>
        <div className="text-white/60 text-sm">Daily rewards</div>
      </div>
      <div className="bg-surface rounded-2xl p-4 text-center">
        <div className="flex justify-center mb-2">
          <Trophy size={32} weight="duotone" color="#ffffff" />
        </div>
        <div className="text-white font-semibold">Leaderboard</div>
        <div className="text-white/60 text-sm">Compete</div>
      </div>
    </div>
  );
}
