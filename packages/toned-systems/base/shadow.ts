import { defineToken } from '../defineCssToken.ts'

export const shadow = defineToken({
  values: [
    'none',
    'small',
    'medium',
    'large',
    'xlarge',
    'focus', // Special case for focus states
  ],
  resolve: (value, tokens) => ({
    boxShadow: tokens[`shadow_${value}`],
  }),
})
