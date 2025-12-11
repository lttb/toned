# @toned/react

React bindings for Toned — lightweight, platform-agnostic styling primitives. This package provides the React (web + native) adapters for using styles and themes defined with `@toned/core`.

## Install

```bash
npm install @toned/core @toned/react
```

## Usage example

### Configure theme context

```tsx
import React from 'react'
import ReactDOM from 'react-dom'
import { defineContext, TokensContext } from '@toned/react'
import shadcn from '@toned/themes/shadcn'

import App from './App'

const tonedContext = defineContext(shadcn)

ReactDOM.render(
  <TokensContext.Provider value={tonedContext}>
    <App />
  </TokensContext.Provider>,
  document.getElementById('root')
)
```

### Component example (React Native):

```tsx
import { useStyles } from '@toned/react'
import { t, stylesheet } from '@toned/systems/base'
import { Text, View } from 'react-native'

export const styles = stylesheet({
  container: {
    textColor: 'on_action',
    bgColor: 'default',
    alignItems: 'flex-start',
    flexLayout: 'column',
  },
  button: { textColor: 'destructive' },
})

export function Card() {
  const s = useStyles(styles)

  return (
    <View {...s.container}>
      <Text {...t({ textColor: 'status_info' })}>
        Edit <Text {...s.code}>src/App.tsx</Text> and save to test HMR
      </Text>
    </View>
  )
}
```
