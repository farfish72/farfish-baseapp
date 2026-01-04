"use client";

import { useState } from 'react';

/**
 * Theme Demo Page - Test the background color system
 * 
 * This page demonstrates how changing the background color affects the entire app
 * while keeping all other colors (text, buttons) fixed.
 */
export default function ThemeDemo() {
  const [currentTheme, setCurrentTheme] = useState('default');

  const themes = {
    default: "linear-gradient(180deg, #1C1C1E, #2C2C2E)",
    black: "linear-gradient(180deg, #000000, #1a1a1a)",
    blue: "linear-gradient(180deg, #0f0f23, #1a1a2e)",
    purple: "linear-gradient(180deg, #1a0f1a, #2e1a2e)",
    green: "linear-gradient(180deg, #0f1a0f, #1a2e1a)",
    solid: "#1C1C1E"
  };

  const applyTheme = (themeName: string) => {
    const themeValue = themes[themeName as keyof typeof themes];
    document.documentElement.style.setProperty('--app-background', themeValue);
    setCurrentTheme(themeName);
  };

  return (
    <div className="min-h-screen p-4 space-y-6">
      <div className="glass-card rounded-3xl p-6">
        <h1 className="text-2xl font-bold text-primary mb-4">
          🎨 Theme System Demo
        </h1>
        <p className="text-secondary mb-6">
          Test the background color system. Notice how only the background changes while text and buttons stay consistent.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {Object.keys(themes).map((themeName) => (
            <button
              key={themeName}
              onClick={() => applyTheme(themeName)}
              className={`
                p-3 rounded-xl border transition-all duration-200
                ${currentTheme === themeName 
                  ? 'bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] text-black border-white/30' 
                  : 'surface-info border text-primary hover:surface-badge'
                }
              `}
            >
              {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="surface-info border rounded-2xl p-4">
            <h3 className="text-primary font-semibold mb-2">Fixed Text Colors</h3>
            <div className="space-y-1">
              <p className="text-primary">Primary text (100% white)</p>
              <p className="text-secondary">Secondary text (85% white)</p>
              <p className="text-tertiary">Tertiary text (65% white)</p>
              <p className="text-quaternary">Quaternary text (45% white)</p>
            </div>
          </div>

          <div className="surface-info border rounded-2xl p-4">
            <h3 className="text-primary font-semibold mb-3">Fixed Button Colors</h3>
            <div className="space-y-3">
              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00d4c4] to-[#3be6c1] text-black font-semibold">
                Primary Button (Teal Gradient)
              </button>
              <button className="w-full py-3 rounded-xl surface-badge border text-primary font-semibold">
                Secondary Button
              </button>
            </div>
          </div>

          <div className="surface-info border rounded-2xl p-4">
            <h3 className="text-primary font-semibold mb-3">Surface Examples</h3>
            <div className="space-y-3">
              <div className="surface-badge border rounded-xl p-3">
                <p className="text-primary text-sm">Badge Surface (20% white bg)</p>
              </div>
              <div className="surface-info border rounded-xl p-3">
                <p className="text-primary text-sm">Info Surface (10% white bg)</p>
              </div>
              <div className="surface-subtle border rounded-xl p-3">
                <p className="text-primary text-sm">Subtle Surface (5% white bg)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6">
        <h2 className="text-xl font-bold text-primary mb-4">
          ✅ Theme System Rules
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-lg">✅</span>
            <p className="text-secondary">Only background color changes</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">✅</span>
            <p className="text-secondary">All text colors remain fixed (white/off-white)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">✅</span>
            <p className="text-secondary">All button colors remain fixed (teal gradient)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">✅</span>
            <p className="text-secondary">Spacing and contrast unchanged</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">✅</span>
            <p className="text-secondary">No functionality or layout changes</p>
          </div>
        </div>
      </div>
    </div>
  );
}