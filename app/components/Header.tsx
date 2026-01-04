"use client";

import { useEffect, useState } from "react";
import { detectFarcasterEnvironment } from "../utils/farcaster";

const pageIcons: Record<string, React.ReactElement> = {
  "Home": (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  ),
  "Chest": (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  "Stake": (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  ),
  "Steam": (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM8 18H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V8h2v2zm10 8h-8V8h8v10z"/>
    </svg>
  ),
  "Rank": (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 14H5v5h2v-5zm3-7H8v12h2V7zm3-4h-2v16h2V3zm3 6h-2v10h2V9zm3-2h-2v12h2V7z"/>
    </svg>
  ),
  "Profile": (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  ),
  "Game": (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21.58 16.09l-1.09-7.66C20.21 6.46 18.52 5 16.53 5H7.47C5.48 5 3.79 6.46 3.51 8.43l-1.09 7.66C2.2 17.63 3.39 19 4.94 19c.68 0 1.32-.27 1.8-.75L9 16h6l2.25 2.25c.48.48 1.12.75 1.8.75 1.56 0 2.75-1.37 2.53-2.91zM11 11H9v2H8v-2H6v-1h2V8h1v2h2v1zm4-0.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zm2 3c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5z"/>
    </svg>
  )
};

const pageGradients: Record<string, string> = {
  "Home": "primary",
  "Chest": "secondary", 
  "Stake": "success",
  "Steam": "primary",
  "Rank": "secondary",
  "Profile": "success",
  "Game": "primary"
};

const pageShadows: Record<string, string> = {
  "Home": "shadow-primary",
  "Chest": "shadow-secondary",
  "Stake": "shadow-success",
  "Steam": "shadow-primary",
  "Rank": "shadow-secondary",
  "Profile": "shadow-success",
  "Game": "shadow-primary"
};

export default function Header({ title }: { title: string }) {
  const [isFarcaster, setIsFarcaster] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side rendered
    setIsClient(true);
    
    try {
      setIsFarcaster(detectFarcasterEnvironment());
    } catch {
      setIsFarcaster(false);
    }
  }, []);

  const icon = pageIcons[title] || (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
  const colorClass = pageGradients[title] || "primary";
  const shadow = pageShadows[title] || "shadow-primary";

  return (
    <div className="w-full px-2 pt-3 pb-4 stable-layout">
      {/* Top section with app name - left aligned like premium apps */}
      <div className="flex items-start justify-start mb-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-display font-bold text-white mb-1">
            FarFISH
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] rounded-full"></div>
            </div>
            <span className="text-sm font-semibold text-white/80 tracking-wide">Live on Base</span>
          </div>
        </div>
      </div>

      {/* Enhanced positioning message */}
      <div className="mb-4">
        <div className="glass-card rounded-2xl p-2.5 border border-primary/15">
          <div className="relative z-10">
            <p className="text-sm font-semibold text-white text-center leading-relaxed mb-2">
              Daily on-chain habits for future rewards on Base
            </p>
            <div className="flex justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] rounded-full"></div>
                <div className="w-1 h-1 bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] rounded-full"></div>
                <div className="w-1 h-1 bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced page title with emoji and gradient */}
      <div className="flex items-center gap-3">
        <div className={`relative w-10 h-10 rounded-3xl bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] flex items-center justify-center ${shadow} transition-all duration-300 interactive-scale`}>
          <div className="text-black relative z-10 filter drop-shadow-lg">
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <h2 className={`text-2xl font-display font-bold text-white mb-1 leading-tight`}>
            {title}
          </h2>
          <p className="text-sm font-medium text-white/80 leading-relaxed">
            {title === "Home" && "Start your daily habit"}
            {title === "Chest" && "Claim daily rewards"}
            {title === "Stake" && "Lock & earn more"}
            {title === "Steam" && "Complete tasks to earn FRH"}
            {title === "Rank" && "See your progress"}
            {title === "Profile" && "Track your activity"}
            {title === "Game" && "Play & win"}
          </p>
        </div>
      </div>

      {/* Enhanced divider */}
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-border-primary to-transparent"></div>
    </div>
  );
}
