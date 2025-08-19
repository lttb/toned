import { setConfig } from '@toned/core'
import * as ReactAll from 'react'

import { TokensContext } from './ctx'

const { use } = ReactAll as unknown as typeof import('react19')

setConfig({
  getTokens() {
    return use(TokensContext)
  },
})
