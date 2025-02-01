type ModValueObject = { [value: string]: number }

import { ModMatcher } from './ModMatcher'

interface TrieNode<Style> {
	style?: Style
	specificity?: number
	children: Map<string, Map<string | number | boolean, TrieNode<Style>>>
}

export class StyleMatcher<
	Schema extends Record<string, ReadonlyArray<string | number | boolean>>,
	Style extends Record<string, unknown>,
> {
	private root: TrieNode<Style>
	private modMatcher: ModMatcher<Schema>
	private sortedKeys: (keyof Schema)[]

	constructor(schema: Schema, styles: Record<string, Style>) {
		this.modMatcher = new ModMatcher(schema)
		this.root = { children: new Map() }

		// Pre-sort keys by their bit position for optimal traversal
		this.sortedKeys = Object.keys(schema) as (keyof Schema)[]
		this.sortedKeys.sort((a, b) => {
			const posA = this.modMatcher.keyOperations.find(
				(op) => op.modName === a,
			)!.position

			const posB = this.modMatcher.keyOperations.find(
				(op) => op.modName === b,
			)!.position
			return posA - posB
		})

		// Build the trie
		this.buildTrie(styles)
	}

	private buildTrie(styles: Record<string, Style>) {
		for (const [pattern, style] of Object.entries(styles)) {
			const conditions = new Map<string, string | number | boolean>()

			// Parse pattern like [size=m][alignment=icon-only]
			const matches = pattern.match(/\[(.*?)=(.*?)\]/g)
			if (matches) {
				matches.forEach((match) => {
					const [key, value] = match.slice(1, -1).split('=')
					conditions.set(key, value)
				})
			}

			// Insert into trie
			let current = this.root
			const specificity = conditions.size

			for (const key of this.sortedKeys) {
				const value = conditions.get(key as string)
				if (value !== undefined) {
					if (!current.children.has(key as string)) {
						current.children.set(key as string, new Map())
					}
					const keyMap = current.children.get(key as string)!

					if (!keyMap.has(value)) {
						keyMap.set(value, { children: new Map() })
					}
					current = keyMap.get(value)!
				}
			}

			// Store style and specificity at leaf
			if (
				!current.style ||
				(current.specificity && current.specificity < specificity)
			) {
				current.style = style
				current.specificity = specificity
			}
		}
	}

	match(
		mods: { [key in keyof Schema]: Schema[key][number] },
	): Style | undefined {
		let current = this.root
		let bestMatch: Style | undefined
		let bestSpecificity = -1

		// Traverse trie based on sorted keys
		for (const key of this.sortedKeys) {
			const value = mods[key]
			const keyMap = current.children.get(key as string)

			// Try exact value match
			if (keyMap?.has(value)) {
				current = keyMap.get(value)!
				if (
					current.style &&
					(!bestMatch || current.specificity! > bestSpecificity)
				) {
					bestMatch = current.style
					bestSpecificity = current.specificity!
				}
			} else if (!keyMap) {
				// No match at this level, but we keep the best match found so far
				continue
			}
		}

		return bestMatch
	}

	/**
	 * Creates an optimized matching function
	 */
	createOptimizedMatchFn() {
		const root = this.root
		const sortedKeys = this.sortedKeys

		return (
			mods: { [key in keyof Schema]: Schema[key][number] },
		): Style | undefined => {
			let current = root
			let bestMatch: Style | undefined
			let bestSpecificity = -1

			for (const key of sortedKeys) {
				const value = mods[key]
				const keyMap = current.children.get(key as string)

				if (keyMap?.has(value)) {
					current = keyMap.get(value)!
					if (
						current.style &&
						(!bestMatch || current.specificity! > bestSpecificity)
					) {
						bestMatch = current.style
						bestSpecificity = current.specificity!
					}
				} else if (!keyMap) {
					continue
				}
			}

			return bestMatch
		}
	}
}

// Usage example:
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
			},
		},
		'[size=m][alignment=icon-only]': {
			container: {
				paddingX: 50,
				paddingY: 30,
			},
		},
	},
)

// Regular usage
console.log(
	matcher.match({
		size: 'm',
		variant: 'primary',
		disabled: false,
		theme: 'dark',
		alignment: 'default',
	}),
)

// Optimized usage
const optimizedMatch = matcher.createOptimizedMatchFn()
console.log(
	optimizedMatch({
		size: 'm',
		variant: 'primary',
		disabled: false,
		theme: 'dark',
		alignment: 'icon-only',
	}),
)
