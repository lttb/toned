import { setConfig } from '@runor/core'

import { TokensContext } from './ctx'

const { use } = require('react') as typeof import('react19')

setConfig({
	getTokens() {
		return use(TokensContext)
	},
})
