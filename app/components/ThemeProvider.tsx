"use client";

import { useEffect } from 'react';
import { BACKGROUND_COLOR } from '../theme.config';

/**
 * ThemeProvider - Applies global background color from theme.config.js
 * 
 * This component injects the background color into CSS custom properties.
 * All other colors remain fixed based on HomeClient.tsx reference.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply the global background color to CSS custom property
    document.documentElement.style.setProperty('--app-background', BACKGROUND_COLOR);
  }, []);

  return <>{children}</>;
}