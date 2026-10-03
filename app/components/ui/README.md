# FarFISH Design System

Single source of truth for all UI styles in the FarFISH Next.js mini-app.

## Design Tokens

Design tokens are available as both CSS variables and TypeScript constants:

| Token Name | CSS Variable | Hex Value | TS Import |
|------------|--------------|-----------|-----------|
| Ink (Background) | `--color-ink` | `#0b0e11` | `colors.ink` |
| Surface | `--color-surface` | `#181a20` | `colors.surface` |
| Surface Raised | `--color-surface-raised` | `#20232b` | `colors.surfaceRaised` |
| Accent | `--color-accent` | `#f0b90b` | `colors.accent` |
| Text | `--color-text` | `#f5f5f5` | `colors.text` |
| Muted | `--color-muted` | `#848e9c` | `colors.muted` |
| Positive | `--color-positive` | `#0ecb81` | `colors.positive` |
| Mint | `--color-mint` | `#3be6c1` | `colors.mint` |
| Teal | `--color-teal` | `#00d4c4` | `colors.teal` |

### Usage

```typescript
import { colors, spacing, radius, typography, shadows } from '@/app/styles/design-tokens';

// Use in inline styles
<div style={{ backgroundColor: colors.surface, borderRadius: radius.panel }} />

// Use in styled-components or CSS-in-JS
const StyledDiv = styled.div`
  background: ${colors.surface};
  padding: ${spacing.panel};
`;
```

---

## Button Component

The `Button` component provides a consistent, accessible button interface with multiple variants and sizes.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'outline' \| 'ghost'` | `'outline'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Shows spinner and disables button |
| `animated` | `boolean` | `false` | Enables hover translate effect |
| `disabled` | `boolean` | `false` | Disables button interaction |
| `className` | `string` | `''` | Additional CSS classes |

All standard `HTMLButtonElement` props are also supported (e.g., `onClick`, `type`, `aria-label`).

---

## Variants

### Outline (Default)
Teal border on dark surface — the primary button style per user requirements.

```tsx
<Button variant="outline">Outline Button</Button>
<Button>Default (same as outline)</Button>
```

**Style:** `bg-[#181a20]` with `border-2 border-[#00d4c4]` (teal border)  
**Use for:** Primary actions, selections, category buttons

---

### Primary
Filled teal background with black text.

```tsx
<Button variant="primary">Primary Button</Button>
```

**Style:** `bg-[#00d4c4]` with `text-black`  
**Use for:** Call-to-action, confirm actions, selected state

---

### Secondary
Gray border on raised surface background.

```tsx
<Button variant="secondary">Secondary Button</Button>
```

**Style:** `bg-[#20232b]` with `border-2 border-[#848e9c]`  
**Use for:** Cancel actions, secondary options

---

### Danger
Red background for destructive actions.

```tsx
<Button variant="danger">Delete</Button>
```

**Style:** `bg-red-500` with `border-2 border-red-500`  
**Use for:** Unstake, disconnect, delete actions

---

### Ghost
Minimal transparent button.

```tsx
<Button variant="ghost">Ghost Button</Button>
```

**Style:** `bg-transparent` with no border  
**Use for:** Tertiary actions, icon buttons

---

## Sizes

### Small (`sm`)
Compact size for tight spaces.

```tsx
<Button size="sm">Small Button</Button>
```

**Style:** `py-2 px-3 text-xs`  
**Use for:** Close buttons, inline actions

---

### Medium (`md`) — Default
Standard button size.

```tsx
<Button size="md">Medium Button</Button>
<Button>Default (same as medium)</Button>
```

**Style:** `py-3 px-4 text-sm`  
**Use for:** Most buttons

---

### Large (`lg`)
Prominent button size.

```tsx
<Button size="lg">Large Button</Button>
```

**Style:** `py-4 px-6 text-base`  
**Use for:** Primary CTAs, modal actions

---

## Special States

### Loading
Shows a spinner and disables the button.

```tsx
<Button loading={isPending}>
  {isPending ? 'Processing...' : 'Submit'}
</Button>
```

---

### Animated
Adds a subtle upward hover translation effect.

```tsx
<Button animated>Hover Me</Button>
```

---

### Disabled
Prevents interaction and reduces opacity.

```tsx
<Button disabled>Disabled Button</Button>
```

---

## Full Examples

### Modal Actions

```tsx
<div className="flex gap-4">
  <Button variant="secondary" size="lg" onClick={onClose} className="flex-1">
    Cancel
  </Button>
  <Button variant="primary" size="lg" onClick={onSubmit} className="flex-1">
    Confirm
  </Button>
</div>
```

### Category Selection

```tsx
{categories.map((category) => (
  <Button
    key={category}
    variant={selectedCategory === category ? 'primary' : 'outline'}
    onClick={() => setSelectedCategory(category)}
  >
    {category}
  </Button>
))}
```

### Close Button

```tsx
<Button
  variant="outline"
  size="sm"
  onClick={onClose}
  className="w-8 h-8"
  aria-label="Close modal"
>
  ✕
</Button>
```

---

## Migration Guide

### Before (raw button)

```tsx
<button
  onClick={handleClick}
  className="py-4 px-6 bg-surface border-2 border-teal text-white rounded-xl hover:bg-surface-raised hover:shadow-glow transition-all duration-300"
>
  Click Me
</button>
```

### After (Button component)

```tsx
import Button from '@/app/components/ui/Button';

<Button variant="outline" size="lg" onClick={handleClick}>
  Click Me
</Button>
```

**Benefits:**
- Type-safe props with IntelliSense support
- Consistent styling across the app
- Built-in loading and disabled states
- Accessibility defaults (focus rings, aria support)
- Less code duplication

---

## Accessibility

The Button component includes accessibility best practices:

- **Focus rings:** Teal outline (`focus:ring-2 focus:ring-[#00d4c4]`)
- **Keyboard navigation:** Full keyboard support (Tab, Enter, Space)
- **Disabled state:** `disabled` attribute and `aria-disabled` support
- **Screen readers:** Accepts `aria-label` and other ARIA attributes

### Example with ARIA

```tsx
<Button
  variant="outline"
  size="sm"
  onClick={onClose}
  aria-label="Close modal"
>
  ✕
</Button>
```

---

## Import Paths

```typescript
// Named import
import { Button } from '@/app/components/ui/Button';

// Default import
import Button from '@/app/components/ui/Button';

// Design tokens
import { colors, spacing } from '@/app/styles/design-tokens';
```
