import { createContext } from 'react'

import type { Tokens } from './types'
import { createAttach } from './react.common'

export const TokensContext = createContext<Tokens>({})

export const attachSystem = createAttach(TokensContext)
