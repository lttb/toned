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

4. Create stylesheets and match runtime styles

```ts
import { stylesheet } from '@toned/systems/base'

export const styles = stylesheet({
  container: {
    textColor: 'on_action',
    bgColor: 'default',
    alignItems: 'flex-start',
    flexLayout: 'column',
  },
  button: { textColor: 'destructive' },
})
```
