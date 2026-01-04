import { Suspense } from "react";
import HomeClient from "./HomeClient";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-6">
            {/* Premium loading spinner */}
            <div className="relative">
              {/* Outer ring */}
              <div className="w-20 h-20 rounded-full border-4 border-white/8"></div>
              
              {/* Primary spinning ring */}
              <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-[#00d4c4] border-r-[#3be6c1]"></div>
              
              {/* Secondary counter-spinning ring */}
              <div className="absolute inset-2 w-16 h-16 rounded-full border-4 border-transparent border-t-[#00d4c4] border-l-[#3be6c1]"></div>
              
              {/* Inner pulsing core */}
              <div className="absolute inset-6 w-8 h-8 rounded-full bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] opacity-20"></div>
              
              {/* Central dot */}
              <div className="absolute inset-8 w-4 h-4 rounded-full bg-gradient-to-r from-[#00d4c4] to-[#3be6c1]"></div>
            </div>
            
            {/* Loading text */}
            <div className="text-center space-y-3">
              <div className="w-36 h-5 rounded-2xl loading-skeleton"></div>
              <div className="w-28 h-4 rounded-xl loading-skeleton"></div>
            </div>
            
            {/* Floating dots */}
            <div className="flex gap-3 mt-2">
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] rounded-full opacity-80"></div>
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] rounded-full opacity-80"></div>
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] rounded-full opacity-80"></div>
            </div>
          </div>
        </div>
      }
    >
      <HomeClient />
    </Suspense>
  );
}