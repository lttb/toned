import { opacity } from '@toned/systems/base/layout'
import { StyleMatcher } from './new-matcher'

// Usage example
const matcher = new StyleMatcher({
	'[size=m]': {
		container: {
			paddingX: 30,
			paddingY: 30,
			background: 'blue',
		},

		'[alignment=icon-only]': {
			container: {
				paddingX: 50,
				color: 'white',
			},
		},

		'[disabled=true]': {
			container: {
				opacity: 0.5,
			},
			'[variant=secondary]': {
				container: {
					background: 'gray',
				},
			},
		},

		'[theme=dark]': {
			container: {
				opacity: 0.3,
			},
		},
	},

	'[size=s]': {
		container: {
			paddingX: 30,
			paddingY: 30,
			background: 'red',
		},
	},
})

/* should be
  container: {
    paddingX: 30,
    paddingY: 30,
    background: "gray",
    opacity: 0.3,
  },
*/
console.log(
	matcher.match({
		size: 's',
		variant: 'secondary',
		disabled: true,
		theme: 'dark',
		alignment: 'icon-only',
	}),
)
