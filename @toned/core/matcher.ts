export class StyleMatcher {
	constructor(styleConfig) {
		this.attributeMap = new Map()
		this.valueMap = new Map()
		this.styles = []
		this.masks = []

		// Additional index structures
		this.attributeIndex = new Map() // Maps attribute to styles that use it
		this.maskIndex = new Map() // Maps partial masks to style indices

		this.collectAttributesAndValues(styleConfig)
		this.processStyleConfig(styleConfig)
		this.buildIndices()
	}

	buildIndices() {
		// Build attribute index
		for (let i = 0; i < this.masks.length; i++) {
			const { attributes } = this.masks[i]
			for (const attr of attributes) {
				if (!this.attributeIndex.has(attr)) {
					this.attributeIndex.set(attr, new Set())
				}
				this.attributeIndex.get(attr).add(i)
			}
		}

		// Build mask index - group styles by common mask patterns
		for (let i = 0; i < this.masks.length; i++) {
			const mask = this.masks[i].required
			const key = mask.toString()
			if (!this.maskIndex.has(key)) {
				this.maskIndex.set(key, [])
			}
			this.maskIndex.get(key).push(i)
		}
	}

	match(props) {
		let propsMask = 0n
		const propsAttributes = new Set()
		const relevantStyleIndices = new Set()

		// Build props mask and collect attributes
		for (const [attr, value] of Object.entries(props)) {
			if (this.attributeMap.has(attr)) {
				propsAttributes.add(attr)
				const valueKey = `${attr}:${value}`
				if (this.valueMap.has(valueKey)) {
					propsMask |= this.valueMap.get(valueKey)
				}
			}
		}

		// Quick filter: get only styles that use attributes present in props
		for (const attr of propsAttributes) {
			const styleIndices = this.attributeIndex.get(attr)
			if (styleIndices) {
				for (const idx of styleIndices) {
					relevantStyleIndices.add(idx)
				}
			}
		}

		// If we have no relevant styles, return empty array
		if (relevantStyleIndices.size === 0) {
			return []
		}

		const matchedStyles = []

		// Check only relevant styles
		for (const i of relevantStyleIndices) {
			const { required, attributes } = this.masks[i]

			// Quick reject if props don't satisfy required attributes
			let hasAllAttrs = true
			for (const attr of attributes) {
				if (!propsAttributes.has(attr)) {
					hasAllAttrs = false
					break
				}
			}

			if (hasAllAttrs && (propsMask & required) === required) {
				matchedStyles.push(this.styles[i])
			}
		}

		return matchedStyles
	}

	collectAttributesAndValues(config) {
		for (const [key, value] of Object.entries(config)) {
			if (typeof value === 'object' && value !== null) {
				// If key is a selector
				if (key.startsWith('[')) {
					const { attribute, value: attrValue } = this.parseSelector(key)

					if (!this.attributeMap.has(attribute)) {
						this.attributeMap.set(attribute, this.attributeMap.size)
					}

					const valueKey = `${attribute}:${attrValue}`
					if (!this.valueMap.has(valueKey)) {
						this.valueMap.set(valueKey, 1n << BigInt(this.valueMap.size))
					}
				}

				// Recursively process nested objects
				this.collectAttributesAndValues(value)
			}
		}
	}

	processStyleConfig(config, parentMask = 0n, parentAttrs = new Set()) {
		const currentStyles = {}
		const selectorMask = parentMask
		const selectorAttrs = new Set(parentAttrs)

		for (const [key, value] of Object.entries(config)) {
			// Handle style objects
			if (!key.startsWith('[')) {
				if (typeof value === 'object' && value !== null) {
					currentStyles[key] = value
				}
				continue
			}

			// Handle selectors
			if (typeof value === 'object' && value !== null) {
				const { attribute, value: attrValue } = this.parseSelector(key)
				const valueKey = `${attribute}:${attrValue}`
				const mask = selectorMask | (this.valueMap.get(valueKey) ?? 0n)
				selectorAttrs.add(attribute)

				// Get non-selector styles
				const directStyles = {}
				for (const [styleKey, styleValue] of Object.entries(value)) {
					if (!styleKey.startsWith('[')) {
						directStyles[styleKey] = styleValue
					}
				}

				// Add styles if we have any
				if (Object.keys(directStyles).length > 0) {
					this.styles.push(directStyles)
					this.masks.push({
						required: mask,
						attributes: new Set(selectorAttrs),
					})
				}

				// Process nested selectors
				for (const [nestedKey, nestedValue] of Object.entries(value)) {
					if (nestedKey.startsWith('[')) {
						this.processStyleConfig(
							{ [nestedKey]: nestedValue },
							mask,
							new Set(selectorAttrs),
						)
					}
				}
			}
		}

		// Add base styles if we have any
		if (Object.keys(currentStyles).length > 0 && parentMask === 0n) {
			this.styles.push(currentStyles)
			this.masks.push({
				required: 0n,
				attributes: new Set(),
			})
		}
	}

	parseSelector(selector) {
		const match = selector.match(/\[([^=]+)=([^\]]+)\]/)
		if (!match) throw new Error(`Invalid selector format: ${selector}`)
		return { attribute: match[1], value: match[2] }
	}
}
