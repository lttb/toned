import { defineToken } from '../defineCssToken'

export const borderRadius = defineToken({
  values: ['none', 'small', 'medium', 'large', 'xlarge', 'full'],
  resolve: (value, tokens) => ({
    borderRadius: tokens[`radius_${value}`],
  }),
})

export const borderWidth = defineToken({
  values: ['none', 'thin', 'medium', 'thick', 'heavy'],
  resolve: (value, tokens) => ({
    borderWidth: tokens[`border_width_${value}`],
  }),
})
