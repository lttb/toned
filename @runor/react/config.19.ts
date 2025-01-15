// @ts-expect-error
import * as ReactAll from 'react'
import { setConfig } from '@runor/core'

import { TokensContext } from './ctx'

const { use } = ReactAll as typeof import('react19')

setConfig({
	getTokens() {
		return use(TokensContext)
	},
})
