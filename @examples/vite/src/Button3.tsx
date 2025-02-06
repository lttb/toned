import type { CSSProperties } from 'react'

type PseudoSelector = ':hover' | ':active' | ':focus' // etc

// Helper to extract variant selector format
type VariantSelector<T extends Record<string, any>> = keyof T extends string
	? `[${keyof T}=${T[keyof T]}]`
	: never

// Get element names excluding variant selectors
type InferElementNames<T> = T extends `[${string}=${string}]`
	? never
	: T extends string
		? T
		: never

// Create $ references from element names
type ElementReference<Elements extends string> = `$${Elements}`

// Style definition for a specific element
type ElementStyles<
	TVariants extends Record<string, any>,
	Elements extends string,
> = CSSProperties & {
	[P in PseudoSelector]?: CSSProperties & {
		[E in ElementReference<Elements>]?: CSSProperties
	}
} & {
	[V in VariantSelector<TVariants>]?: CSSProperties
}

// Global variant styles
type VariantStyles<
	TVariants extends Record<string, any>,
	Elements extends string,
> = {
	[V in VariantSelector<TVariants>]?: {
		[E in ElementReference<Elements>]?: CSSProperties
	} & {
		[V2 in VariantSelector<TVariants>]?: {
			[E in ElementReference<Elements>]?: CSSProperties
		}
	}
}

// Main stylesheet type that infers element names
type StylesheetDefinition<
	TVariants extends Record<string, any>,
	Elements extends string,
> = {
	[E in Elements]?: ElementStyles<TVariants, Elements>
} & VariantStyles<TVariants, Elements>

// Main function that infers both variant types and element names
declare function stylesheet<
	TVariants extends Record<string, any>,
	TStyles extends Record<string, any>,
	ElementNames extends InferElementNames<keyof TStyles>,
>(
	styles: StylesheetDefinition<TVariants, ElementNames>,
): StylesheetDefinition<TVariants, ElementNames>

declare namespace stylesheet {
	function state<T>(): VariantStyles<T, string>
}

// Usage now infers element names:
const styles = stylesheet({
	...stylesheet.state<{
		size: 'm' | 's'
		variant: 'accent' | 'danger'
		alignment?: 'icon-only' | 'icon-left' | 'icon-right'
	}>(),

	container: {
		borderRadius: 'medium',
		':hover': {
			color: 'blue',
			$text: { opacity: 0.8 }, // autocompletes only existing elements
		},
	},

	text: {
		':active': {
			$container: {}, // autocompletes only existing elements
		},
	},
})
