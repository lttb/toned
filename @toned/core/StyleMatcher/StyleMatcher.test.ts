import { describe, expect, test } from 'vitest'
import { StyleMatcher } from './StyleMatcher'

describe('style matcher with pseudo', () => {
  const matcher = new StyleMatcher<{
    size: 's' | 'm'
    variant: 'accent' | 'danger'
    state: 'disabled' | 'pending'
    alignment: 'icon-only' | 'icon-left' | 'icon-right'
  }>({
    container: {
      borderRadius: 'medium',
      borderWidth: 'none',

      style: {
        cursor: 'pointer',
      },

      ':hover': {
        container: {
          bgColor: 'secondary',
          borderColor: 'secondary',
        },
      },

      '[size=m]': {
        paddingX: 4,
        paddingY: 2,

        '[alignment=icon-only]': {
          paddingX: 2,
        },
      },

      '[size=s]': {
        paddingX: 2,
        paddingY: 1,

        '[alignment=icon-only]': {
          paddingX: 1,
          paddingY: 2,
        },
      },
    },

    label: {
      // style: {
      // 	pointerEvents: 'none',
      // 	userSelect: 'none',
      // },
    },

    '[variant=accent]': {
      container: {
        bgColor: 'action',

        ':active': {
          container: {
            bgColor: 'destructive',
          },
          label: {
            textColor: 'on_destructive',
          },
        },

        ':hover': {
          container: {
            bgColor: 'action_secondary',
          },
          label: {
            textColor: 'on_action_secondary',
          },
        },
      },

      label: {
        textColor: 'on_action',
      },
    },
  })

  test('pseudo and nested', () => {
    expect(
      matcher.match({
        size: 'm',
        variant: 'accent',
        alignment: 'icon-only',
        'container:hover': true,
      }),
    ).toMatchInlineSnapshot(`
			{
			  "container": {
			    "bgColor": "action_secondary",
			    "borderColor": "secondary",
			    "borderRadius": "medium",
			    "borderWidth": "none",
			    "paddingX": 2,
			    "paddingY": 2,
			    "style": {
			      "cursor": "pointer",
			    },
			  },
			  "label": {
			    "textColor": "on_action_secondary",
			  },
			}
		`)
  })
})

describe('style matcher', () => {
  const matcher = new StyleMatcher<{
    size: 's' | 'm'
    variant: 'accent' | 'danger'
    state: 'disabled' | 'pending'
    alignment: 'icon-only' | 'icon-left' | 'icon-right'
  }>({
    '[size=m]': {
      container: {
        paddingX: 30,
        paddingY: 30,
        background: 'blue',
      },

      '[alignment=icon-only]': {
        container: {
          paddingX: 50,
          color: 'white',
        },
      },

      '[state=disabled]': {
        container: {
          opacity: 0.5,
        },
        '[variant=accent]': {
          container: {
            background: 'gray',
          },
          label: {
            color: 'white',
          },
        },
      },
    },

    '[variant=accent]': {
      container: {
        background: 'yellow',
      },
    },

    '[size=s]': {
      container: {
        paddingX: 30,
        paddingY: 30,
        background: 'red',
      },
    },
  })

  test('match snapshots', () => {
    expect(matcher.match({ size: 'm' })).toMatchInlineSnapshot(`
		  {
		    "container": {
		      "background": "blue",
		      "paddingX": 30,
		      "paddingY": 30,
		    },
		  }
		`)

    expect(matcher.match({ size: 's' })).toMatchInlineSnapshot(`
			{
			  "container": {
			    "background": "red",
			    "paddingX": 30,
			    "paddingY": 30,
			  },
			}
		`)

    expect(
      matcher.match({
        size: 'm',
        alignment: 'icon-only',
        state: 'disabled',
        variant: 'accent',
      }),
    ).toMatchInlineSnapshot(`
			{
			  "container": {
			    "background": "yellow",
			    "color": "white",
			    "opacity": 0.5,
			    "paddingX": 50,
			    "paddingY": 30,
			  },
			  "label": {
			    "color": "white",
			  },
			}
		`)

    expect(
      matcher.match({
        size: 'm',
        variant: 'accent',
        state: 'disabled',
      }),
    ).toMatchInlineSnapshot(`
			{
			  "container": {
			    "background": "yellow",
			    "opacity": 0.5,
			    "paddingX": 30,
			    "paddingY": 30,
			  },
			  "label": {
			    "color": "white",
			  },
			}
		`)
  })
})
