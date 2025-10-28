import { defineUnit } from '@toned/core'
import { defineCssToken, defineToken } from '../defineCssToken.ts'

// TODO: move to configuration level
// biome-ignore lint/complexity/noBannedTypes: instance is expected
const SpaceUnit = defineUnit<Number | String>((value, tokens) => {
  // @ts-expect-error
  const base = tokens.base

  if (typeof value === 'string') {
    return tokens[`space_${value}`]
  }

  return String(base).startsWith('var')
    ? `calc(${base} * ${Number(value)})`
    : Number(value) * Number.parseInt(String(base), 10)
})

export const overflow = defineCssToken('overflow', [
  'hidden',
  'auto',
  'visible',
  'scroll',
])
export const overflowX = defineCssToken('overflowX', [
  'hidden',
  'auto',
  'visible',
  'scroll',
])
export const overflowY = defineCssToken('overflowY', [
  'hidden',
  'auto',
  'visible',
  'scroll',
])

const paddingValues = [
  new Number(),
  'xxsmal',
  'xsmall',
  'small',
  'medium',
  'large',
  'xlarge',
  'xxlarge',
] as const

export const padding = defineCssToken(
  ['paddingLeft', 'paddingTop', 'paddingBottom', 'paddingRight'],
  paddingValues,
  SpaceUnit,
)
export const paddingX = defineCssToken(
  ['paddingLeft', 'paddingRight'],
  paddingValues,
  SpaceUnit,
)
export const paddingY = defineCssToken(
  ['paddingTop', 'paddingBottom'],
  paddingValues,
  SpaceUnit,
)
export const paddingLeft = defineCssToken(
  'paddingLeft',
  paddingValues,
  SpaceUnit,
)
export const paddingRight = defineCssToken(
  'paddingRight',
  paddingValues,
  SpaceUnit,
)
export const paddingTop = defineCssToken('paddingTop', paddingValues, SpaceUnit)
export const paddingBottom = defineCssToken(
  'paddingBottom',
  paddingValues,
  SpaceUnit,
)

export const gap = defineCssToken('gap', paddingValues, SpaceUnit)
export const rowGap = defineCssToken('rowGap', paddingValues, SpaceUnit)
export const columnGap = defineCssToken('columnGap', paddingValues, SpaceUnit)

export const flexLayout = defineToken({
  values: ['column', 'column-reverse', 'row', 'row-reverse'],
  resolve: (value) => ({
    display: 'flex',
    flexDirection: value,
  }),
})

export const flexGrow = defineCssToken('flexGrow', ['0', '1'])
export const flexWrap = defineCssToken('flexWrap', [
  'wrap',
  'wrap-reverse',
  'nowrap',
])
export const flexShrink = defineCssToken('flexShrink', ['0', '1'])
export const justifyContent = defineCssToken('justifyContent', [
  'normal',
  'flex-start',
  'flex-end',
  'center',
  'space-between',
  'space-around',
  'space-evenly',
  'stretch',
])
export const justifyItems = defineCssToken('justifyItems', [
  'flex-start',
  'flex-end',
  'center',
  'stretch',
])
export const justifySelf = defineCssToken('justifySelf', [
  'auto',
  'flex-start',
  'flex-end',
  'center',
  'stretch',
])

export const alignContent = defineCssToken('alignContent', [
  'normal',
  'flex-start',
  'flex-end',
  'center',
  'space-between',
  'space-around',
  'space-evenly',
  'baseline',
  'stretch',
])

export const alignItems = defineCssToken('alignItems', [
  'flex-start',
  'flex-end',
  'center',
  'baseline',
  'stretch',
])

export const alignSelf = defineCssToken('alignSelf', [
  'auto',
  'flex-start',
  'flex-end',
  'center',
  'baseline',
  'stretch',
])

export const placeContent = defineCssToken('placeContent', [
  'start',
  'end',
  'center',
  'space-between',
  'space-around',
  'space-evenly',
  'baseline',
  'stretch',
])

export const placeItems = defineCssToken('placeItems', [
  'start',
  'end',
  'center',
  'baseline',
  'stretch',
])

export const placeSelf = defineCssToken('placeSelf', [
  'auto',
  'start',
  'end',
  'center',
  'stretch',
])
