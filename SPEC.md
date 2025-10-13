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
