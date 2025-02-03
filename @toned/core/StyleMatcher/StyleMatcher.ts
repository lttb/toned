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

type MatcherScheme = Record<string, Set<ModValue>>

type MatcherList = Record<string, { rule: StyleRules }>

export class StyleMatcher<Schema extends NestedStyleRules = NestedStyleRules> {
	propertyBits: PropertyMap = {}
	compiledRules: Array<{
		bitMask: number
		bitValue: number
		original: string
		rule: any
	}> = []

	scheme: MatcherScheme
	list: MatcherList

	bits: Array<[string, PropertyMap[string]]>

	constructor(rules: NestedStyleRules) {
		const { scheme, list } = this.flattenRules(rules)

		this.scheme = scheme
		this.list = list

		this.compile({ scheme, list })

		this.bits = Object.entries(this.propertyBits)
	}

	private flattenRules(rules: NestedStyleRules) {
		const list: MatcherList = {}
		const scheme: MatcherScheme = {}

		const modIndex = new Map<string, number>()

		type Selector = Map<string, string>

		const traverseMod = (
			selector: Selector,
			mod: string,
			modValue: string,
			rule: StyleRules,
		) => {
			scheme[mod] ??= new Set()
			scheme[mod].add(modValue)

			const nextMap = new Map(selector)
			nextMap.set(mod, modValue)

			traverse(nextMap, rule)
		}

		const traverseElement = (
			selector: Map<string, string>,
			elementKey: string,
			elementRule: NestedStyleRules[string],
		) => {
			const result: StyleObject = {}

			Object.keys(elementRule).forEach((key) => {
				if (key[0] === ':') {
					const mod = `${elementKey}${key}`
					const modValue = 'true'

					traverseMod(selector, mod, modValue, elementRule[key])
				} else if (key[0] === '[') {
					const [mod, modValue] = this.parseSelector(key)

					traverseMod(selector, mod, modValue, {
						[elementKey]: elementRule[key],
					})
				} else {
					result[key] = elementRule[key]
				}
			})

			return result
		}

		const traverse = (
			selector: Map<string, string>,
			node: NestedStyleRules,
		) => {
			const selectorRule: NestedStyleRules = Object.create(null)

			selector.forEach((value, key) => {
				if (!modIndex.has(key)) {
					modIndex.set(key, modIndex.size)
				}
			})

			const listKey = Array.from(modIndex.keys())
				.map((key) => {
					return `${key}=${selector.get(key) || WILDCARD}`
				})
				.join('|')

			list[listKey] ??= { rule: selectorRule }
			Object.assign(list[listKey].rule, selectorRule)

			Object.keys(node).forEach((key) => {
				if (key[0] === '[') {
					const [mod, modValue] = this.parseSelector(key)

					traverseMod(selector, mod, modValue, node[key])
				} else {
					const elementRule = traverseElement(selector, key, node[key])
					selectorRule[key] = elementRule
				}
			})
		}

		traverse(new Map(), rules)

		return { scheme, list }
	}

	private parseSelector(selector: string): [string, string] {
		const [name, value] = selector.slice(1, -1).split('=')
		return [name, value]
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
				const [property, value] = condition.split('=')

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

	getPropsBits(props: Partial<Schema>) {
		let bits = 0

		this.bits.forEach((x) => {
			const prop = x[0]
			const value = props[prop]

			if (!value) return

			bits |= x[1][value]
		})

		return bits
	}

	match(props: Partial<Schema & Record<`${string}:${string}`, boolean>>) {
		const propsBits = this.getPropsBits(props)

		// Match against compiled rules
		const result: Record<string, any> = Object.assign({}, this.list['']?.rule)

		for (const compiledRule of this.compiledRules) {
			if ((propsBits & compiledRule.bitMask) !== compiledRule.bitValue) continue

			for (const key in compiledRule.rule) {
				result[key] ??= {}
				Object.assign(result[key], compiledRule.rule[key])
			}
		}

		return result
	}
}
