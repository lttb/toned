import { defineConfig } from '@toned/core'
import * as ReactAll from 'react'

import { TokensContext } from './ctx.ts'

const { use } = ReactAll as unknown as typeof import('react19')

export default defineConfig({
  getTokens() {
    return use(TokensContext)
  },
})
