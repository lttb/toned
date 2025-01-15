import * as React from 'react'
import { setConfig } from '@runor/core'

import { TokensContext } from './ctx'

setConfig({
	getTokens() {
		// @ts-expect-error
		return React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current?.readContext(
			TokensContext,
		)
	},
})
