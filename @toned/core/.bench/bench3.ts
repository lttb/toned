type ModValueObject = { [value: string]: number }

export class ModMatcher<
	const Schema extends Record<string, ReadonlyArray<string | number | boolean>>,
> {
	// Precomputed operations for each mod.
	keyOperations: Array<{
		modName: string
		position: number
		valueObject: ModValueObject
	}>

	constructor(schema: Schema) {
		let totalBits = 0

		// Build the operations for each mod in the schema.
		this.keyOperations = Object.entries(schema).map(
			([modName, possibleValues]) => {
				const valueObject: ModValueObject = {}
				possibleValues.forEach((value, index) => {
					// Coerce the value to string for uniformity.
					valueObject[String(value)] = index
				})

				// Calculate the number of bits needed.
				const bitsNeeded = Math.ceil(Math.log2(possibleValues.length))
				const op = {
					modName,
					position: totalBits,
					valueObject,
				}

				totalBits += bitsNeeded
				return op
			},
		)
	}

	/**
	 * Standard key generation method.
	 *
	 * Iterates over precomputed operations, looks up the index for each mod
	 * (using the plain object), and packs it into a single numeric key.
	 */
	computeKey(mods: { [key in keyof Schema]: Schema[key][number] }): number {
		let key = 0
		const ops = this.keyOperations
		const len = ops.length
		for (let i = 0; i < len; i++) {
			const op = ops[i]
			// Coerce the mod value to a string to match object keys.
			const index = op.valueObject[String(mods[op.modName])]
			key |= index << op.position
		}
		return key
	}

	/**
	 * Generates and returns an optimized key generation function.
	 *
	 * The generated function inlines each lookup by first caching the value
	 * for each mod in a local variable, then combining them. The generated code
	 * uses the same objects that were built in the constructor.
	 *
	 * This function is created on demand and bound to the current objects.
	 */
	createOptimizedKeyFn(): (
		mods: { [key in keyof Schema]: Schema[key][number] },
	) => number {
		// Build an object to supply our inlined lookups.
		const objects: Record<string, ModValueObject> = {}
		// Build the function body string.
		let functionBody = ''
		for (const op of this.keyOperations) {
			// Store the object lookup for this mod.
			objects[`valueObject_${op.modName}`] = op.valueObject
			functionBody += `
        const value_${op.modName} = objects.valueObject_${op.modName}[String(mods.${op.modName})];
        if (value_${op.modName} === undefined) {
          throw new Error("Invalid mod value for ${op.modName}: " + mods.${op.modName});
        }
      `
		}
		// Combine each value shifted by its bit position.
		const combined = this.keyOperations
			.map((op) => `(value_${op.modName} << ${op.position})`)
			.join(' | ')
		functionBody += `
      return ${combined};
    `

		// Create a new function that accepts our mods argument.
		const fn = new Function('objects', 'mods', functionBody) as (
			objects: Record<string, ModValueObject>,
			mods: { [key in keyof Schema]: Schema[key][number] },
		) => number

		// Bind the objects so the resulting function only needs the mods argument.
		return fn.bind(null, objects) as (
			mods: { [key in keyof Schema]: Schema[key][number] },
		) => number
	}
}

const modSchema = {
	size: ['s', 'm', 'l'],
	variant: ['primary', 'secondary'],
	disabled: [true, false],
	theme: ['light', 'dark'],
}

const matcher = new ModMatcher(modSchema)
const optimizedFn = matcher.createOptimizedKeyFn()
const testMods = {
	size: 'm',
	variant: 'primary',
	disabled: false,
	theme: 'dark',
}

// Warm up
for (let i = 0; i < 1000; i++) {
	matcher.computeKey(testMods)
	optimizedFn(testMods)
}

// Benchmark
const iterations = 1000000

const start1 = performance.now()
for (let i = 0; i < iterations; i++) {
	matcher.computeKey(testMods)
}
const end1 = performance.now()

const start2 = performance.now()
for (let i = 0; i < iterations; i++) {
	optimizedFn(testMods)
}
const end2 = performance.now()

const start3 = performance.now()
for (let i = 0; i < iterations; i++) {
	JSON.stringify(testMods)
}
const end3 = performance.now()

console.log(`getKey time: ${end1 - start1}ms`)
console.log(`optimizedFn time: ${end2 - start2}ms`)
console.log(`JSON time: ${end3 - start3}ms`)
