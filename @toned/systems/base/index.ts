import { defineSystem } from '@toned/core'

import * as typo from './typo'
import * as border from './border'
import * as colour from './colour'
import * as layout from './layout'
import * as shadow from './shadow'

export const { system, stylesheet, t } = defineSystem({
	...typo,
	...border,
	...colour,
	...layout,
	...shadow,
})
