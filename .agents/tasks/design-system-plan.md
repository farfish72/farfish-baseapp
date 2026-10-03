# Implementation Plan: Centralized Design System

This plan creates a single source of truth for all UI styles in the FarFISH Next.js mini-app, with a focus on the teal/mint border button style identified in the user's requirements.

## Context & Findings

**Project Type:** Next.js 16 app with TypeScript, Tailwind CSS v4, and custom CSS variables  
**Build Command:** `npm run build`  
**Lint Command:** `npm run lint`  
**Test Framework:** None detected (manual testing via dev server)  
**Dev Server:** `npm run dev` (runs on http://localhost:3000)

**Current State:**
- CSS variables defined in `app/globals.css` with mini-app color system
- Inline button styling throughout components with inconsistent patterns
- Generic `button` hover effects in globals.css that conflict with component-specific needs
- No centralized design token exports for TypeScript consumption
- Button patterns identified:
  - **Teal border style** (user requirement): `bg-surface (#181a20)` with `border-2 border-teal (#00d4c4)` - most common
  - Primary gradient style: `bg-teal` or `bg-gradient-primary`
  - Secondary style: `bg-surface` with `border-muted`
  - Danger style: `bg-red-500` with `border-red-500`
  - Ghost style: minimal background, text-only

**Verification Strategy:**
Since no test framework exists, verification will be:
1. TypeScript compilation via `npm run build` (ensures type safety)
2. ESLint via `npm run lint` (ensures code quality)
3. Visual inspection via `npm run dev` (ensures UI correctness)

---

## Implementation Steps

- [ ] 1. **Create design tokens TypeScript file at `app/styles/design-tokens.ts`**
   
   Export all CSS variables from `globals.css` as TypeScript constants for type-safe consumption in components. Include colors (with RGB variants), spacing, radius, typography, and specific button style presets.
   
   **Key exports:**
   - Color constants: `COLORS` object with ink, surface, surfaceRaised, accent, teal, mint, positive, muted, text
   - RGB constants: `COLORS_RGB` object matching the CSS RGB tokens
   - Spacing: `SPACING` object with page, section, panel values
   - Radius: `RADIUS` object with panel, control values
   - Typography: `TYPOGRAPHY` object with display and body font families
   - Button style preset: `BUTTON_STYLES.outline` = `{ bg: COLORS.surface, border: COLORS.teal, borderWidth: '2px' }`
   
   **Files:** `app/styles/design-tokens.ts` (new file)
   
   **Verify:** Run `npm run build` to confirm TypeScript compiles without errors. No runtime changes yet.

- [ ] 2. **Create reusable Button component at `app/components/ui/Button.tsx`**
   
   Build a flexible Button component that consolidates all button patterns found in the codebase. The default variant must be 'outline' (bg-surface #181a20, border-2 border-teal #00d4c4) per user requirements.
   
   **Component API:**
   ```typescript
   interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
     variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
     size?: 'sm' | 'md' | 'lg';
     loading?: boolean;
     animated?: boolean; // Controls hover translateY effect
     children: React.ReactNode;
   }
   ```
   
   **Variant styles:**
   - `outline` (default): `bg-surface border-2 border-teal text-white rounded-xl` with hover states
   - `primary`: `bg-teal border-2 border-teal text-black rounded-xl` with brightness hover
   - `secondary`: `bg-surface-raised border-2 border-muted text-white rounded-xl`
   - `danger`: `bg-red-500 border-2 border-red-500 text-white rounded-xl`
   - `ghost`: no background, no border, `text-white/70`
   
   **Size styles:**
   - `sm`: `py-2 px-3 text-xs`
   - `md`: `py-3 px-4 text-sm` (default)
   - `lg`: `py-4 px-6 text-base`
   
   **Features:**
   - Loading state with spinner (reuse `.premium-spinner` from globals.css)
   - Disabled state with `opacity-50 cursor-not-allowed`
   - Focus ring: `focus:outline-2 focus:outline-teal focus:outline-offset-2`
   - Animated prop: when true, adds `hover:transform hover:-translate-y-0.5` effect
   - aria-disabled support for accessibility
   
   **Files:** `app/components/ui/Button.tsx` (new file)
   
   **Verify:** Run `npm run build` and `npm run lint`. Start dev server and test Button with different variants in isolation (create a test page if needed, or verify in browser console that component renders).

- [ ] 3. **Update `app/globals.css` to scope generic button styles and add design token comment**
   
   Remove or tightly scope the generic `button { }` and `button:hover:not(:disabled) { }` rules since the Button component will now own button styling. Add a comment at the top of CSS variables pointing to the TypeScript exports.
   
   **Changes:**
   - Add comment above `:root` block: `/* Design tokens are also exported as TypeScript constants in app/styles/design-tokens.ts */`
   - Comment out or remove lines containing:
     ```css
     button {
       cursor: pointer;
       border: none;
       outline: none;
       transition: all 0.3s ease;
     }
     
     button:hover:not(:disabled) {
       transform: translateY(-1px);
       box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
     }
     ```
   - Keep all CSS variables, utility classes, and component-specific classes intact
   
   **Files:** `app/globals.css`
   
   **Verify:** Run `npm run build` to ensure no CSS errors. Visually inspect that existing buttons still render (they may lose the global hover effect, which is expected and will be restored via Button component).

- [ ] 4. **Create documentation file at `app/components/ui/README.md`**
   
   Document the design system usage, Button component API, and migration guide for developers.
   
   **Sections:**
   1. **Design Tokens** - How to import and use `app/styles/design-tokens.ts`
   2. **Button Component** - Variant/size table with code examples
   3. **Migration Guide** - Step-by-step instructions to replace raw `<button>` with `<Button>`
   4. **Accessibility** - Focus management, aria attributes, keyboard navigation
   5. **Examples** - Common button patterns (submit forms, modal actions, navigation)
   
   **Files:** `app/components/ui/README.md` (new file)
   
   **Verify:** Read the file to ensure clarity. No build step required.

- [ ] 5. **Migrate StakeModal.tsx buttons to use Button component**
   
   Replace all `<button>` elements in `app/components/StakeModal.tsx` with the new `<Button>` component.
   
   **Button mapping:**
   - Close button (✕): `<Button variant="outline" size="sm" className="w-8 h-8">✕</Button>`
   - Category selection buttons (BlueFin, GoldRay, etc.): `<Button variant={selectedCategory === category ? 'primary' : 'outline'} disabled={isPending || isResolvingTokenId}>{category}</Button>`
   - Lock duration buttons: `<Button variant={selectedDuration === duration ? 'primary' : 'outline'} disabled={isPending}>{duration} days</Button>`
   - Cancel button: `<Button variant="secondary" disabled={isPending} className="flex-1">Cancel</Button>`
   - Stake button: `<Button variant="primary" disabled={!canStake || isPending} className="flex-1">{buttonText}</Button>`
   
   **Files:** `app/components/StakeModal.tsx`
   
   **Verify:** Run `npm run build` and `npm run lint`. Start dev server, open stake modal, confirm all buttons render with correct teal borders and behavior. Test button states (disabled, loading, hover).

- [ ] 6. **Migrate UnstakeModal.tsx buttons to use Button component**
   
   Replace all `<button>` elements in `app/components/UnstakeModal.tsx` with the new `<Button>` component.
   
   **Button mapping:**
   - Stake position selection buttons: `<Button variant={isSelected ? 'primary' : 'outline'} disabled={isPending} className="w-full">Stake #{stakeId}</Button>`
   - Cancel button: `<Button variant="secondary" disabled={isPending} className="flex-1">Cancel</Button>`
   - Unstake button: `<Button variant="danger" disabled={!isButtonEnabled} className="flex-1">{isPending ? 'Unstaking...' : 'Unstake NFT'}</Button>`
   
   **Files:** `app/components/UnstakeModal.tsx`
   
   **Verify:** Run `npm run build` and `npm run lint`. Start dev server, open unstake modal, confirm all buttons render correctly. Test selection states and unstake flow.

- [ ] 7. **Migrate OnboardingModal.tsx buttons to use Button component**
   
   Replace all `<button>` elements in `app/components/OnboardingModal.tsx` with the new `<Button>` component.
   
   **Button mapping:**
   - Skip button: `<Button variant="secondary" className="flex-1">Skip Tutorial</Button>`
   - Next/Get Started button: `<Button variant="primary" className="flex-1">{isLastStep ? 'Get Started' : 'Continue'}</Button>`
   
   **Files:** `app/components/OnboardingModal.tsx`
   
   **Verify:** Run `npm run build` and `npm run lint`. Start dev server, trigger onboarding modal, test navigation through steps with consistent button styling.

- [ ] 8. **Migrate WalletConnection.tsx button to use Button component**
   
   Replace the connect/disconnect buttons in `app/components/WalletConnection.tsx` with the new `<Button>` component.
   
   **Button mapping:**
   - Connect button: `<Button variant="outline" size="sm">Connect Your Wallet</Button>`
   - Disconnect button: `<Button variant="danger" size="sm">Disconnect Your Wallet</Button>`
   
   **Files:** `app/components/WalletConnection.tsx`
   
   **Verify:** Run `npm run build` and `npm run lint`. Start dev server, test wallet connection flow with new button styles.

- [ ] 9. **Migrate ShareButton.tsx buttons to use Button component**
   
   Replace all `<button>` elements in `app/components/ShareButton.tsx` with the new `<Button>` component. Maintain variant prop logic.
   
   **Button mapping:**
   - Icon variant: `<Button variant="primary" size="sm" className="p-2"><ShareNetwork /></Button>`
   - Secondary variant: `<Button variant="primary" size="md"><ShareNetwork /> {text}</Button>`
   - Primary variant: `<Button variant="primary" size="lg"><ShareNetwork /> {text}</Button>`
   
   **Files:** `app/components/ShareButton.tsx`
   
   **Verify:** Run `npm run build` and `npm run lint`. Start dev server, test share functionality across all three variants.

- [ ] 10. **Migrate ChestCard.tsx buttons to use Button component**
   
   Replace all `<button>` elements in `app/components/ChestCard.tsx` with the new `<Button>` component.
   
   **Button mapping:**
   - Primary action button: `<Button variant={actionDisabled ? 'secondary' : 'outline'} disabled={actionDisabled || isLoading} loading={isLoading} className="w-full">{actionLabel}</Button>`
   - Secondary action button: `<Button variant="secondary" disabled={secondaryActionDisabled || secondaryLoading} loading={secondaryLoading} className="w-full">{secondaryActionLabel}</Button>`
   
   **Files:** `app/components/ChestCard.tsx`
   
   **Verify:** Run `npm run build` and `npm run lint`. Start dev server, navigate to chest page, verify button states (ready, cooling, disabled) render correctly with teal borders.

- [ ] 11. **Migrate Header.tsx button to use Button component**
   
   The Follow button in Header is currently an `<a>` tag styled as a button. Update it to use Button component with `as="a"` pattern or wrap with Button styling.
   
   **Button mapping:**
   - Follow button: Keep as `<a>` but apply button classes via `className="app-control ..."`, OR create a Link variant of Button component to handle external links properly with `target="_blank"` security.
   
   **Decision:** Since this is an external link with `target="_blank"`, keep as `<a>` but ensure consistent styling by applying Button-like classes. Add `rel="noopener noreferrer"` for security (already present).
   
   **Files:** `app/components/Header.tsx`
   
   **Verify:** Run `npm run build` and `npm run lint`. Visually confirm Follow button matches other outline-variant buttons in styling.

- [ ] 12. **Verify BottomNav.tsx navigation links (no button migration needed)**
   
   BottomNav uses Next.js `<Link>` components, not buttons. Verify that existing styles remain consistent with the design system.
   
   **Files:** None (inspection only)
   
   **Verify:** Run dev server and confirm bottom navigation renders correctly without regressions.

- [ ] 13. **Verify ShareFeatures.tsx (no button elements present)**
   
   ShareFeatures.tsx contains only informational cards, no buttons. No migration needed.
   
   **Files:** None (inspection only)
   
   **Verify:** Visual inspection only - confirm no regressions.

- [ ] 14. **Verify StakeTable.tsx (no button elements present)**
   
   StakeTable.tsx is a read-only table, no buttons. No migration needed.
   
   **Files:** None (inspection only)
   
   **Verify:** Visual inspection only - confirm table renders correctly.

- [ ] 15. **Verify TrustAnchor.tsx (no button elements present)**
   
   TrustAnchor.tsx displays metrics cards, no buttons. No migration needed.
   
   **Files:** None (inspection only)
   
   **Verify:** Visual inspection only - confirm metrics display correctly.

- [ ] 16. **Verify Footer.tsx (no button elements present)**
   
   Footer.tsx is a static footer, no buttons. No migration needed.
   
   **Files:** None (inspection only)
   
   **Verify:** Visual inspection only - confirm footer renders correctly.

- [ ] 17. **Final integration test: build and visual verification**
   
   Run full build and start dev server to verify all migrated buttons work correctly across the entire application.
   
   **Test checklist:**
   - All modals (Stake, Unstake, Onboarding) render with consistent teal-border outline buttons
   - Button states (hover, disabled, loading) work as expected
   - No TypeScript or ESLint errors
   - No visual regressions on pages: /home, /chest, /stake, /steam, /profile
   - Accessibility: keyboard navigation (Tab, Enter) works on all buttons
   - Focus rings are visible and styled with teal outline
   
   **Commands:**
   ```bash
   npm run build
   npm run lint
   npm run dev
   ```
   
   **Verify:** Manual testing in browser at http://localhost:3000. Check console for errors. Test all interactive flows.

---

## Migration Reference: Button Element Inventory

### Components with buttons migrated:
1. **StakeModal.tsx** - 5 button patterns (close, category select, duration select, cancel, stake)
2. **UnstakeModal.tsx** - 3 button patterns (position select, cancel, unstake)
3. **OnboardingModal.tsx** - 2 button patterns (skip, next/get started)
4. **WalletConnection.tsx** - 2 button patterns (connect, disconnect)
5. **ShareButton.tsx** - 3 button variants (icon, secondary, primary)
6. **ChestCard.tsx** - 2 button patterns (primary action, secondary action)

### Components with no buttons:
- **Header.tsx** - Follow link (styled as button, kept as `<a>`)
- **BottomNav.tsx** - Navigation links only
- **ShareFeatures.tsx** - Static content cards
- **StakeTable.tsx** - Read-only table
- **TrustAnchor.tsx** - Metrics display
- **Footer.tsx** - Static footer

### Total button elements migrated: ~20+ instances across 6 components

---

## Design Decisions & Rationale

1. **Default variant is 'outline' with teal border** - Per user requirement "bo44on বর্ডার/রিং: কালার: /টিল/min4" which specifies teal/mint border color on dark background (#181a20).

2. **Remove global button hover styles** - The generic `button:hover { transform: translateY(-1px); }` in globals.css applies to ALL buttons indiscriminately. This conflicts with component-specific needs (e.g., nav buttons shouldn't jump). Instead, the Button component offers an `animated` prop for opt-in hover effects.

3. **Loading state uses existing spinner** - Reuse the `.premium-spinner` class already defined in globals.css for consistency.

4. **Size variants match existing patterns** - Analyzed actual button usage in modals and extracted three common sizes (sm, md, lg) based on padding patterns found in the codebase.

5. **TypeScript design tokens** - Export CSS variables as TS constants for type-safe consumption, IDE autocomplete, and easier refactoring.

6. **Accessibility first** - Focus rings, aria-disabled, and keyboard support are built into the Button component by default.

7. **No breaking changes to non-button elements** - Links (`<a>`) and navigation components (`<Link>`) remain unchanged. Only actual `<button>` elements are migrated.

---

## Post-Implementation Notes

After completing this plan:
- All buttons will have consistent teal border styling per user requirements
- Design tokens are available for future component development
- Button component is extensible for new variants if needed
- Documentation exists for onboarding new developers
- The design system serves as the single source of truth for UI styles

Future enhancements could include:
- Additional button variants (warning, info)
- Icon button component (separate from ShareButton)
- Form input components following the same design token system
- Dark/light theme support using CSS variables
