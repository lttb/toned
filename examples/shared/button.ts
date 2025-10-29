import { stylesheet } from '@toned/systems/base'

export const styles = stylesheet({
  ...stylesheet.state<{
    size: 'm' | 's'
    variant: 'accent' | 'danger'
    alignment?: 'icon-only' | 'icon-left' | 'icon-right'
  }>,

  container: {
    $$type: 'view',

    borderRadius: 'medium',
    borderWidth: 'none',

    style: {
      cursor: 'pointer',
    },
  },

  label: {
    $$type: 'text',
    // style: {
    // 	pointerEvents: 'none',
    // 	userSelect: 'none',
    // },
  },

  '[variant=accent]': {
    $container: {
      bgColor: 'action',

      ':hover': {
        bgColor: 'action_secondary',

        $label: {
          textColor: 'on_action_secondary',
        },
      },

      // control :active precedence over :hover
      ':active': {
        $container: {
          bgColor: 'destructive',
        },
        $label: {
          textColor: 'on_destructive',
        },
      },
    },

    $label: {
      textColor: 'on_action',
    },
  },

  // <Box t={{ padding: 'large', '@media.sm': { padding: 'small' } }} />

  // ...t({ padding: 2, ':hover': {}, '@media.sm': { padding: 4 }}),
  // ...t({ padding: 2, ':hover': {}, '@media.sm.only': { padding: 4 }}),
  // ...t({ padding: 2, ':hover': {}, sm: { padding: 4 }}),
  // ...t({ padding: 2, ':hover': {}, '@sm': { padding: 4 }}),
  // ...t({ padding: 2, ':hover': {}, '@sm.only': { padding: 4 }}),
  // ...t({ padding: 2, ':hover': {}, '@sm.lte': { padding: 4 }}),
  // ...t({ padding: 2, ':hover': {}, '@sm.lge': { padding: 4 }}),
  // ...t({ padding: 2, ':hover': {}, _sm: { padding: 4 }}),
  // ...t({ padding: 2, ':hover': {}, [media.sm]: { padding: 4 }}),
  // ...t({ padding: 2, ':hover': {}, [media.sm.only]: { padding: 4 }}),
  // ...t({ padding: 2, ':hover': {}, [media.sm.lte]: { padding: 4 }}),
  // ...t({ padding: 2, ':hover': {}, [media.sm.lge]: { padding: 4 }}),

  '[size=m]': {
    $container: {
      paddingX: 2,
      paddingY: 1,

      ':hover': {},

      '@sm': {
        paddingX: 4,
        paddingY: 2,
      },
    },

    '[alignment=icon-only]': {
      $container: {
        paddingX: 2,
        paddingY: 2,
      },
    },
  },

  '[size=s]': {
    $container: {
      paddingX: 2,
      paddingY: 1,
    },

    '[alignment=icon-only]': {
      $container: {
        paddingX: 1,
        paddingY: 2,
      },
    },
  },
})
