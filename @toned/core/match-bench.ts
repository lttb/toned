import { StyleMatcher } from './matcher'

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
	},
})

/* should be
  container: {
    paddingX: 50,
    paddingY: 30,
    background: "gray",
    color: "white",
    opacity: 0.5,
  },
*/
console.log(
	matcher.match({
		size: 'm',
		variant: 'secondary',
		disabled: true,
		theme: 'dark',
		alignment: 'icon-only',
	}),
)
