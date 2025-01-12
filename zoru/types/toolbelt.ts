// @see https://github.com/millsp/ts-toolbelt/blob/319e55123b9571d49f34eca3e5926e41ca73e0f3/sources/Function/Exact.ts#L9-L20

/**
 * Describes types that can be narrowed
 */
type Narrowable = string | number | bigint | boolean

/**
 * Force `A` to comply with `W`. `A` must be a shape of `W`. In other words, `A`
 * must extend `W` and have the same properties - no more, no less.
 * @param A
 * @param W
 */
export type Exact<A, W> = W extends unknown
	? A extends W
		? A extends Narrowable
			? A
			: {
					[K in keyof A]: K extends keyof W ? Exact<A[K], W[K]> : never
				}
		: W
	: never
