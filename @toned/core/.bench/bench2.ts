type ModValueMap = {[value: string]: number}

export class ModMatcher<const Schema extends Record<string, ReadonlyArray<string | number | boolean>>> {
	// Precomputed operations for each mod.
	private keyOperations: Array<{
		modName: string
		position: number
		bitsNeeded: number
		valueMap: ModValueMap
	}>

	// Cached optimized function (generated on first call).
	private optimizedKeyFn?: (mods: {[key in keyof Schema]: Schema[key][number]}) => number

	constructor(schema: Schema) {
		let totalBits = 0
		// Build the operations for each mod in the schema.
		this.keyOperations = Object.keys(schema).map((modName) => {
			const possibleValues = schema[modName]
			const valueMap: ModValueMap = {}
			possibleValues.forEach((value, index) => {
				valueMap[value] = index
			})
			const bitsNeeded = Math.ceil(Math.log2(possibleValues.length))
			const op = {
				modName,
				position: totalBits,
				bitsNeeded,
				valueMap,
			}
			totalBits += bitsNeeded
			return op
		})
	}

	/**
	 * Standard key generation method.
	 * It iterates through precomputed operations, looks up the index
	 * for each mod value, and packs it into a single numeric key.
	 */
	getKey(mods: {[key in keyof Schema]: Schema[key][number]}): number {
		let key = 0
		for (const op of this.keyOperations) {
			const value = mods[op.modName]
			const index = op.valueMap[value]
			if (index === undefined) {
				throw new Error(`Invalid mod value for ${op.modName}: ${value}`)
			}
			key |= index << op.position
		}
		return key
	}

	/**
	 * Returns an optimized key generation function that eliminates
	 * the loop and inlines the bit operations. The function is generated
	 * dynamically the first time this method is called.
	 */
	generateOptimizedMatcher(): (mods: {[key in keyof Schema]: Schema[key][number]}) => number {
		if (this.optimizedKeyFn) {
			return this.optimizedKeyFn
		}

		// Build the function's source code as a string.
		let functionBody = 'let key = 0;\n'
		for (const op of this.keyOperations) {
			// Inline the value map as a JSON literal.
			const valueMapLiteral = JSON.stringify(op.valueMap)
			functionBody += `
        {
          const value = mods["${op.modName}"];
          const map = ${valueMapLiteral};
          const index = map[value];
          if (index === undefined) {
            throw new Error("Invalid mod value for ${op.modName}: " + value);
          }
          key |= index << ${op.position};
        }
      `
		}
		functionBody += '\nreturn key;'

		// Create the optimized function.
		// (Be sure that the environment is trusted when using the Function constructor.)
		this.optimizedKeyFn = new Function('mods', functionBody) as (mods: {
			[key in keyof Schema]: Schema[key][number]
		}) => number

		return this.optimizedKeyFn
	}
}

const modSchema = {
	size: ['s', 'm', 'l'],
	variant: ['primary', 'secondary'],
	disabled: [true, false],
	theme: ['light', 'dark'],
} as const

const matcher = new ModMatcher(modSchema)
const optimizedFn = matcher.generateOptimizedMatcher()
const testMods = {
	size: 'm',
	variant: 'primary',
	disabled: false,
	theme: 'dark',
}

// Warm up
for (let i = 0; i < 1000; i++) {
	matcher.getKey(testMods)
	optimizedFn(testMods)
}

// Benchmark
const iterations = 1000000

const start1 = performance.now()
for (let i = 0; i < iterations; i++) {
	matcher.getKey(testMods)
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
