type Selector = {
	attr: string
	val: string
}

type Operation = {
	attr: string
	bits: Record<string, number>
	shift: number
}

type StyleRule = {
	mask: number
	required: number
	styles: Record<string, any>
}

export class StyleMatcher {
	private ops: Operation[] = []
	private rules: StyleRule[] = []

	constructor(config: Record<string, any>) {
		const attrs = this.extractSelectors(config)
		this.ops = this.createOperations(attrs)
		this.compileRules(config)

		console.log('size', this.rules)
	}

	match(props: Record<string, any>): Record<string, any> {
		const mask = this.computeMask(props)
		return this.applyMatchingStyles(mask)
	}

	private extractSelectors(
		config: Record<string, any>,
	): Map<string, Set<string>> {
		const attrs = new Map<string, Set<string>>()

		const collect = (obj: Record<string, any>): void => {
			for (const [key, value] of Object.entries(obj)) {
				if (!key.startsWith('[')) continue

				const { attr, val } = this.parseSelector(key)
				attrs.set(attr, (attrs.get(attr) || new Set()).add(val))

				if (value && typeof value === 'object') {
					collect(value)
				}
			}
		}

		collect(config)
		return attrs
	}

	private createOperations(attrs: Map<string, Set<string>>): Operation[] {
		return Array.from(attrs).map(([attr, values], idx) => {
			const bits: Record<string, number> = {}
			Array.from(values).forEach((val, i) => {
				bits[val] = i
			})
			return { attr, bits, shift: idx * 2 }
		})
	}

	private compileRules(
		obj: Record<string, any>,
		parentMask = 0,
		required = 0,
	): void {
		// Extract direct styles (non-selector properties)
		const styles = Object.entries(obj)
			.filter(([key]) => !key.startsWith('['))
			.reduce<Record<string, any>>((acc, [k, v]) => {
				acc[k] = v
				return acc
			}, {})

		if (Object.keys(styles).length > 0) {
			this.rules.push({ mask: parentMask, required, styles })
		}

		// Process nested selectors
		for (const [key, value] of Object.entries(obj)) {
			if (!key.startsWith('[') || typeof value !== 'object') continue

			const { attr, val } = this.parseSelector(key)
			const op = this.ops.find((op) => op.attr === attr)
			if (!op) continue

			const bit = op.bits[val]
			if (bit === undefined) continue

			const bitMask = 1 << (op.shift + bit)
			this.compileRules(value, parentMask | bitMask, required | bitMask)
		}
	}

	private computeMask(props: Record<string, any>): number {
		let mask = 0
		for (const { attr, bits, shift } of this.ops) {
			const val = props[attr]
			if (val === undefined) continue

			const bit = bits[String(val)]
			if (bit !== undefined) {
				mask |= 1 << (shift + bit)
			}
		}
		return mask
	}

	private applyMatchingStyles(mask: number): Record<string, any> {
		const result: Record<string, any> = {}

		for (const { mask: ruleMask, required, styles } of this.rules) {
			if ((mask & required) !== required) continue

			for (const key in styles) {
				result[key] ??= {}
				Object.assign(result[key], styles[key])
			}
		}

		return result
	}

	private parseSelector(selector: string): Selector {
		const match = selector.match(/\[([^=]+)=([^\]]+)\]/)
		if (!match) throw new Error(`Invalid selector: ${selector}`)
		return { attr: match[1], val: match[2] }
	}
}
