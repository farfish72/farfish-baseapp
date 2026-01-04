#!/usr/bin/env node

/**
 * Theme Changer Script
 * 
 * Usage: node scripts/change-theme.js [theme-name]
 * 
 * Available themes:
 * - default: Default dark theme
 * - black: Pure black theme
 * - blue: Deep blue theme
 * - purple: Deep purple theme
 * - green: Deep green theme
 * - solid: Solid color theme
 */

const fs = require('fs');
const path = require('path');

const themes = {
  default: 'linear-gradient(180deg, #1C1C1E, #2C2C2E)',
  black: 'linear-gradient(180deg, #000000, #1a1a1a)',
  blue: 'linear-gradient(180deg, #0f0f23, #1a1a2e)',
  purple: 'linear-gradient(180deg, #1a0f1a, #2e1a2e)',
  green: 'linear-gradient(180deg, #0f1a0f, #1a2e1a)',
  solid: '#1C1C1E'
};

const themeName = process.argv[2];

if (!themeName) {
  console.log('Usage: node scripts/change-theme.js [theme-name]');
  console.log('\nAvailable themes:');
  Object.keys(themes).forEach(name => {
    console.log(`  - ${name}: ${themes[name]}`);
  });
  process.exit(1);
}

if (!themes[themeName]) {
  console.error(`Error: Theme "${themeName}" not found.`);
  console.log('\nAvailable themes:', Object.keys(themes).join(', '));
  process.exit(1);
}

const configPath = path.join(__dirname, '../app/theme.config.js');
const themeValue = themes[themeName];

try {
  const configContent = `/**
 * GLOBAL THEME CONFIGURATION
 * 
 * This is the ONLY file where you can change the app's background color.
 * All other colors (text, buttons, borders) are fixed based on HomeClient.tsx reference.
 * 
 * USAGE:
 * 1. Change the BACKGROUND_COLOR value below
 * 2. The entire app background will update automatically
 * 3. All text, buttons, and UI elements remain unchanged
 */

// GLOBAL BACKGROUND CONTROL - Change this to update entire app
export const BACKGROUND_COLOR = "${themeValue}";

// ALTERNATIVE BACKGROUND OPTIONS (uncomment one to use):
// export const BACKGROUND_COLOR = "linear-gradient(180deg, #000000, #1a1a1a)"; // Pure black
// export const BACKGROUND_COLOR = "linear-gradient(180deg, #0f0f23, #1a1a2e)"; // Deep blue
// export const BACKGROUND_COLOR = "linear-gradient(180deg, #1a0f1a, #2e1a2e)"; // Deep purple
// export const BACKGROUND_COLOR = "linear-gradient(180deg, #0f1a0f, #1a2e1a)"; // Deep green
// export const BACKGROUND_COLOR = "#1C1C1E"; // Solid color

/**
 * FIXED COLORS - DO NOT MODIFY
 * These are based on HomeClient.tsx and cannot be changed
 */
export const FIXED_COLORS = {
  // Button colors (from HomeClient.tsx)
  BUTTON_GRADIENT: "linear-gradient(to right, #00d4c4, #3be6c1)",
  BUTTON_TEXT: "#000000",
  BUTTON_HOVER: "#00b8a9",
  
  // Text colors (from HomeClient.tsx)
  TEXT_PRIMARY: "#FFFFFF",
  TEXT_SECONDARY: "rgba(255, 255, 255, 0.85)",
  TEXT_TERTIARY: "rgba(255, 255, 255, 0.65)",
  TEXT_QUATERNARY: "rgba(255, 255, 255, 0.45)",
  
  // Glass and surface colors (derived from HomeClient.tsx)
  GLASS_BG: "rgba(44, 44, 46, 0.8)",
  GLASS_BORDER: "rgba(255, 255, 255, 0.1)",
  
  // Border colors (from HomeClient.tsx)
  BORDER_PRIMARY: "rgba(255, 255, 255, 0.12)",
  BORDER_SECONDARY: "rgba(255, 255, 255, 0.08)",
};`;

  fs.writeFileSync(configPath, configContent);
  console.log(`✅ Theme changed to "${themeName}"`);
  console.log(`   Background: ${themeValue}`);
  console.log('\n🔄 Restart your development server to see changes.');
  
} catch (error) {
  console.error('Error updating theme config:', error.message);
  process.exit(1);
}