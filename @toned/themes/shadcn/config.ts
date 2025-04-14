class Unit {
	constructor(public value: number) {}
}

const units = {
	px: class extends Unit {},
	base: class extends Unit {},
}

const tokens = {
	base: 4, // Base unit for spacing calculations

	// Color Foundations
	colors_base_50: 'hsl(0 0% 100%)',
	colors_base_100: 'hsl(240 4.8% 95.9%)',
	colors_base_200: 'hsl(240 5.9% 90%)',
	colors_base_300: 'hsl(240 4.9% 83.9%)',
	colors_base_400: 'hsl(240 5% 64.9%)',
	colors_base_500: 'hsl(240 3.8% 46.1%)',
	colors_base_600: 'hsl(240 5.2% 33.9%)',
	colors_base_700: 'hsl(240 5.3% 26.1%)',
	colors_base_800: 'hsl(240 3.7% 15.9%)',
	colors_base_900: 'hsl(240 5.9% 10%)',
	colors_base_950: 'hsl(240 10% 3.9%)',

	// Semantic Colors - Background
	colors_bg_default: '$colors_base_50',
	colors_bg_subtle: '$colors_base_100',
	colors_bg_muted: '$colors_base_200',
	colors_bg_emphasized: '$colors_base_300',
	colors_bg_overlay: 'color-mix(in srgb, colors_base_950 50%, transparent)',
	colors_bg_elevated: '$colors_base_50',

	colors_bg_interactive: '$colors_base_100',
	colors_bg_interactive_subtle: '$colors_base_50',
	colors_bg_interactive_muted: '$colors_base_100',

	colors_bg_action: 'hsl(240 5.9% 10%)',
	colors_bg_action_secondary: 'hsl(240 4.8% 95.9%)',
	colors_bg_action_subtle: 'hsl(240 5.9% 90%)',
	colors_bg_destructive: 'hsl(0 84.2% 60.2%)',
	colors_bg_important: 'hsl(217.2 91.2% 59.8%)',

	colors_bg_status_error: 'hsl(0 84.2% 60.2%)',
	colors_bg_status_warning: 'hsl(38 92% 50%)',
	colors_bg_status_success: 'hsl(142 76% 36%)',
	colors_bg_status_info: 'hsl(217.2 91.2% 59.8%)',

	colors_bg_data_primary: 'hsl(217.2 91.2% 59.8%)',
	colors_bg_data_secondary: 'hsl(288 95.8% 90.6%)',
	colors_bg_data_tertiary: 'hsl(142 76% 36%)',
	colors_bg_data_quaternary: 'hsl(38 92% 50%)',

	colors_bg_skeleton: '$colors_base_200',

	// Text Colors
	colors_text_default: '$colors_base_950',
	colors_text_subtle: '$colors_base_500',
	colors_text_muted: '$colors_base_400',
	colors_text_emphasized: '$colors_base_900',

	colors_text_interactive: '$colors_base_900',
	colors_text_interactive_subtle: '$colors_base_700',

	colors_text_action: 'hsl(240 5.9% 10%)',
	colors_text_action_secondary: 'hsl(240 5.9% 10%)',
	colors_text_destructive: 'hsl(0 84.2% 60.2%)',
	colors_text_important: 'hsl(217.2 91.2% 59.8%)',

	colors_text_status_error: 'hsl(0 84.2% 60.2%)',
	colors_text_status_warning: 'hsl(38 92% 50%)',
	colors_text_status_success: 'hsl(142 76% 36%)',
	colors_text_status_info: 'hsl(217.2 91.2% 59.8%)',

	colors_text_on_action: 'hsl(0 0% 100%)',
	colors_text_on_action_secondary: 'hsl(240 5.9% 10%)',
	colors_text_on_destructive: 'hsl(0 0% 100%)',
	colors_text_on_important: 'hsl(0 0% 100%)',
	colors_text_on_status_error: 'hsl(0 0% 100%)',
	colors_text_on_status_warning: 'hsl(0 0% 100%)',
	colors_text_on_status_success: 'hsl(0 0% 100%)',
	colors_text_on_status_info: 'hsl(0 0% 100%)',

	// Border Colors
	colors_border_default: '$colors_base_200',
	colors_border_subtle: '$colors_base_100',
	colors_border_muted: '$colors_base_200',
	colors_border_interactive: '$colors_base_900',
	colors_border_input: '$colors_base_200',

	colors_border_action: 'hsl(240 5.9% 10%)',
	colors_border_destructive: 'hsl(0 84.2% 60.2%)',

	colors_border_status_error: 'hsl(0 84.2% 60.2%)',
	colors_border_status_warning: 'hsl(38 92% 50%)',
	colors_border_status_success: 'hsl(142 76% 36%)',

	// SVG Fill Colors
	colors_fill_default: '$colors_base_950',
	colors_fill_subtle: '$colors_base_500',
	colors_fill_muted: '$colors_base_400',
	colors_fill_emphasized: '$colors_base_900',

	colors_fill_interactive: '$colors_base_900',
	colors_fill_interactive_subtle: '$colors_base_700',

	colors_fill_action: 'hsl(240 5.9% 10%)',
	colors_fill_action_secondary: 'hsl(240 5.9% 10%)',
	colors_fill_destructive: 'hsl(0 84.2% 60.2%)',
	colors_fill_important: 'hsl(217.2 91.2% 59.8%)',

	colors_fill_status_error: 'hsl(0 84.2% 60.2%)',
	colors_fill_status_warning: 'hsl(38 92% 50%)',
	colors_fill_status_success: 'hsl(142 76% 36%)',
	colors_fill_status_info: 'hsl(217.2 91.2% 59.8%)',

	// Outline Colors
	colors_outline_focus_center: 'hsl(217.2 91.2% 59.8%)',
	colors_outline_focus_edge: 'hsla(217.2 91.2% 59.8% / 0.3)',

	// Border Radius
	radius_none: 0,
	radius_small: new units.px(4),
	radius_medium: new units.px(8),
	radius_large: new units.px(12),
	radius_xlarge: new units.px(16),
	radius_full: new units.px(9999),

	// Border Widths
	border_width_none: 0,
	border_width_thin: new units.px(1),
	border_width_medium: new units.px(2),
	border_width_thick: new units.px(3),
	border_width_heavy: new units.px(4),

	// Shadows
	// shadow_none: 'none',
	// shadow_small: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
	// shadow_medium:
	// 	'0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
	// shadow_large:
	// 	'0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
	// shadow_xlarge:
	// 	'0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
	// shadow_focus:
	// 	'0 0 0 2px colors_outline_focus_center, 0 0 0 4px colors_outline_focus_edge',

	// Typography
	typo_font_sans:
		'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
	typo_display_large_family: 'typo_font_sans',
	typo_display_large_size: '3.75rem',
	typo_display_large_weight: '700',
	typo_display_large_height: '1.2',
	typo_display_large_spacing: '-0.02em',

	typo_display_medium_family: 'typo_font_sans',
	typo_display_medium_size: '3rem',
	typo_display_medium_weight: '700',
	typo_display_medium_height: '1.2',
	typo_display_medium_spacing: '-0.02em',

	typo_display_small_family: 'typo_font_sans',
	typo_display_small_size: '2.25rem',
	typo_display_small_weight: '700',
	typo_display_small_height: '1.2',
	typo_display_small_spacing: '-0.02em',

	typo_heading_1_family: 'typo_font_sans',
	typo_heading_1_size: '2rem',
	typo_heading_1_weight: '700',
	typo_heading_1_height: '1.2',
	typo_heading_1_spacing: '-0.02em',

	typo_heading_2_family: 'typo_font_sans',
	typo_heading_2_size: '1.5rem',
	typo_heading_2_weight: '700',
	typo_heading_2_height: '1.3',
	typo_heading_2_spacing: '-0.01em',

	typo_heading_3_family: 'typo_font_sans',
	typo_heading_3_size: '1.25rem',
	typo_heading_3_weight: '600',
	typo_heading_3_height: '1.4',
	typo_heading_3_spacing: '-0.01em',

	typo_heading_4_family: 'typo_font_sans',
	typo_heading_4_size: '1rem',
	typo_heading_4_weight: '600',
	typo_heading_4_height: '1.4',
	typo_heading_4_spacing: '0',

	typo_body_large_family: 'typo_font_sans',
	typo_body_large_size: '1.125rem',
	typo_body_large_weight: '400',
	typo_body_large_height: '1.5',
	typo_body_large_spacing: '0',

	typo_body_medium_family: 'typo_font_sans',
	typo_body_medium_size: '1rem',
	typo_body_medium_weight: '400',
	typo_body_medium_height: '1.5',
	typo_body_medium_spacing: '0',

	typo_body_small_family: 'typo_font_sans',
	typo_body_small_size: '0.875rem',
	typo_body_small_weight: '400',
	typo_body_small_height: '1.5',
	typo_body_small_spacing: '0',

	typo_label_large_family: 'typo_font_sans',
	typo_label_large_size: '1.125rem',
	typo_label_large_weight: '500',
	typo_label_large_height: '1.4',
	typo_label_large_spacing: '0',

	typo_label_medium_family: 'typo_font_sans',
	typo_label_medium_size: '1rem',
	typo_label_medium_weight: '500',
	typo_label_medium_height: '1.4',
	typo_label_medium_spacing: '0',

	typo_label_small_family: 'typo_font_sans',
	typo_label_small_size: '0.875rem',
	typo_label_small_weight: '500',
	typo_label_small_height: '1.4',
	typo_label_small_spacing: '0',

	typo_code_family: 'font-mono',
	typo_code_size: '0.875rem',
	typo_code_weight: '400',
	typo_code_height: '1.5',
	typo_code_spacing: '0',

	typo_quote_family: 'font-serif',
	typo_quote_size: '1.25rem',
	typo_quote_weight: '400',
	typo_quote_height: '1.6',
	typo_quote_spacing: '-0.01em',

	typo_caption_family: 'typo_font_sans',
	typo_caption_size: '0.75rem',
	typo_caption_weight: '400',
	typo_caption_height: '1.5',
	typo_caption_spacing: '0',
}

export default tokens
