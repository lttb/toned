type StyleValue = string | number | number
type StyleObject = Record<string, StyleValue>
type StyleRules = Record<string, StyleObject>

interface NestedStyleRules {
	[selector: string]: any
}

type ModValue = string
type Props = Record<string, string | boolean | number>

const WILDCARD = '*' as const

export class StyleMatcher {
	constructor(rules: NestedStyleRules) {
		const { scheme, list } = this.flattenRules(rules)

		console.log({ scheme, list })
	}

	private flattenRules(rules: NestedStyleRules) {
		const list: Record<string, { rule: StyleRules }> = {}
		const scheme: Record<string, Set<ModValue>> = {}

		const traverse = (selector: Set<string>, node: NestedStyleRules) => {
			const rule: NestedStyleRules = Object.create(null)

			list[[...selector].join('|')] ??= { rule }
			Object.assign(list[[...selector].join('|')].rule, rule)

			Object.keys(node).forEach((key) => {
				if (!key.startsWith('[')) {
					rule[key] = node[key]
				} else {
					const [mod, modValue] = this.parseSelector(key)
					scheme[mod] ??= new Set()
					scheme[mod].add(modValue)

					traverse(selector.union(new Set([`${mod}:${modValue}`])), node[key])
				}
			})
		}

		traverse(new Set(), rules)

		return { scheme, list }
	}

	private parseSelector(selector: string): [string, string] {
		const match = selector.match(/\[([^=]+)=([^\]]+)\]/)
		if (!match) throw new Error(`Invalid selector: ${selector}`)
		return [match[1], match[2]]
	}

	match() {}
}
