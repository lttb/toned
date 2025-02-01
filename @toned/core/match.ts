import { ModMatcher } from './ModMatcher'

type ModValueObject = { [value: string]: number }

interface TrieNode<Style> {
	style?: Style
	specificity?: number
	conditions: Map<string, string | number | boolean>
	children: TrieNode<Style>[]
}

type StyleObject = Record<string, unknown>
type NestedStyle<Style> = Style & {
	[key: string]: Style | NestedStyle<Style> | unknown
}

export class StyleMatcher<
	Schema extends Record<string, ReadonlyArray<string | number | boolean>>,
	Style extends StyleObject,
> {
	private patterns: Array<{
		conditions: Map<string, string | number | boolean>
		style: Style
		specificity: number
	}> = []

	constructor(schema: Schema, styles: Record<string, NestedStyle<Style>>) {
		const flattened = this.flattenStyles(styles)
		this.patterns = flattened.map(({ path, style }) => ({
			conditions: new Map(path),
			style,
			specificity: path.length,
		}))

		// Sort by specificity for consistent matching
		this.patterns.sort((a, b) => a.specificity - b.specificity)

		console.log('Patterns:', this.patterns)
	}

	private parsePattern(
		pattern: string,
	): Map<string, string | number | boolean> {
		const conditions = new Map<string, string | number | boolean>()
		const matches = pattern.match(/\[(.*?)=(.*?)\]/g)
		if (matches) {
			matches.forEach((match) => {
				const [key, value] = match.slice(1, -1).split('=')
				conditions.set(key, value)
			})
		}
		return conditions
	}

	private flattenStyles(
		styles: Record<string, NestedStyle<Style>>,
		parentPath: Array<[string, string | number | boolean]> = [],
	): Array<{
		path: Array<[string, string | number | boolean]>
		style: Style
	}> {
		const result: Array<{
			path: Array<[string, string | number | boolean]>
			style: Style
		}> = []

		for (const [pattern, value] of Object.entries(styles)) {
			if (pattern.startsWith('[')) {
				const conditions = this.parsePattern(pattern)
				const currentPath = [...parentPath]

				for (const [key, val] of conditions) {
					currentPath.push([key, val])
				}

				const styleProps: Record<string, unknown> = {}
				const nestedPatterns: Record<string, unknown> = {}

				Object.entries(value as Record<string, unknown>).forEach(
					([key, val]) => {
						if (key.startsWith('[')) {
							nestedPatterns[key] = val
						} else {
							styleProps[key] = val
						}
					},
				)

				if (Object.keys(styleProps).length > 0) {
					result.push({
						path: currentPath,
						style: styleProps as Style,
					})
				}

				result.push(...this.flattenStyles(nestedPatterns, currentPath))
			} else {
				const regularStyles: Record<string, unknown> = {}
				const nestedPatterns: Record<string, unknown> = {}

				Object.entries(value as Record<string, unknown>).forEach(
					([key, val]) => {
						if (key.startsWith('[')) {
							nestedPatterns[key] = val
						} else {
							regularStyles[key] = val
						}
					},
				)

				if (Object.keys(regularStyles).length > 0) {
					result.push({
						path: parentPath,
						style: regularStyles as Style,
					})
				}

				result.push(...this.flattenStyles(nestedPatterns, parentPath))
			}
		}

		return result
	}

	private deepMerge(
		target: Record<string, unknown>,
		source: Record<string, unknown>,
	): Record<string, unknown> {
		const result = { ...target }

		for (const key in source) {
			if (
				source[key] &&
				typeof source[key] === 'object' &&
				!Array.isArray(source[key])
			) {
				if (
					result[key] &&
					typeof result[key] === 'object' &&
					!Array.isArray(result[key])
				) {
					result[key] = this.deepMerge(
						result[key] as Record<string, unknown>,
						source[key] as Record<string, unknown>,
					)
				} else {
					result[key] = { ...source[key] }
				}
			} else {
				result[key] = source[key]
			}
		}

		return result
	}

	private patternMatches(
		conditions: Map<string, string | number | boolean>,
		mods: { [key in keyof Schema]: Schema[key][number] },
	): boolean {
		// We just need to check if each of our conditions matches the mods
		// NOT if mods matches all our conditions
		for (const [key, value] of conditions) {
			if (String(mods[key]) !== String(value)) {
				return false
			}
		}
		return true
	}

	match(mods: { [key in keyof Schema]: Schema[key][number] }): Style {
		console.log('Matching mods:', mods)

		const matches = this.patterns
			.filter((pattern) => this.patternMatches(pattern.conditions, mods))
			.sort((a, b) => a.specificity - b.specificity)

		console.log('Found matches:', matches)

		return matches.reduce(
			(acc, { style }) => this.deepMerge(acc, style),
			{} as Style,
		) as Style
	}

	createOptimizedMatchFn() {
		const patterns = this.patterns
		const deepMerge = this.deepMerge.bind(this)
		const patternMatches = this.patternMatches.bind(this)

		return function (
			mods: { [key in keyof Schema]: Schema[key][number] },
		): Style {
			const matches = patterns
				.filter((pattern) => patternMatches(pattern.conditions, mods))
				.sort((a, b) => a.specificity - b.specificity)

			return matches.reduce(
				(acc, { style }) => deepMerge(acc, style),
				{} as Style,
			) as Style
		}
	}
}

// Usage example
const matcher = new StyleMatcher(
	{
		size: ['s', 'm', 'l'],
		variant: ['primary', 'secondary'],
		disabled: [true, false],
		theme: ['light', 'dark'],
		alignment: ['default', 'icon-only'],
	},
	{
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
	},
)

console.log(
	'test',
	matcher.match({
		size: 'm',
		variant: 'secondary',
		disabled: true,
		theme: 'dark',
		alignment: 'icon-only',
	}),
)
