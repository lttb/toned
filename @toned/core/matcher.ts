export class StyleMatcher {
	private operations: Array<{
		attr: string
		valueMap: Record<string, number>
		position: number
	}> = []

	private styles: Array<{
		mask: number
		requiredMask: number // New: tracks which bits must be set
		style: Record<string, any>
	}> = []

	constructor(config: Record<string, any>) {
		this.collectOperations(config)
		this.processConfig(config)
	}

	private collectOperations(obj: Record<string, any>): void {
		const attrValues: Map<string, Set<string>> = new Map()
		let position = 0

		const collect = (obj: Record<string, any>) => {
			for (const [key, value] of Object.entries(obj)) {
				if (key.startsWith('[')) {
					const { attr, val } = this.parseSelector(key)
					if (!attrValues.has(attr)) {
						attrValues.set(attr, new Set())
					}
					attrValues.get(attr)!.add(val)
				}
				if (value && typeof value === 'object') {
					collect(value)
				}
			}
		}
		collect(obj)

		this.operations = Array.from(attrValues).map(([attr, values], index) => {
			const valueMap: Record<string, number> = {}
			const valuesArray = Array.from(values)
			for (let i = 0; i < valuesArray.length; i++) {
				valueMap[valuesArray[i]] = index * 2 + i // Use position to separate different attributes
			}
			return { attr, valueMap, position: index }
		})
	}

	private processConfig(
		obj: Record<string, any>,
		parentMask = 0,
		requiredMask = 0,
	): void {
		const directStyles = Object.entries(obj)
			.filter(([key]) => !key.startsWith('['))
			.reduce<Record<string, any>>((acc, [key, value]) => {
				acc[key] = value
				return acc
			}, {})

		if (Object.keys(directStyles).length > 0) {
			this.styles.push({
				mask: parentMask,
				requiredMask,
				style: directStyles,
			})
		}

		for (const [key, value] of Object.entries(obj)) {
			if (key.startsWith('[') && typeof value === 'object') {
				const { attr, val } = this.parseSelector(key)
				const op = this.operations.find((op) => op.attr === attr)!
				const index = op.valueMap[val]
				if (index !== undefined) {
					const bitMask = 1 << index
					this.processConfig(
						value,
						parentMask | bitMask,
						requiredMask | bitMask,
					)
				}
			}
		}
	}

	private parseSelector(selector: string): { attr: string; val: string } {
		const match = selector.match(/\[([^=]+)=([^\]]+)\]/)
		if (!match) throw new Error(`Invalid selector: ${selector}`)
		return { attr: match[1], val: match[2] }
	}

	private mergeStyles(styles: Record<string, any>[]): Record<string, any> {
		return styles.reduce((acc, style) => {
			for (const [key, value] of Object.entries(style)) {
				if (typeof value === 'object' && value !== null) {
					acc[key] = { ...acc[key], ...value }
				} else {
					acc[key] = value
				}
			}
			return acc
		}, {})
	}

	match(props: Record<string, any>): Record<string, any> {
		let mask = 0

		// Generate mask from props
		for (const { attr, valueMap } of this.operations) {
			const value = props[attr]
			if (value !== undefined) {
				const index = valueMap[String(value)]
				if (index !== undefined) {
					mask |= 1 << index
				}
			}
		}

		// Filter and merge matching styles
		const matchingStyles = this.styles
			.filter(({ mask: styleMask, requiredMask }) => {
				// Style matches if all required bits are present and match
				return (mask & requiredMask) === requiredMask
			})
			.map(({ style }) => style)

		return this.mergeStyles(matchingStyles)
	}
}
