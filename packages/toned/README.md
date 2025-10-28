# toned

## Configuration

Define `toned.config.ts`

```tsx
import {defineConfig} from '@toned/core'

export default defineConfig()
```

Import configuration in your project and set it

```tsx
import {setConfig} from '@tonec/core'

import config from './toned.config.ts'

setConfig(config)
```

### React

```tsx
import {defineConfig} from '@toned/core'
import {reactPreset} from '@toned/react/config'

import {reactNativePreset} from '@toned/react/config.native'
import {reactWebPreset} from '@toned/react/config.web'

export default defineConfig({
  presets: [reactPreset, reactNativePreset, reactWebPreset],
})
```
