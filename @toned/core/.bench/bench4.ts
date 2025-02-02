/**
 * A lookup table mapping allowed modifier values (as object keys) to their numeric indices.
 */
type ValueLookup = { [value: string]: number }

/**
 * ModMatcher compiles a schema of modifiers (and their allowed values) into a compact numeric key.
 * It provides both a standard (computeKey) and a dynamically generated optimized function.
 *
 * @template Schema - A record mapping modifier names to arrays of allowed values.
 */
export class ModMatcher<
	const Schema extends Record<string, ReadonlyArray<string | number | boolean>>,
> {
	/**
	 * For each modifier, we store:
	 * - name: The modifier’s name.
	 * - bitPos: The starting bit position for this modifier’s value.
	 * - lookup: A plain object mapping allowed values (as strings) to numeric indices.
	 */
	private readonly modifierConfigs: Array<{
		name: string
		bitPos: number
		lookup: ValueLookup
	}>

	/**
	 * Caches the optimized key function once it is generated.
	 */
	private optimizedKeyFn?: (
		mods: { [K in keyof Schema]: Schema[K][number] },
	) => number

	/**
	 * Constructs a ModMatcher given a schema.
	 *
	 * @param schema - A record whose keys are modifier names and whose values are arrays of allowed values.
	 */
	constructor(schema: Schema) {
		let pos = 0
		this.modifierConfigs = Object.keys(schema).map((name) => {
			const values = schema[name]
			const lookup: ValueLookup = {}
			// Use the allowed value as key (implicitly converting to string)
			for (let i = 0, len = values.length; i < len; i++) {
				lookup[values[i] as any] = i
			}
			// Ensure at least one bit is allocated.
			const bits = Math.max(1, Math.ceil(Math.log2(values.length)))
			const config = { name, bitPos: pos, lookup }
			pos += bits
			return config
		})
	}

	/**
	 * Computes the numeric key from the given modifiers.
	 *
	 * Uses an indexed loop over precomputed configuration data for maximum speed.
	 *
	 * @param mods - An object mapping modifier names to one of their allowed values.
	 * @returns The computed numeric key.
	 */
	public computeKey(mods: { [K in keyof Schema]: Schema[K][number] }): number {
		let key = 0
		const configs = this.modifierConfigs
		for (let i = 0, len = configs.length; i < len; i++) {
			const cfg = configs[i]
			// Direct property access without extra coercions (assumes modifier values match the lookup keys)
			const idx = cfg.lookup[mods[cfg.name] as any]
			if (idx === undefined) {
				throw new Error(
					`Invalid modifier value for "${cfg.name}": ${mods[cfg.name]}`,
				)
			}
			key |= idx << cfg.bitPos
		}
		return key
	}

	/**
	 * Returns an optimized key-generation function.
	 *
	 * The generated function inlines all lookups and bit-shifts, eliminating loop overhead at runtime.
	 * (This function is created and cached on first call.)
	 *
	 * **Warning:** This method uses dynamic code generation (via the Function constructor)
	 * and should only be used in trusted environments.
	 *
	 * @returns An optimized function that computes the key from a modifiers object.
	 */
	public createOptimizedKeyFn(): (
		mods: { [K in keyof Schema]: Schema[K][number] },
	) => number {
		if (this.optimizedKeyFn) return this.optimizedKeyFn

		// Build an object to hold the lookup objects for each modifier.
		const lookups: Record<string, ValueLookup> = {}
		// Build the code lines for inlining each lookup.
		const lines: string[] = []
		const configs = this.modifierConfigs
		for (let i = 0, len = configs.length; i < len; i++) {
			const cfg = configs[i]
			// Save the lookup object for this modifier.
			lookups[`l${i}`] = cfg.lookup
			// Inline code: directly get the value from the modifiers object.
			lines.push(
				`var v${i} = lookups.l${i}[mods["${cfg.name}"]];`,
				`if(v${i} === undefined) throw new Error("Invalid modifier value for '${cfg.name}': " + mods["${cfg.name}"]);`,
				`key |= v${i} << ${cfg.bitPos};`,
			)
		}
		// Build the complete function body.
		const functionBody = `
      var key = 0;
      ${lines.join('\n')}
      return key;
    `
		// Create the dynamic function.
		const fn = new Function('lookups', 'mods', functionBody) as (
			lookups: Record<string, ValueLookup>,
			mods: { [K in keyof Schema]: Schema[K][number] },
		) => number
		// Cache and return the bound optimized function.
		this.optimizedKeyFn = fn.bind(null, lookups)
		return this.optimizedKeyFn
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
