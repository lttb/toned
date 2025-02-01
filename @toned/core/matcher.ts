export class StyleMatcher {
	private valuePositions: Map<string, number> = new Map()
	private totalBits: number = 0
	private styles: Array<{ mask: bigint; style: Record<string, any> }> = []

	constructor(config: Record<string, any>) {
		// First pass: collect all unique attribute-value pairs and assign positions
		this.collectValuePositions(config)

		// Second pass: process styles with computed bit positions
		this.processConfig(config)
	}

	private collectValuePositions(
		obj: Record<string, any>,
		path: string[] = [],
	): void {
		for (const [key, value] of Object.entries(obj)) {
			if (key.startsWith('[')) {
				const { attr, val } = this.parseSelector(key)
				const valueKey = `${attr}:${val}`

				if (!this.valuePositions.has(valueKey)) {
					this.valuePositions.set(valueKey, this.totalBits++)
				}
			}

			if (value && typeof value === 'object') {
				this.collectValuePositions(value, [...path, key])
			}
		}
	}

	private processConfig(
		obj: Record<string, any>,
		parentMask: bigint = 0n,
	): void {
		// Extract direct styles (non-selector keys)
		const directStyles = Object.entries(obj)
			.filter(([key]) => !key.startsWith('['))
			.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

		if (Object.keys(directStyles).length > 0) {
			this.styles.push({ mask: parentMask, style: directStyles })
		}

		// Process nested selectors
		for (const [key, value] of Object.entries(obj)) {
			if (key.startsWith('[') && typeof value === 'object') {
				const { attr, val } = this.parseSelector(key)
				const position = this.valuePositions.get(`${attr}:${val}`)!
				const newMask = parentMask | (1n << BigInt(position))

				this.processConfig(value, newMask)
			}
		}
	}

	private parseSelector(selector: string): { attr: string; val: string } {
		const match = selector.match(/\[([^=]+)=([^\]]+)\]/)
		if (!match) throw new Error(`Invalid selector: ${selector}`)
		return { attr: match[1], val: match[2] }
	}

	match(props: Record<string, any>): any[] {
		let propsMask = 0n

		// Build props mask
		for (const [attr, val] of Object.entries(props)) {
			const position = this.valuePositions.get(`${attr}:${val}`)
			if (position !== undefined) {
				propsMask |= 1n << BigInt(position)
			}
		}

		// Return matching styles
		return this.styles
			.filter(({ mask }) => (propsMask & mask) === mask)
			.map(({ style }) => style)
	}
}
