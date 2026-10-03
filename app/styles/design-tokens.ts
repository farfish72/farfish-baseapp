/**
 * Design Tokens — Single Source of Truth
 * 
 * Exports all CSS variables from globals.css as TypeScript constants
 * for type-safe consumption in components.
 * 
 * @see app/globals.css for CSS variable definitions
 */

export const colors = {
  ink: '#0b0e11',
  surface: '#181a20',
  surfaceRaised: '#20232b',
  accent: '#f0b90b',
  text: '#f5f5f5',
  muted: '#848e9c',
  positive: '#0ecb81',
  mint: '#3be6c1',
  teal: '#00d4c4',
} as const;

export const spacing = {
  page: '1rem',
  section: '1.5rem',
  panel: '1rem',
} as const;

export const radius = {
  panel: '0.75rem',
  control: '0.5rem',
} as const;

export const typography = {
  fontDisplay: '"Trebuchet MS"',
  fontBody: '"Trebuchet MS"',
} as const;

export const shadows = {
  glow: '0 0 20px rgba(0, 212, 196, 0.3)',
  primary: '0 4px 14px 0 rgba(0, 212, 196, 0.39)',
  elevated: '0 10px 25px rgba(0, 0, 0, 0.15)',
} as const;
