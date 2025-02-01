type ModValueObject = { [value: string]: number }
type StyleObject = Record<string, unknown>
type NestedStyle<Style> = Style & {
	[key: string]: Style | NestedStyle<Style> | unknown
}

interface PatternInfo<Style> {
	conditions: Map<string, string | number | boolean>
	style: Style
	specificity: number
}

interface IndexNode<Style> {
	patterns: Array<PatternInfo<Style>>
	children: Map<string, Map<string | number | boolean, IndexNode<Style>>>
}

export class ModMatcher<
	const Schema extends Record<string, ReadonlyArray<string | number | boolean>>,
> {
	// Precomputed operations for each mod
	keyOperations: Array<{
		modName: string
		position: number
		valueObject: ModValueObject
		mask: number
	}>

	// Total mask for all fields
	totalMask: number

	constructor(schema: Schema) {
		let totalBits = 0
		this.totalMask = 0

		this.keyOperations = Object.entries(schema).map(
			([modName, possibleValues]) => {
				const valueObject: ModValueObject = {}
				possibleValues.forEach((value, index) => {
					valueObject[String(value)] = index
				})

				const bitsNeeded = Math.ceil(Math.log2(possibleValues.length))
				const mask = (1 << bitsNeeded) - 1

				const op = {
					modName,
					position: totalBits,
					valueObject,
					mask,
				}

				this.totalMask |= mask << totalBits
				totalBits += bitsNeeded

				return op
			},
		)
	}

	computeKey(mods: { [key in keyof Schema]: Schema[key][number] }): number {
		let key = 0
		const ops = this.keyOperations
		const len = ops.length

		for (let i = 0; i < len; i++) {
			const op = ops[i]
			const index = op.valueObject[String(mods[op.modName])]
			key |= index << op.position
		}

		return key
	}

	private computePartialKey(
		partialMods: Partial<{ [key in keyof Schema]: Schema[key][number] }>,
	): {
		key: number
		mask: number
	} {
		let key = 0
		let mask = 0
		const ops = this.keyOperations
		const len = ops.length

		for (let i = 0; i < len; i++) {
			const op = ops[i]
			const value = partialMods[op.modName]

			if (value !== undefined) {
				const index = op.valueObject[String(value)]
				key |= index << op.position
				mask |= op.mask << op.position
			}
		}

		return { key, mask }
	}

	is(
		mods: { [key in keyof Schema]: Schema[key][number] },
		pattern: Partial<{ [key in keyof Schema]: Schema[key][number] }>,
	): boolean {
		const fullKey = this.computeKey(mods)
		const { key: patternKey, mask } = this.computePartialKey(pattern)

		return (fullKey & mask) === patternKey
	}
}

export class StyleMatcher<
	Schema extends Record<string, ReadonlyArray<string | number | boolean>>,
	Style extends StyleObject,
> {
	private patterns: Array<PatternInfo<Style>> = []
	private index: IndexNode<Style>
	private modKeys: string[]

	constructor(schema: Schema, styles: Record<string, NestedStyle<Style>>) {
		this.modKeys = Object.keys(schema)
		this.index = { patterns: [], children: new Map() }

		const flattened = this.flattenStyles(styles)
		this.patterns = flattened.map(({ path, style }) => ({
			conditions: new Map(path),
			style,
			specificity: path.length,
		}))

		this.patterns.sort((a, b) => a.specificity - b.specificity)
		this.buildIndex()
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

	private indexPattern(pattern: PatternInfo<Style>) {
		const conditions = Array.from(pattern.conditions.entries())
		const indices = Array.from({ length: conditions.length }, (_, i) => i)

		this.index.patterns.push(pattern)

		for (let len = 1; len <= conditions.length; len++) {
			this.getCombinations(indices, len).forEach((combination) => {
				let node = this.index

				combination.forEach((idx) => {
					const [key, value] = conditions[idx]

					if (!node.children.has(key)) {
						node.children.set(key, new Map())
					}
					const keyMap = node.children.get(key)!

					if (!keyMap.has(value)) {
						keyMap.set(value, { patterns: [], children: new Map() })
					}
					node = keyMap.get(value)!
					node.patterns.push(pattern)
				})
			})
		}
	}

	private *getCombinations(arr: number[], len: number): Generator<number[]> {
		if (len === 0) {
			yield []
			return
		}

		for (let i = 0; i <= arr.length - len; i++) {
			const rest = this.getCombinations(arr.slice(i + 1), len - 1)
			for (const combination of rest) {
				yield [arr[i], ...combination]
			}
		}
	}

	private buildIndex() {
		for (const pattern of this.patterns) {
			this.indexPattern(pattern)
		}
		this.sortIndexPatterns(this.index)
	}

	private sortIndexPatterns(node: IndexNode<Style>) {
		node.patterns.sort((a, b) => a.specificity - b.specificity)

		for (const keyMap of node.children.values()) {
			for (const childNode of keyMap.values()) {
				this.sortIndexPatterns(childNode)
			}
		}
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

	match(mods: { [key in keyof Schema]: Schema[key][number] }): Style {
		let bestNode = this.index
		let usedKeys = new Set<string>()

		for (const key of this.modKeys) {
			const value = mods[key]
			const keyMap = bestNode.children.get(key)

			if (keyMap?.has(value)) {
				bestNode = keyMap.get(value)!
				usedKeys.add(key)
			}
		}

		const matches = bestNode.patterns.filter((pattern) => {
			for (const [key, value] of pattern.conditions) {
				if (String(mods[key]) !== String(value)) {
					return false
				}
			}
			return true
		})

		return matches.reduce(
			(acc, { style }) => this.deepMerge(acc, style),
			{} as Style,
		) as Style
	}

	createOptimizedMatchFn() {
		const index = this.index
		const modKeys = this.modKeys
		const deepMerge = this.deepMerge.bind(this)

		return function (
			mods: { [key in keyof Schema]: Schema[key][number] },
		): Style {
			let bestNode = index
			let usedKeys = new Set<string>()

			for (const key of modKeys) {
				const value = mods[key]
				const keyMap = bestNode.children.get(key)

				if (keyMap?.has(value)) {
					bestNode = keyMap.get(value)!
					usedKeys.add(key)
				}
			}

			const matches = bestNode.patterns.filter((pattern) => {
				for (const [key, value] of pattern.conditions) {
					if (String(mods[key]) !== String(value)) {
						return false
					}
				}
				return true
			})

			return matches.reduce(
				(acc, { style }) => deepMerge(acc, style),
				{} as Style,
			) as Style
		}
	}
}
