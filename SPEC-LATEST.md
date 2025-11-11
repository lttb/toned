```ts
const styles = stylesheet({
  label: {
    /* tokens */,

    ':hover': { /* tokens * /}, // can have flat pseudo classes
    '@sm': { /* tokens */ }, // can have flat breakpoints or other media rules (eg '@web'). can be potentially extended like '@sm.only'
  },

  container: { /* tokens */ },

  // now, cross element styles a flat, can be chained like :focus:hover
  'container:hover': {
    container: {},

    label: {},
  }
}).variants<{size: Size, variant: Variant}>({
  // variants are now separate and flat

  '[size=sm]': {
    container: {}, // no need for $ syntax
    label: {},
   },

  // no nesting
  '[size=sm][variant=accent]': {}
})
```

`t` function

```ts
<div {...t({
  /* tokens */,

  ':hover': { /* tokens * /},
  ':hover:focus': { /* tokens */ },
  '@sm': { /* tokens */ },
}} />
```
