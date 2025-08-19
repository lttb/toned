import { defineToken } from '@toned/core'

export const bgColor = defineToken({
  values: [
    // Base surfaces
    'default',
    'subtle',
    'muted',
    'emphasized',
    'overlay',
    'elevated',

    // Interactive
    'interactive',
    'interactive_subtle',
    'interactive_muted',

    // Actions
    'action',
    'action_secondary',
    'action_subtle',
    'destructive',
    'important',

    // Status
    'status_error',
    'status_warning',
    'status_success',
    'status_info',

    // Data viz
    'data_primary',
    'data_secondary',
    'data_tertiary',
    'data_quaternary',

    // Special
    'skeleton',
  ],
  resolve: (value, tokens) => ({
    backgroundColor: tokens[`colors_bg_${value}`],
  }),
})

export const textColor = defineToken({
  values: [
    // Base text
    'default',
    'subtle',
    'muted',
    'emphasized',

    // Interactive text
    'interactive',
    'interactive_subtle',

    // Action text
    'action',
    'action_secondary',
    'destructive',
    'important',

    // Status text
    'status_error',
    'status_warning',
    'status_success',
    'status_info',

    // On-color text (for contrast)
    'on_action',
    'on_action_secondary',
    'on_destructive',
    'on_important',
    'on_status_error',
    'on_status_warning',
    'on_status_success',
    'on_status_info',
  ],
  resolve: (value, tokens) => ({
    color: tokens[`colors_text_${value}`],
  }),
})

export const borderColor = defineToken({
  values: [
    'default',
    'subtle',
    'muted',
    'interactive',
    'input',

    'action',
    'destructive',

    'status_error',
    'status_warning',
    'status_success',
  ],
  resolve: (value, tokens) => ({
    borderColor: tokens[`colors_border_${value}`],
  }),
})

export const svgFill = defineToken({
  values: [
    'default',
    'subtle',
    'muted',
    'emphasized',

    'interactive',
    'interactive_subtle',

    'action',
    'action_secondary',
    'destructive',
    'important',

    'status_error',
    'status_warning',
    'status_success',
    'status_info',

    'current', // Uses currentColor
  ],
  resolve: (value, tokens) => ({
    fill: value === 'current' ? 'currentColor' : tokens[`colors_fill_${value}`],
  }),
})

export const outlineColor = defineToken({
  values: [
    'focus_center', // Primary focus ring
    'focus_edge', // Secondary/outer focus ring
  ],
  resolve: (value, tokens) => ({
    outlineColor: tokens[`colors_outline_${value}`],
  }),
})
