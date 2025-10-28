// TODO: think about improving the types portability
export * from '@toned/core/types'

import { defineSystem } from '@toned/core'
import * as border from './border.ts'
import * as colour from './colour.ts'
import * as layout from './layout.ts'
import * as rules from './rules.ts'
import * as shadow from './shadow.ts'
import * as sizes from './sizes.ts'
import * as typo from './typo.ts'

export const { system, stylesheet, t } = defineSystem(
  {
    ...typo,
    ...border,
    ...colour,
    ...layout,
    ...shadow,
    ...sizes,

    // ...rules
  },
  rules,
)
