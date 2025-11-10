```tsx
const styles = stylesheet({
  ...stylesheet.state<{variant?: Variant; size?: Size; color?: Color}>,

  container: {
    flexLayout: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    style: {border: 'none'},
  },
  text: {},

  'text:hover': {
    container: {textColor: 'primary'},
  },

  '[variant=rounded]': {
    container: {borderRadius: 'Medium'},
  },

  '[size=medium]': {
    container: {
      paddingHorizontal: 'Large',
      paddingVertical: 'Medium',
    },
  },

  '[size=small]': {
    container: {
      paddingHorizontal: 'Medium',
      paddingVertical: 'XSmall',
    },
  },

  '[color=primary]': {
    container: {
      fillColor: 'BrandPrimaryDefault',
    },
    text: {textColor: 'OnFillBrandPrimaryDefault'},
  },

  '[color=primary][variant=accent]': {
    container: {
      fillColor: 'BrandPrimaryAccent',
    },
    text: {textColor: 'OnFillBrandPrimaryAccent'},
  },

  '[color=primary][variant=info]': {
    container: {
      fillColor: 'BrandPrimaryInfo',
    },
    text: {
      textColor: 'OnFillBrandPrimaryInfo',
      ':hover': {textColor: 'OnFillBrandPrimaryInfoHovered'},
      '@sm': {
        padding: 'small',
      },
    },
  },

  '@sm': {
    text: {
      /* ... */
    },
    container: {
      /* ... */
    },
  },
})
```

```tsx
const styles = stylesheet({
  container: {
    flexLayout: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    style: {border: 'none'},
  },
  text: {},
}).variants<{
  variant?: Variant
  size?: Size
  color?: Color
}>(
  {variant: 'rounded', container: {borderRadius: 'Medium'}},

  {
    'text:hover': {
      container: {textColor: 'primary'},
    },
  },

  {
    '@sm': {
      text: {
        /* ... */
      },
      container: {
        /* ... */
      },
    },
  },

  {
    size: 'medium',

    container: {
      paddingHorizontal: 'Large',
      paddingVertical: 'Medium',
    },
  },

  {
    size: 'small',

    container: {
      paddingHorizontal: 'Medium',
      paddingVertical: 'XSmall',
    },
  },

  {
    color: 'primary',

    container: {
      fillColor: 'BrandPrimaryDefault',
    },
    text: {textColor: 'OnFillBrandPrimaryDefault'},
  },

  {
    color: 'primary',
    variant: 'accent',

    container: {
      fillColor: 'BrandPrimaryAccent',
    },
    text: {textColor: 'OnFillBrandPrimaryAccent'},
  },

  {
    color: 'primary',
    variant: 'info',

    container: {
      fillColor: 'BrandPrimaryInfo',
    },
    text: {
      textColor: 'OnFillBrandPrimaryInfo',
      ':hover': {textColor: 'OnFillBrandPrimaryInfoHovered'},
      '@sm': {
        padding: 'small',
      },
    },
  },
)
```

```tsx
const styles = stylesheet({
  container: {
    flexLayout: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    style: {border: 'none'},
  },
  text: {},
})
  .variant({variant: 'rounded'}, {container: {borderRadius: 'Medium'}})
  .variant(
    {
      size: 'medium',
    },

    {
      container: {
        paddingHorizontal: 'Large',
        paddingVertical: 'Medium',
      },
    },
  )
  .variant(
    {
      color: 'primary',
      variant: 'accent',
    },
    {
      container: {
        fillColor: 'BrandPrimaryAccent',
      },
      text: {textColor: 'OnFillBrandPrimaryAccent'},
    },
  )
  .variant(
    {
      color: 'primary',
      variant: 'info',
    },
    {
      container: {
        fillColor: 'BrandPrimaryInfo',
      },
      text: {
        textColor: 'OnFillBrandPrimaryInfo',
        ':hover': {textColor: 'OnFillBrandPrimaryInfoHovered'},
        '@media.sm': {
          padding: 'small',
        },
      },
    },
  )
  .variant(
    {
      color: 'primary',
      variant: 'info',
      // can be matched in the selector
      '@media': 'sm',
    },
    {
      container: {
        padding: 'small',
      },
    },
  )
```
