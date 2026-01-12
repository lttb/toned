# @toned/core

Minimal core utilities for defining token systems, building stylesheets and runtime style matching rules.

## Quick start

1. Define tokens and units

```ts
import { defineToken, defineUnit, defineSystem } from '@toned/core'
```

2. Create a system

```ts
const color = defineToken({
  values: ['red','blue'] as const,
  resolve: (v) => ({ color: v }),
})

const system = defineSystem({ color })
```

3. Optional - inject generated CSS to DOM (browser)

```ts
import { generate, inject } from '@toned/core/dom'

const css = generate(system) // returns CSS string
inject(system) // injects into <style id="toned/main">
```

## Stylesheet API

### Basic Usage

Create stylesheets with element definitions:

```ts
import { stylesheet } from '@toned/systems/base'

export const styles = stylesheet({
  container: {
    textColor: 'on_action',
    bgColor: 'default',
    alignItems: 'flex-start',
    flexLayout: 'column',
  },
  label: { textColor: 'destructive' },
})
```

### Pseudo Classes (Self-Styling)

Add pseudo classes that only affect the element they're defined in:

```ts
const styles = stylesheet({
  button: {
    bgColor: 'primary',
    // Pseudo class only affects button itself
    ':hover': {
      bgColor: 'primary_hover',
    },
    ':active': {
      bgColor: 'primary_active',
    },
  },
  label: {
    textColor: 'white',
  },
})
```

### Cross-Element Pseudo Classes

Use flat selectors to affect multiple elements when an element's pseudo state changes:

```ts
const styles = stylesheet({
  button: { bgColor: 'primary' },
  icon: { color: 'white' },
  label: { textColor: 'white' },

  // When button is hovered, both button and label change
  'button:hover': {
    button: { bgColor: 'primary_hover' },
    label: { textColor: 'primary_text' },
  },

  // Multiple pseudo classes (must be in alphabetical order)
  'button:active:hover': {
    icon: { color: 'accent' },
  },
})
```

### Breakpoints

Add responsive styles using breakpoint selectors:

```ts
const styles = stylesheet({
  container: {
    paddingX: 2,
    // Breakpoint for small screens
    '@sm': {
      paddingX: 4,
    },
    '@md': {
      paddingX: 6,
    },
  },
})
```

### Variants

Use the `.variants()` chain to define variant-based styles:

```ts
const styles = stylesheet({
  container: {
    bgColor: 'default',
    borderRadius: 'medium',
  },
  label: {
    textColor: 'primary',
  },
}).variants<{
  size: 'sm' | 'md' | 'lg'
  variant: 'primary' | 'secondary' | 'danger'
}>({
  // Single variant
  '[size=sm]': {
    container: { paddingX: 2, paddingY: 1 },
    label: { fontSize: 'small' },
  },

  '[size=md]': {
    container: { paddingX: 4, paddingY: 2 },
    label: { fontSize: 'medium' },
  },

  '[variant=primary]': {
    container: { bgColor: 'action' },
    label: { textColor: 'on_action' },
  },

  '[variant=danger]': {
    container: { bgColor: 'destructive' },
    label: { textColor: 'on_destructive' },
  },

  // Combined variants (selectors must be in alphabetical order by key)
  '[size=sm][variant=primary]': {
    container: { borderColor: 'primary_border' },
  },
})
```

### Using Styles in React

```tsx
import { useStyles } from '@toned/react'
import { styles } from './styles'

function Button({ size = 'md', variant = 'primary' }) {
  const s = useStyles(styles, { size, variant })

  return (
    <button {...s.container}>
      <span {...s.label}>Click me</span>
    </button>
  )
}
```

## Type Safety

The API provides full type inference for:

- Token properties (autocomplete for valid token values)
- Element names (autocomplete when referencing elements)
- Pseudo classes (`:hover`, `:active`, `:focus`)
- Breakpoints (from system configuration)
- Variant selectors (from `.variants<T>()` type parameter)

## API Reference

### `stylesheet(rules)`

Creates a stylesheet with element definitions.

**Parameters:**
- `rules` - Object with element keys and their token styles

**Returns:** Pre-variants stylesheet with `.variants()` method

### `.variants<Mods>(variantRules)`

Adds variant-based styles to a stylesheet.

**Type Parameter:**
- `Mods` - Object type defining variant names and their possible values

**Parameters:**
- `variantRules` - Object with variant selectors as keys and element maps as values

**Returns:** Final stylesheet ready for use with `useStyles`

### Selector Syntax

| Selector | Description | Example |
|----------|-------------|---------|
| `element` | Element definition | `container: { ... }` |
| `:pseudo` | Pseudo class (self only) | `':hover': { ... }` |
| `@breakpoint` | Breakpoint (self only) | `'@sm': { ... }` |
| `element:pseudo` | Cross-element pseudo | `'container:hover': { ... }` |
| `[key=value]` | Single variant | `'[size=sm]': { ... }` |
| `[key1=val1][key2=val2]` | Combined variants | `'[size=sm][variant=primary]': { ... }` |
