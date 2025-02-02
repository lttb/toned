import { StyleMatcher as StyleMatcherTrie } from './matcher'

import { StyleMatcher as StyleMatcherOriginal } from './new-matcher'

// Trie implementation (previous code)...

// Benchmark utilities
function generateConfig(depth: number, branching: number) {
	const sizes = ['xs', 's', 'm', 'l', 'xl']
	const variants = ['primary', 'secondary', 'tertiary']
	const themes = ['light', 'dark']
	const alignments = ['left', 'center', 'right', 'icon-only']

	function generateLevel(currentDepth: number): any {
		if (currentDepth >= depth) return {}

		const result: any = {
			container: {
				padding: currentDepth * 10,
				margin: currentDepth * 5,
				opacity: 0.5 + currentDepth * 0.1,
			},
		}

		for (let i = 0; i < branching; i++) {
			const conditions = [
				`[size=${sizes[i % sizes.length]}]`,
				`[variant=${variants[i % variants.length]}]`,
				`[theme=${themes[i % themes.length]}]`,
				`[alignment=${alignments[i % alignments.length]}]`,
			]

			const condition = conditions[currentDepth % conditions.length]
			result[condition] = generateLevel(currentDepth + 1)
		}

		return result
	}

	return generateLevel(0)
}

function generateProps(count: number) {
	const sizes = ['xs', 's', 'm', 'l', 'xl']
	const variants = ['primary', 'secondary', 'tertiary']
	const themes = ['light', 'dark']
	const alignments = ['left', 'center', 'right', 'icon-only']

	const result = []
	for (let i = 0; i < count; i++) {
		result.push({
			size: sizes[i % sizes.length],
			variant: variants[i % variants.length],
			theme: themes[i % themes.length],
			alignment: alignments[i % alignments.length],
			disabled: i % 2 === 0,
		})
	}
	return result
}

function runBenchmark(
	name: string,
	matcher: any,
	props: Record<string, any>[],
	iterations: number = 1000,
) {
	// Warm up
	for (let i = 0; i < 100; i++) {
		for (const prop of props) {
			matcher.match(prop)
		}
	}

	console.log(`\nRunning ${name}:`)
	console.log(`Props count: ${props.length}`)
	console.log(`Iterations: ${iterations}`)

	const start = performance.now()

	for (let i = 0; i < iterations; i++) {
		for (const prop of props) {
			matcher.match(prop)
		}
	}

	const end = performance.now()
	const total = end - start
	const perMatch = total / (iterations * props.length)

	console.log(`Total time: ${total.toFixed(2)}ms`)
	console.log(`Time per match: ${perMatch.toFixed(3)}ms`)

	return { total, perMatch }
}

// Run benchmarks with different configurations
console.log('Initializing benchmarks...')

const configs = [
	{ depth: 2, branching: 2, name: 'Small' },
	{ depth: 3, branching: 3, name: 'Medium' },
	{ depth: 4, branching: 4, name: 'Large' },
]

for (const { depth, branching, name } of configs) {
	console.log(
		`\n=== ${name} Configuration (depth: ${depth}, branching: ${branching}) ===`,
	)
	const config = generateConfig(depth, branching)
	const props = generateProps(10)

	const original = new StyleMatcherOriginal(config)
	const trie = new StyleMatcherTrie(config)

	const originalResults = runBenchmark(
		'Original Implementation',
		original,
		props,
	)
	const trieResults = runBenchmark('Trie Implementation', trie, props)

	const improvement =
		((originalResults.perMatch - trieResults.perMatch) /
			originalResults.perMatch) *
		100
	console.log(`\nImprovement: ${improvement.toFixed(2)}%`)
}
