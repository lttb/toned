type StyleValue = string | number | number
type StyleObject = Record<string, StyleValue>
type StyleRules = Record<string, StyleObject>

interface NestedStyleRules {
	[selector: string]: any
}

type ModValue = string
type Props = Record<string, string | boolean | number>

type PropertyMap = {
	[key: string]: {
		[value: string]: number
	}
}

type SchemeConfig = {
	[key: string]: Set<string>
}

type RulesList = {
	[key: string]: {
		rule: any // The actual rule object
	}
}

type Config = {
	scheme: SchemeConfig
	list: RulesList
}

const WILDCARD = '*' as const

export class StyleMatcher<Schema extends NestedStyleRules> {
	propertyBits: PropertyMap = {}
	compiledRules: Array<{
		bitMask: number
		bitValue: number
		original: string
		rule: any
	}> = []

	bits: Array<[string, PropertyMap[string]]>

	constructor(rules: NestedStyleRules) {
		const { scheme, list } = this.flattenRules(rules)

		this.compile({ scheme, list })

		this.bits = Object.entries(this.propertyBits)
	}

	private flattenRules(rules: NestedStyleRules) {
		const list: Record<string, { rule: StyleRules }> = {}
		const scheme: Record<string, Set<ModValue>> = {}

		const modIndex = new Map<string, number>()

		const traverse = (
			selector: Map<string, string>,
			node: NestedStyleRules,
		) => {
			const rule: NestedStyleRules = Object.create(null)

			selector.forEach((value, key) => {
				if (!modIndex.has(key)) {
					modIndex.set(key, modIndex.size)
				}
			})

			const listKey = Array.from(modIndex.keys())
				.map((key) => {
					return `${key}:${selector.get(key) || WILDCARD}`
				})
				.join('|')

			list[listKey] ??= { rule }
			Object.assign(list[listKey].rule, rule)

			Object.keys(node).forEach((key) => {
				if (!key.startsWith('[')) {
					rule[key] = node[key]
				} else {
					const [mod, modValue] = this.parseSelector(key)
					scheme[mod] ??= new Set()
					scheme[mod].add(modValue)

					const nextMap = new Map(selector)
					nextMap.set(mod, modValue)

					traverse(nextMap, node[key])
				}
			})
		}

		traverse(new Map(), rules)

		return { scheme, list }
	}

	private parseSelector(selector: string): [string, string] {
		const match = selector.match(/\[([^=]+)=([^\]]+)\]/)
		if (!match) throw new Error(`Invalid selector: ${selector}`)
		return [match[1], match[2]]
	}

	compile(config: Config) {
		// First, create a mapping of each property:value to a unique bit position
		let bitPosition = 0

		for (const [property, values] of Object.entries(config.scheme)) {
			this.propertyBits[property] = {}
			for (const value of values) {
				this.propertyBits[property][value] = 1 << bitPosition
				bitPosition++
			}
		}

		// Then compile each rule into its bitmask
		for (const [ruleStr, ruleData] of Object.entries(config.list)) {
			if (ruleStr === '') continue // Skip empty rule

			let bitMask = 0
			let bitValue = 0

			const conditions = ruleStr.split('|')
			for (const condition of conditions) {
				const [property, value] = condition.split(':')

				if (value === WILDCARD) continue

				const propertyBitValue = this.propertyBits[property][value]

				bitMask |= this.getMask(this.propertyBits[property])
				bitValue |= propertyBitValue
			}

			this.compiledRules.push({
				bitMask,
				bitValue,
				original: ruleStr,
				rule: ruleData.rule,
			})
		}
	}

	private getMask(valuesMap: PropertyMap[string]): number {
		let mask = 0
		for (const value of Object.values(valuesMap)) {
			mask |= value
		}
		return mask
	}

	match(props: Partial<Schema>) {
		// Convert input props to bits
		let inputBits = 0

		this.bits.forEach((x) => {
			const prop = x[0]
			const value = props[prop]

			if (!value) return

			inputBits |= x[1][value]
		})

		// Match against compiled rules
		const result: Record<string, any> = {}

		for (const compiledRule of this.compiledRules) {
			if ((inputBits & compiledRule.bitMask) !== compiledRule.bitValue) continue

			for (const key in compiledRule.rule) {
				result[key] ??= {}
				Object.assign(result[key], compiledRule.rule[key])
			}
		}

		return result
	}
}
