type TrieNode = {
	styles: Array<{
		mask: number
		requiredMask: number
		style: Record<string, any>
	}>
	zero?: TrieNode
	one?: TrieNode
}

export class StyleMatcher {
	private operations: Array<{
		attr: string
		valueMap: Record<string, number>
		position: number
	}> = []

	private attrToOp: Map<string, { valueMap: Record<string, number> }> =
		new Map()
	private root: TrieNode = { styles: [] }
	private maxBits = 0

	constructor(config: Record<string, any>) {
		this.collectOperations(config)
		this.processConfig(config)

		// Pre-compute attribute to operation mapping
		for (const op of this.operations) {
			this.attrToOp.set(op.attr, { valueMap: op.valueMap })
			for (const index of Object.values(op.valueMap)) {
				this.maxBits = Math.max(this.maxBits, index + 1)
			}
		}
	}

	private collectOperations(obj: Record<string, any>): void {
		const attrValues: Map<string, Set<string>> = new Map()

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
				valueMap[valuesArray[i]] = index * 2 + i
			}
			return { attr, valueMap, position: index }
		})
	}

	private addToTrie(
		node: TrieNode,
		style: { mask: number; requiredMask: number; style: Record<string, any> },
		bitPos: number = 0,
	): void {
		// Add style to current node
		node.styles.push(style)

		if (bitPos >= this.maxBits) return

		const hasRequiredBit = (style.requiredMask & (1 << bitPos)) !== 0

		if (hasRequiredBit) {
			// This style requires this bit to be 1
			if (!node.one) node.one = { styles: [] }
			this.addToTrie(node.one, style, bitPos + 1)
		} else {
			// This style can match with either 0 or 1
			if (!node.zero) node.zero = { styles: [] }
			this.addToTrie(node.zero, style, bitPos + 1)
			if (!node.one) node.one = { styles: [] }
			this.addToTrie(node.one, style, bitPos + 1)
		}
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
			this.addToTrie(this.root, {
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

	private collectMatchingStyles(
		node: TrieNode,
		mask: number,
		bitPos: number,
		matchingStyles: Array<{ style: Record<string, any> }>,
	): void {
		// Check if any styles at this node match
		for (const style of node.styles) {
			if ((mask & style.requiredMask) === style.requiredMask) {
				matchingStyles.push(style)
			}
		}

		if (bitPos >= this.maxBits) return

		const bit = (mask & (1 << bitPos)) !== 0

		// Try zero path if it exists and we have a 0 bit
		if (!bit && node.zero) {
			this.collectMatchingStyles(node.zero, mask, bitPos + 1, matchingStyles)
		}

		// Try one path if it exists and we have a 1 bit
		if (bit && node.one) {
			this.collectMatchingStyles(node.one, mask, bitPos + 1, matchingStyles)
		}
	}

	match(props: Record<string, any>): Record<string, any> {
		let mask = 0

		// Generate mask from props using cached operations
		for (const [attr, value] of Object.entries(props)) {
			const op = this.attrToOp.get(attr)
			if (op) {
				const index = op.valueMap[String(value)]
				if (index !== undefined) {
					mask |= 1 << index
				}
			}
		}

		const matchingStyles: Array<{ style: Record<string, any> }> = []
		this.collectMatchingStyles(this.root, mask, 0, matchingStyles)

		return this.mergeStyles(matchingStyles)
	}

	private mergeStyles(
		styles: Array<{ style: Record<string, any> }>,
	): Record<string, any> {
		if (styles.length === 0) return {}
		if (styles.length === 1) return styles[0].style

		return styles.reduce((acc, { style }) => {
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
}
