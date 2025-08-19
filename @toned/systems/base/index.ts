import { defineSystem } from '@toned/core'

import * as border from './border'
import * as colour from './colour'
import * as layout from './layout'
import * as shadow from './shadow'
import * as typo from './typo'

export const { system, stylesheet, t } = defineSystem({
  ...typo,
  ...border,
  ...colour,
  ...layout,
  ...shadow,
})
