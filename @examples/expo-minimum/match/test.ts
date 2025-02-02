import type { MergeUnion, IsNever, Union } from './helpers'
import type { MatchedValue } from './Pattern'
import type { DeepExclude } from './DeepExclude'
import type { InvertPattern, InvertPatternForExclude } from './InvertPattern'

export type PickReturnValue<a, b> = a

interface NonExhaustiveError<i> {
	__nonExhaustive: never
}

type ObjectPattern<a> =
	| {
			readonly [k in keyof a]?: Pattern<a[k]>
	  }
	| never

type Pattern<i> = ObjectPattern<Readonly<MergeUnion<i>>>

export type WithDefault<a, def> = [a] extends [never] ? def : a

export type Match<
	i,
	o,
	handledCases extends any[] = [],
	inferredOutput = never,
> = {
	with<
		const p extends Pattern<i>,
		c,
		value extends MatchedValue<i, InvertPattern<p, i>>,
	>(
		pattern: IsNever<p> extends true
			? /**
				 * HACK: Using `IsNever<p>` here is a hack to
				 * make sure the type checker forwards
				 * the input type parameter to pattern
				 * creator functions like `P.when`, `P.not`
				 * `P.union` when they are passed to `.with`
				 * directly.
				 */
				Pattern<i>
			: p,
		handler: any,
	): InvertPatternForExclude<p, value> extends infer excluded
		? Match<
				Exclude<i, excluded>,
				o,
				[...handledCases, excluded],
				Union<inferredOutput, c>
			>
		: never

	exhaustive: DeepExcludeAll<i, handledCases> extends infer remainingCases
		? [remainingCases] extends [never]
			? () => PickReturnValue<o, inferredOutput>
			: NonExhaustiveError<remainingCases>
		: never
}

type DeepExcludeAll<a, tupleList extends any[]> = [a] extends [never]
	? never
	: tupleList extends [infer excluded, ...infer tail]
		? DeepExcludeAll<DeepExclude<a, excluded>, tail>
		: a

type MakeTuples<ps extends readonly any[], value> = {
	-readonly [index in keyof ps]: InvertPatternForExclude<ps[index], value>
}

declare const match: <T>() => Match<T, {}>

const test1 = match<{
	size: 'm' | 's'
	variant: 'accent' | 'danger'
}>()
	.with({ size: 'm', variant: 'accent' }, {})
	.with({ size: 'm', variant: 'danger' }, {})
	.with({ size: 's', variant: 'accent' }, {})
	.with({ size: 's', variant: 'danger' }, {})
	.exhaustive() // ❌ Should trigger show type scription error at this line
