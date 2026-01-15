"use client";

/**
 * Loading Skeleton Component
 * 
 * Provides visual feedback while data is loading.
 * Improves perceived performance and user experience.
 */
export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface border border-white/30 rounded-2xl p-4">
            <div className="h-8 bg-white/10 rounded mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-16 mx-auto"></div>
          </div>
        ))}
      </div>

      {/* Progress Bar Skeleton */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <div className="h-4 bg-white/10 rounded w-24"></div>
          <div className="h-4 bg-white/10 rounded w-12"></div>
        </div>
        <div className="w-full bg-surface rounded-full h-3">
          <div className="h-full bg-gradient-primary rounded-full w-1/2 animate-pulse"></div>
        </div>
      </div>

      {/* Button Skeleton */}
      <div className="h-14 bg-white/10 rounded-2xl mb-4"></div>
      
      {/* Text Skeleton */}
      <div className="text-center space-y-2">
        <div className="h-3 bg-white/10 rounded w-48 mx-auto"></div>
        <div className="h-3 bg-white/10 rounded w-40 mx-auto"></div>
      </div>
    </div>
  );
}
