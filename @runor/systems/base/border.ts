import { defineToken } from '@runor/core'

export const borderRadius = defineToken({
	values: ['none', 'small', 'medium', 'large', 'xlarge', 'full'],
	resolve: (value, tokens) => ({
		borderRadius: tokens[`radius_${value}`],
	}),
})

export const borderWith = defineToken({
	values: ['none', 'thin', 'medium', 'thick', 'heavy'],
	resolve: (value, tokens) => ({
		borderWidth: tokens[`border_width_${value}`],
	}),
})
