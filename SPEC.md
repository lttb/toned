```ts
const styles = stylesheet({
  ...stylesheet.state<{variant: 'normal' | 'accent'; size: 'medium' | 'large'}>,

  container: {
    padding: 'large',
  },

  base: {
    textColor: 'primary',
    bgColor: 'surface',
  },

  label: {
    composes: ['base'],

    ':hover': {textColor: 'secondary'},

    '@sm': {padding: 'medium'},
  },

  '[variant=normal]': {
    label: {},

    base: {},
  },

  '[variant=normal|size=large]': {
    label: {},

    base: {},
  },
})
```

```ts
const styles = stylesheet({
  ...stylesheet.state<{variant: 'normal' | 'accent'; size: 'medium' | 'large'}>,

  container: {
    padding: 'large',
  },

  label: {
    textColor: 'primary',

    ':hover': {
      textColor: 'secondary',
    },

    '[variant=normal]': {
      /* ... */
    },

    '[@media=sm]': {
      /* ... */
    },
  },

  '[variant=normal]': {
    $container: {
      /* ... */
    },
    $label: {
      /* ... */
    },
  },

  '[@media=sm]': {
    $container: {
      /* ... */
    },
    $label: {
      /* ... */
    },
  },
})
```

```ts
const styles = stylesheet({
  ...stylesheet.state<{variant: 'normal' | 'accent'; size: 'medium' | 'large'}>,

  container: {
    padding: 'large',
  },

  label: {
    textColor: 'primary',

    ':hover': {
      textColor: 'secondary',
    },

    '[variant=normal]': {
      /* ... */
    },

    '@media.sm': {
      /* ... */
    },
  },

  '[variant=normal]': {
    $container: {
      /* ... */
    },
    $label: {
      /* ... */
    },
  },

  '@media.sm': {
    $container: {
      /* ... */
    },
    $label: {
      /* ... */
    },
  },
})
```

```ts
const styles = stylesheet({
  ...stylesheet.state<{variant: 'normal' | 'accent'; size: 'medium' | 'large'}>,

  container: {
    padding: 'large',
  },

  label: {
    textColor: 'primary',

    ':hover': {
      textColor: 'secondary',
    },

    '[variant=normal]': {
      /* ... */
    },

    sm: {
      /* ... */
    },
  },

  '[variant=normal]': {
    $container: {
      /* ... */
    },
    $label: {
      /* ... */
    },
  },

  sm: {
    $container: {
      /* ... */
    },
    $label: {
      /* ... */
    },
  },
})
```

```ts
const styles = stylesheet({
  ...stylesheet.state<{variant: 'normal' | 'accent'; size: 'medium' | 'large'}>,

  $container: {
    padding: 'large',
  },

  $label: {
    textColor: 'primary',

    ':hover': {
      textColor: 'secondary',
    },

    _variant_normal: {
      /* ... */
    },

    _media_sm: {
      /* ... */
    },
  },

  '$label:hover': {
    $container: {
      /* ... */
    },
    $label: {
      /* ... */
    },
  },

  _variant_normal: {
    $container: {
      /* ... */
    },
    $label: {
      /* ... */
    },
  },

  _media_sm: {
    $container: {
      /* ... */
    },
    $label: {
      /* ... */
    },
  },
})
```

```ts
const styles = stylesheet({
  ...stylesheet.state<{variant: 'normal' | 'accent'; size: 'medium' | 'large'}>,

  container: {
    padding: 'large',
  },

  label: {
    textColor: 'primary',

    ':hover': {
      textColor: 'secondary',
    },

    _variant_normal: {
      /* ... */
    },

    _media_sm: {
      /* ... */
    },
  },

  _variant_normal: {
    $container: {
      /* ... */
    },
    $label: {
      /* ... */
    },
  },

  _media_sm: {
    $container: {
      /* ... */
    },
    $label: {
      /* ... */
    },
  },
})
```
