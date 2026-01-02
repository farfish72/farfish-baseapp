import { Suspense } from "react";
import HomeClient from "./HomeClient";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-6">
            {/* Enhanced premium loading spinner - ANIMATIONS DISABLED */}
            <div className="relative">
              {/* Outer ring */}
              <div className="w-20 h-20 rounded-full border-4 border-white/8 shadow-inner"></div>
              
              {/* Primary spinning ring - DISABLED */}
              <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-primary-400 border-r-primary-300 shadow-glow"></div>
              
              {/* Secondary counter-spinning ring - DISABLED */}
              <div className="absolute inset-2 w-16 h-16 rounded-full border-4 border-transparent border-t-accent-400 border-l-accent-300 shadow-glow-accent"></div>
              
              {/* Inner pulsing core - DISABLED */}
              <div className="absolute inset-6 w-8 h-8 rounded-full bg-gradient-to-br from-primary-400/40 to-accent-400/40 shadow-soft"></div>
              
              {/* Central dot - DISABLED */}
              <div className="absolute inset-8 w-4 h-4 rounded-full bg-gradient-to-br from-primary-300 to-accent-300 shadow-glow"></div>
            </div>
            
            {/* Enhanced loading text */}
            <div className="text-center space-y-3">
              <div className="w-36 h-5 rounded-2xl loading-skeleton"></div>
              <div className="w-28 h-4 rounded-xl loading-skeleton"></div>
            </div>
            
            {/* Enhanced floating dots - ANIMATIONS DISABLED */}
            <div className="flex gap-3 mt-2">
              <div className="w-2.5 h-2.5 bg-primary-400 rounded-full shadow-glow opacity-80"></div>
              <div className="w-2.5 h-2.5 bg-accent-400 rounded-full shadow-glow-accent opacity-80"></div>
              <div className="w-2.5 h-2.5 bg-blue-400 rounded-full shadow-soft opacity-80"></div>
            </div>
          </div>
        </div>
      }
    >
      <HomeClient />
    </Suspense>
  );
}