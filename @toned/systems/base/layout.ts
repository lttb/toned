import { defineToken, defineUnit } from '@toned/core'

// TODO: move to configuration level
const SpaceUnit = defineUnit(Number, (value, tokens) => {
  // @ts-expect-error
  const base = tokens.base

  return String(base).startsWith('var')
    ? `calc(${base} * ${Number(value)})`
    : Number(value) * Number.parseInt(base, 10)
})

//const space = defineToken({
//  values: [
//  	'none',
//  	'xxsmall',
//  	'xsmall',
//  	'small',
//  	'medium',
//  	'large',
//  	'xlarge',
//  	'xxlarge',
//  ],
//  resolve: (value, tokens) => tokens[`space_${value}`],
//})

export const paddingX = defineToken({
  values: [new Number()],
  resolve: (value, tokens) => {
    const space = SpaceUnit(value, tokens)

    return {
      paddingLeft: space,
      paddingRight: space,
    }
  },
})
export const paddingY = defineToken({
  values: [new Number()],
  resolve: (value, tokens) => {
    const space = SpaceUnit(value, tokens)

    return {
      paddingTop: space,
      paddingBottom: space,
    }
  },
})
export const padding = defineToken({
  values: [new Number()],
  resolve: (value, tokens) => {
    const space = SpaceUnit(value, tokens)

    return {
      paddingLeft: space,
      paddingTop: space,
      paddingBottom: space,
      paddingRight: space,
    }
  },
})

export const flexLayout = defineToken({
  values: ['column', 'column-reverse', 'row', 'row-reverse'],
  resolve: (value) => ({
    display: 'flex',
    flexDirection: value,
  }),
})
export const flexGrow = defineToken({
  values: ['0', '1'],
  resolve: (value) => ({
    flexGrow: value,
  }),
})
export const flexBasis = defineToken({
  values: [new Number()],
  resolve: (value, tokens) => {
    const space = SpaceUnit(value, tokens)

    return {
      flexBasis: space,
    }
  },
})
export const flexWrap = defineToken({
  values: ['wrap', 'wrap-reverse', 'nowrap'],
  resolve: (value) => ({
    flexWrap: value,
  }),
})
export const flexShrink = defineToken({
  values: ['0', '1'],
  resolve: (value) => ({
    flexShrink: value,
  }),
})
export const gap = defineToken({
  values: [new Number()],
  resolve: (value, tokens) => {
    const space = SpaceUnit(value, tokens)

    return {
      gap: space,
    }
  },
})

export const opacity = defineToken({
  values: [new Number()],
  resolve: (value) => {
    return {
      opacity: value,
    }
  },
})

export const justifyContent = defineToken({
  values: [
    'normal',
    'flex-start',
    'flex-end',
    'center',
    'space-between',
    'space-around',
    'space-evenly',
    'stretch',
  ],
  resolve: (value) => {
    return { justifyContent: value }
  },
})

export const justifyItems = defineToken({
  values: ['flex-start', 'flex-end', 'center', 'stretch'],
  resolve: (value) => {
    return { justifyItems: value }
  },
})

export const justifySelf = defineToken({
  values: ['auto', 'flex-start', 'flex-end', 'center', 'stretch'],
  resolve: (value) => {
    return { justifySelf: value }
  },
})

export const alignContent = defineToken({
  values: [
    'normal',
    'flex-start',
    'flex-end',
    'center',
    'space-between',
    'space-around',
    'space-evenly',
    'baseline',
    'stretch',
  ],
  resolve: (value) => {
    return { alignContent: value }
  },
})
export const alignItems = defineToken({
  values: ['flex-start', 'flex-end', 'center', 'baseline', 'stretch'],
  resolve: (value) => {
    return { alignItems: value }
  },
})
export const alignSelf = defineToken({
  values: ['auto', 'flex-start', 'flex-end', 'center', 'baseline', 'stretch'],
  resolve: (value) => {
    return { alignSelf: value }
  },
})

export const placeContent = defineToken({
  values: [
    'start',
    'end',
    'center',
    'space-between',
    'space-around',
    'space-evenly',
    'baseline',
    'stretch',
  ],
  resolve: (value) => {
    return { placeContent: value }
  },
})
export const placeItems = defineToken({
  values: ['start', 'end', 'center', 'baseline', 'stretch'],
  resolve: (value) => {
    return { placeItems: value }
  },
})
export const placeSelf = defineToken({
  values: ['auto', 'start', 'end', 'center', 'stretch'],
  resolve: (value) => {
    return { placeSelf: value }
  },
})
