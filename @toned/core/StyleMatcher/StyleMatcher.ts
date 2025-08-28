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

// NOTE: might be generalised to any mod
type InteractionList = Record<string, Record<string, boolean>>

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
  interactions: InteractionList
  elementSet: Set<string>

  bits: Array<[string, PropertyMap[string]]>

  cache = new Map<number, any>()

  constructor(rules: NestedStyleRules) {
    const { scheme, list, interactions, elementSet } = this.flattenRules(rules)

    this.elementSet = elementSet

    this.interactions = interactions

    this.scheme = scheme
    this.list = list

    // console.dir(list, { depth: null })

    this.compile({ scheme, list })

    this.bits = Object.entries(this.propertyBits)
  }

  private flattenRules(rules: NestedStyleRules) {
    const elementSet = new Set<string>()
    const interactions: InteractionList = {}
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

    const processElementRule = (elementKey: string, rule: NestedStyleRules) => {
      const currentRule: NestedStyleRules = {}

      for (const ruleKey in rule) {
        if (ruleKey[0] === '$') {
          const elementKey = ruleKey.replace(/^\$/, '')
          currentRule[elementKey] = rule[ruleKey]
        } else {
          currentRule[elementKey] ??= {}
          currentRule[elementKey][ruleKey] = rule[ruleKey]
        }
      }

      return currentRule
    }

    const traverseElement = (
      selector: Map<string, string>,
      elementKey: string,
      elementRule: NestedStyleRules[string],
    ) => {
      const result: StyleObject = {}

      elementSet.add(elementKey)

      Object.keys(elementRule).forEach((key) => {
        if (key[0] === ':') {
          const mod = `${elementKey}${key}`
          const modValue = 'true'

          interactions[elementKey] ??= {}
          interactions[elementKey][key] = true

          const currentRule = processElementRule(elementKey, elementRule[key])

          traverseMod(selector, mod, modValue, currentRule)
        } else if (key[0] === '[') {
          const [mod, modValue] = this.parseSelector(key)

          const currentRule = processElementRule(elementKey, elementRule[key])

          traverseMod(selector, mod, modValue, currentRule)
        } else if (key[0] === '@') {
          const [mod, modValue] = this.parseAtSelector(key)

          const currentRule = processElementRule(elementKey, elementRule[key])

          traverseMod(selector, mod, modValue, currentRule)
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

      selector.forEach((_value, key) => {
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
        } else if (key[0] === '@') {
          const [mod, modValue] = this.parseAtSelector(key)

          traverseMod(selector, mod, modValue, node[key])
        } else {
          const elementKey = key.replace(/^\$/, '')
          const elementRule = traverseElement(selector, elementKey, node[key])
          selectorRule[elementKey] = elementRule
        }
      })
    }

    traverse(new Map(), rules)

    return { scheme, list, interactions, elementSet }
  }

  private parseSelector(selector: string): [string, string] {
    const [name, value] = selector.slice(1, -1).split('=')
    return [name, value]
  }

  private parseAtSelector(selector: string): [string, string] {
    const [name, value] = selector.split('.')

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

  #elementHash = Symbol.for('@toned/StyleMatcher/elementHash')
  #propsBits = Symbol.for('@toned/StyleMatcher/propsBits')

  match(
    props: Partial<
      Schema &
        Record<`${string}:${string}`, boolean> &
        Record<`@${string}`, string>
    >,
  ) {
    const propsBits = this.getPropsBits(props)

    if (this.cache.has(propsBits)) {
      return this.cache.get(propsBits)
    }

    // Match against compiled rules
    const result: Record<string | symbol, any> = {}

    for (const elementKey in this.list['']?.rule) {
      result[elementKey] ??= {}
      Object.assign(result[elementKey], this.list[''].rule[elementKey])
    }

    result[this.#elementHash] = {}
    result[this.#propsBits] = propsBits

    for (const compiledRule of this.compiledRules) {
      if ((propsBits & compiledRule.bitMask) !== compiledRule.bitValue) continue

      for (const elementKey in compiledRule.rule) {
        result[elementKey] ??= {}
        Object.assign(result[elementKey], compiledRule.rule[elementKey])

        result[this.#elementHash][elementKey] ^= compiledRule.bitValue
      }
    }

    this.cache.set(propsBits, result)

    return result
  }

  isEqual(elementKey: string, style1: any, style2: any) {
    return (
      style1?.[this.#elementHash]?.[elementKey] ===
      style2?.[this.#elementHash]?.[elementKey]
    )
  }
}
