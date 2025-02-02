type ModValueMap = Map<string, number>

export class ModMatcher<
	const Schema extends Record<string, ReadonlyArray<string | number | boolean>>,
> {
	keyOperations: Array<{
		modName: string
		position: number
		valueMap: ModValueMap
	}>

	constructor(schema: Schema) {
		const valueToIndex = new Map<string, ModValueMap>()
		const bitPositions = new Map<string, number>()

		let totalBits = 0

		Object.entries(schema).forEach(([modName, possibleValues]) => {
			const valueMap = new Map()
			possibleValues.forEach((value, index) => {
				valueMap.set(value, index)
			})

			valueToIndex.set(modName, valueMap)

			const bitsNeeded = Math.ceil(Math.log2(possibleValues.length))
			bitPositions.set(modName, totalBits)
			totalBits += bitsNeeded
		})

		this.keyOperations = Object.entries(schema).map(([modName]) => ({
			modName,
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			position: bitPositions.get(modName)!,
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			valueMap: valueToIndex.get(modName)!,
		}))
	}

	getKey(mods: { [key in keyof Schema]: Schema[key][number] }) {
		let key = 0
		const ops = this.keyOperations
		const len = ops.length

		for (let i = 0; i < len; i++) {
			const op = ops[i]
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			key |= op.valueMap.get(String(mods[op.modName]))! << op.position
		}

		return key
	}

	generateOptimizedMatcher() {
		const maps: Record<string, ModValueMap> = {}
		this.keyOperations.forEach((op) => {
			maps[`valueMap_${op.modName}`] = op.valueMap
		})

		const operations = this.keyOperations
			.map(
				(op) =>
					`(maps.valueMap_${op.modName}.get(mods.${op.modName}) << ${op.position})`,
			)
			.join(' | ')

		return new Function(
			'maps',
			'mods',
			`
      return ${operations};
    `,
		).bind(null, maps) as typeof this.getKey
	}
}

const modSchema = {
	size: ['s', 'm', 'l'],
	variant: ['primary', 'secondary'],
	disabled: [true, false],
	theme: ['light', 'dark'],
}

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
