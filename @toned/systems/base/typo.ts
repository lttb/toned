import { defineToken } from '@toned/core'

export const typo = defineToken({
  values: [
    // Display
    'display_large',
    'display_medium',
    'display_small',

    // Heading
    'heading_1',
    'heading_2',
    'heading_3',
    'heading_4',

    // Body
    'body_large',
    'body_medium',
    'body_small',

    // Label
    'label_large',
    'label_medium',
    'label_small',

    // Special cases
    'code',
    'quote',
    'caption',
  ],
  resolve: (value, tokens) => ({
    fontFamily: tokens[`typo_${value}_family`],
    fontSize: tokens[`typo_${value}_size`],
    fontWeight: tokens[`typo_${value}_weight`],
    lineHeight: tokens[`typo_${value}_height`],
    letterSpacing: tokens[`typo_${value}_spacing`],
  }),
})
