"use client";

import { useEffect, useState } from 'react';

interface StableWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * StableWrapper prevents hydration mismatches by ensuring
 * client-side only content renders after hydration completes
 */
export default function StableWrapper({ children, fallback }: StableWrapperProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after first client-side render
    setIsHydrated(true);
  }, []);

  // During SSR and initial hydration, show fallback or nothing
  if (!isHydrated) {
    return fallback ? <>{fallback}</> : null;
  }

  // After hydration, show actual content
  return <div className="stable-content">{children}</div>;
}