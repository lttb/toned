import * as ReactAll from 'react'
import { setConfig } from '@toned/core'

import { TokensContext } from './ctx'

const { use } = ReactAll as unknown as typeof import('react19')

setConfig({
	getTokens() {
		return use(TokensContext)
	},
})
