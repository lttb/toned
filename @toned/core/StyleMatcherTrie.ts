type StyleValue = string | number
type StyleObject = Record<string, StyleValue>
type StyleRules = Record<string, StyleObject>

interface NestedStyleRules {
	[selector: string]: {
		[component: string]: StyleObject
		[nestedSelector: string]: any
	}
}

type Props = Record<string, string | boolean>

interface TrieNode {
	rules: StyleRules | null
	children: Record<string, Record<string | '*', TrieNode>>
}

const WILDCARD = '*' as const

export class StyleMatcher {
	private readonly root: TrieNode
	private readonly modifierOrder: string[]
	private readonly componentKeys: Set<string>

	constructor(rules: NestedStyleRules) {
		this.root = {
			rules: null,
			children: {},
		}
		this.componentKeys = new Set()

		// First extract modifiers to establish order
		const flattenedRules = this.flattenRules(rules)

		this.modifierOrder = this.extractModifierOrder(flattenedRules)

		// Then build trie with rules in correct order
		this.buildTrie(flattenedRules)

		// console.log(JSON.stringify(this.root, null, 2))
	}

	private flattenRules(rules: NestedStyleRules): Array<[string[], StyleRules]> {
		const result: Array<[string[], StyleRules]> = []

		const processNested = (
			baseSelectors: string[],
			current: any,
			parentStyles: StyleRules = Object.create(null),
		) => {
			const componentStyles: StyleRules = Object.create(null)

			// First, collect direct component styles
			for (const key in current) {
				if (!key.startsWith('[')) {
					this.componentKeys.add(key)
					componentStyles[key] = Object.assign(
						Object.create(null),
						current[key],
					)
				}
			}

			// Add current level styles if any exist
			if (Object.keys(componentStyles).length > 0) {
				result.push([baseSelectors, componentStyles])
			}

			// Then process nested selectors
			for (const key in current) {
				if (key.startsWith('[')) {
					processNested([...baseSelectors, key], current[key], componentStyles)
				}
			}
		}

		processNested([], rules)

		return result
	}

	private extractModifierOrder(rules: Array<[string[], StyleRules]>): string[] {
		const modifierSet = new Set<string>()

		for (const [selectors] of rules) {
			for (const selector of selectors) {
				const match = selector.match(/\[([^=]+)=/)
				if (match) {
					modifierSet.add(match[1])
				}
			}
		}

		return Array.from(modifierSet).sort()
	}

	private parseSelector(selector: string): [string, string] {
		const match = selector.match(/\[([^=]+)=([^\]]+)\]/)
		if (!match) throw new Error(`Invalid selector: ${selector}`)
		return [match[1], match[2]]
	}

	private buildTrie(rules: Array<[string[], StyleRules]>) {
		for (const [selectors, styles] of rules) {
			const modifiers = new Map()

			for (const selector of selectors) {
				const [mod, value] = this.parseSelector(selector)
				modifiers.set(mod, value)
			}

			// console.log(modifiers)

			let currentNode = this.root

			for (const modifier of this.modifierOrder) {
				const value = modifiers.get(modifier) ?? WILDCARD

				currentNode.children[modifier] ??= {}
				const modifierMap = currentNode.children[modifier]

				modifierMap[value] ??= {
					rules: null,
					children: {},
				}

				currentNode = modifierMap[value]

				modifiers.delete(modifier)

				if (modifiers.size === 0) {
					break
				}
			}

			currentNode.rules = styles
		}
	}

	match(props: Props): StyleRules {
		const resultsByLevel = new Map<number, StyleRules[]>()

		let maxLevel = 0

		const traverse = (node: TrieNode, level: number): void => {
			// Apply rules by direct assignment - later matches override earlier ones
			if (node.rules) {
				if (!resultsByLevel.has(level)) {
					resultsByLevel.set(level, [])
				}

				maxLevel = Math.max(maxLevel, level)
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				resultsByLevel.get(level)!.push(node.rules)
			}

			if (level >= this.modifierOrder.length) return

			const currentModifier = this.modifierOrder[level]
			const modifierMap = node.children[currentModifier]
			if (!modifierMap) return

			// Check exact match first
			const propValue = String(props[currentModifier])
			const exactMatch = modifierMap[propValue]
			if (exactMatch) {
				traverse(exactMatch, level + 1)
			}

			// Then check wildcard
			const wildcardMatch = modifierMap[WILDCARD]
			if (wildcardMatch) {
				traverse(wildcardMatch, level + 1)
			}
		}

		traverse(this.root, 0)

		const result: StyleRules = {}

		for (let l = 0; l <= maxLevel; l++) {
			const currStyles = resultsByLevel.get(l)
			if (!currStyles) continue
			currStyles.forEach((styles) => {
				for (const component in styles) {
					result[component] ??= {}
					Object.assign(result[component], styles[component])
				}
			})
		}

		return result
	}
}
