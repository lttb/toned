type ModValueObject = { [value: string]: number }

export class ModMatcher<
	const Schema extends Record<string, ReadonlyArray<string | number | boolean>>,
> {
	// Precomputed operations for each mod
	keyOperations: Array<{
		modName: string
		position: number
		valueObject: ModValueObject
		mask: number // Added mask for each field
	}>

	// Total mask for all fields
	totalMask: number

	constructor(schema: Schema) {
		let totalBits = 0
		this.totalMask = 0

		// Build the operations for each mod in the schema
		this.keyOperations = Object.entries(schema).map(
			([modName, possibleValues]) => {
				const valueObject: ModValueObject = {}
				possibleValues.forEach((value, index) => {
					valueObject[String(value)] = index
				})

				// Calculate the number of bits needed
				const bitsNeeded = Math.ceil(Math.log2(possibleValues.length))
				// Create mask for this field (e.g., for 2 bits: 0b11, for 3 bits: 0b111)
				const mask = (1 << bitsNeeded) - 1

				const op = {
					modName,
					position: totalBits,
					valueObject,
					mask,
				}

				// Update the total mask
				this.totalMask |= mask << totalBits
				totalBits += bitsNeeded

				return op
			},
		)
	}

	computeKey(mods: { [key in keyof Schema]: Schema[key][number] }): number {
		let key = 0
		const ops = this.keyOperations
		const len = ops.length

		for (let i = 0; i < len; i++) {
			const op = ops[i]
			const index = op.valueObject[String(mods[op.modName])]
			key |= index << op.position
		}

		return key
	}

	/**
	 * Computes a key and mask for partial matching
	 */
	private computePartialKey(
		partialMods: Partial<{ [key in keyof Schema]: Schema[key][number] }>,
	): {
		key: number
		mask: number
	} {
		let key = 0
		let mask = 0
		const ops = this.keyOperations
		const len = ops.length

		for (let i = 0; i < len; i++) {
			const op = ops[i]
			const value = partialMods[op.modName]

			if (value !== undefined) {
				const index = op.valueObject[String(value)]
				key |= index << op.position
				mask |= op.mask << op.position
			}
		}

		return { key, mask }
	}

	/**
	 * Checks if mods match a partial pattern
	 */
	is(
		mods: { [key in keyof Schema]: Schema[key][number] },
		pattern: Partial<{ [key in keyof Schema]: Schema[key][number] }>,
	): boolean {
		const fullKey = this.computeKey(mods)
		const { key: patternKey, mask } = this.computePartialKey(pattern)

		return (fullKey & mask) === patternKey
	}

	createOptimizedKeyFn(): (
		mods: { [key in keyof Schema]: Schema[key][number] },
	) => number {
		const objects: Record<string, ModValueObject> = {}
		let functionBody = ''

		for (const op of this.keyOperations) {
			objects[`valueObject_${op.modName}`] = op.valueObject
			functionBody += `
        const value_${op.modName} = objects.valueObject_${op.modName}[String(mods.${op.modName})];
      `
		}

		const combined = this.keyOperations
			.map((op) => `(value_${op.modName} << ${op.position})`)
			.join(' | ')

		functionBody += `
      return ${combined};
    `

		const fn = new Function('objects', 'mods', functionBody) as (
			objects: Record<string, ModValueObject>,
			mods: { [key in keyof Schema]: Schema[key][number] },
		) => number

		return fn.bind(null, objects) as (
			mods: { [key in keyof Schema]: Schema[key][number] },
		) => number
	}

	/**
	 * Creates an optimized pattern matching function
	 */
	createOptimizedIsFn(): (
		mods: { [key in keyof Schema]: Schema[key][number] },
		pattern: Partial<{ [key in keyof Schema]: Schema[key][number] }>,
	) => boolean {
		const objects: Record<string, ModValueObject> = {}
		const masks: Record<string, number> = {}
		let functionBody = ''

		// Cache value objects and masks
		for (const op of this.keyOperations) {
			objects[`valueObject_${op.modName}`] = op.valueObject
			masks[`mask_${op.modName}`] = op.mask
		}

		// Compute full key
		for (const op of this.keyOperations) {
			functionBody += `
        const value_${op.modName} = objects.valueObject_${op.modName}[String(mods.${op.modName})];
      `
		}

		const fullKeyCombined = this.keyOperations
			.map((op) => `(value_${op.modName} << ${op.position})`)
			.join(' | ')

		functionBody += `
      const fullKey = ${fullKeyCombined};
    `

		// Compute pattern key and mask
		for (const op of this.keyOperations) {
			functionBody += `
        let patternKey = 0, mask = 0;
        if (pattern.${op.modName} !== undefined) {
          const patternValue_${op.modName} = objects.valueObject_${op.modName}[String(pattern.${op.modName})];
          patternKey |= patternValue_${op.modName} << ${op.position};
          mask |= masks.mask_${op.modName} << ${op.position};
        }
      `
		}

		functionBody += `
      return (fullKey & mask) === patternKey;
    `

		const fn = new Function(
			'objects',
			'masks',
			'mods',
			'pattern',
			functionBody,
		) as (
			objects: Record<string, ModValueObject>,
			masks: Record<string, number>,
			mods: { [key in keyof Schema]: Schema[key][number] },
			pattern: Partial<{ [key in keyof Schema]: Schema[key][number] }>,
		) => boolean

		return fn.bind(null, objects, masks) as (
			mods: { [key in keyof Schema]: Schema[key][number] },
			pattern: Partial<{ [key in keyof Schema]: Schema[key][number] }>,
		) => boolean
	}
}
