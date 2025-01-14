import { defineToken, defineUnit, defineSystem } from '@runor/core'

const bgColor = defineToken({
	values: [
		// Base surfaces
		'default',
		'subtle',
		'muted',
		'emphasized',
		'overlay',
		'elevated',

		// Interactive
		'interactive',
		'interactive_subtle',
		'interactive_muted',

		// Actions
		'action',
		'action_secondary',
		'action_subtle',
		'destructive',
		'important',

		// Status
		'status_error',
		'status_warning',
		'status_success',
		'status_info',

		// Data viz
		'data_primary',
		'data_secondary',
		'data_tertiary',
		'data_quaternary',

		// Special
		'skeleton',
	],
	resolve: (value, tokens) => ({
		backgroundColor: tokens[`colors_bg_${value}`],
	}),
})

const textColor = defineToken({
	values: [
		// Base text
		'default',
		'subtle',
		'muted',
		'emphasized',

		// Interactive text
		'interactive',
		'interactive_subtle',

		// Action text
		'action',
		'action_secondary',
		'destructive',
		'important',

		// Status text
		'status_error',
		'status_warning',
		'status_success',
		'status_info',

		// On-color text (for contrast)
		'on_action',
		'on_action_secondary',
		'on_destructive',
		'on_important',
		'on_status_error',
		'on_status_warning',
		'on_status_success',
		'on_status_info',
	],
	resolve: (value, tokens) => ({
		color: tokens[`colors_text_${value}`],
	}),
})

const borderColor = defineToken({
	values: [
		'default',
		'subtle',
		'muted',
		'interactive',
		'input',

		'action',
		'destructive',

		'status_error',
		'status_warning',
		'status_success',
	],
	resolve: (value, tokens) => ({
		borderColor: tokens[`colors_border_${value}`],
	}),
})

const svgFill = defineToken({
	values: [
		'default',
		'subtle',
		'muted',
		'emphasized',

		'interactive',
		'interactive_subtle',

		'action',
		'action_secondary',
		'destructive',
		'important',

		'status_error',
		'status_warning',
		'status_success',
		'status_info',

		'current', // Uses currentColor
	],
	resolve: (value, tokens) => ({
		fill: value === 'current' ? 'currentColor' : tokens[`colors_fill_${value}`],
	}),
})

const outlineColor = defineToken({
	values: [
		'focus_center', // Primary focus ring
		'focus_edge', // Secondary/outer focus ring
	],
	resolve: (value, tokens) => ({
		outlineColor: tokens[`colors_outline_${value}`],
	}),
})

const borderRadius = defineToken({
	values: ['none', 'small', 'medium', 'large', 'xlarge', 'full'],
	resolve: (value, tokens) => ({
		borderRadius: tokens[`radius_${value}`],
	}),
})

const borderWith = defineToken({
	values: ['none', 'thin', 'medium', 'thick', 'heavy'],
	resolve: (value, tokens) => ({
		borderWidth: tokens[`border_width_${value}`],
	}),
})

const shadow = defineToken({
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

const typo = defineToken({
	values: [
		// Display
		'display_large',
		'display_medium',
		'display_small',

		// Heading
		'heading_1',
		'heading_2',
		'heading_3',
		'heading_4',

		// Body
		'body_large',
		'body_medium',
		'body_small',

		// Label
		'label_large',
		'label_medium',
		'label_small',

		// Special cases
		'code',
		'quote',
		'caption',
	],
	resolve: (value, tokens) => ({
		fontFamily: tokens[`typo_${value}_family`],
		fontSize: tokens[`typo_${value}_size`],
		fontWeight: tokens[`typo_${value}_weight`],
		lineHeight: tokens[`typo_${value}_height`],
		letterSpacing: tokens[`typo_${value}_spacing`],
	}),
})

const layout = defineToken({
	values: ['column', 'column-reverse', 'row', 'row-reverse'],
	resolve: (value) => ({
		display: 'flex',
		flexDirection: value,
	}),
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

// TODO: move to configuration level
const SpaceUnit = defineUnit(Number, (value, tokens) =>
	String(tokens.base).startsWith('var')
		? `calc(${tokens.base} * ${Number(value)})`
		: Number(value) * Number.parseInt(tokens.base, 10),
)

const paddingX = defineToken({
	values: [new Number()],
	resolve: (value, tokens) => {
		const space = SpaceUnit(value, tokens)

		return {
			paddingLeft: space,
			paddingRight: space,
		}
	},
})
const paddingY = defineToken({
	values: [new Number()],
	resolve: (value, tokens) => {
		const space = SpaceUnit(value, tokens)

		return {
			paddingTop: space,
			paddingBottom: space,
		}
	},
})
const padding = defineToken({
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

export const { system, stylesheet, t } = defineSystem({
	bgColor,
	textColor,
	borderColor,
	outlineColor,
	svgFill,
	borderRadius,
	borderWith,
	shadow,
	typo,
	layout,

	padding,
	paddingX,
	paddingY,
})
