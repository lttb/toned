import type { Breakpoints, TokenStyleDeclaration } from './types.ts'
import { camelToKebab } from './utils.ts'

export function getStyleNodeById(id: string): HTMLStyleElement | null {
  if (typeof document === 'undefined') {
    // support virtual stylesheet
    return null
  }

  let node = document.getElementById(id) as HTMLStyleElement
  if (!node) {
    node = document.createElement('style')
    node.id = id
    document.head.appendChild(node)
  }
  return node
}

const tokens = new Proxy(
  {},
  {
    get(_target, prop: string) {
      return `var(--${prop})`
    },
  },
)

export function generate<const s extends TokenStyleDeclaration>({
  breakpoints,
  ...system
}: s) {
  let styles = ''

  if (breakpoints) {
    const bpValues = breakpoints.__breakpoints

    let htmlStyles = ''
    let media = ''

    for (const [key, value] of Object.entries(bpValues)) {
      const varName = `--media-${key}`

      htmlStyles += `${varName}: initial;`
      media += `@media (min-width: ${value}px) { ${varName}: ; }`
    }

    styles += `html {${htmlStyles}}`
    styles += media
  }

  // handle custom tokens

  for (const key in system) {
    const token = system[key]

    if (!token) continue

    token.values.forEach((value: any) => {
      if (value instanceof Number || value instanceof String) {
        // TODO: support dynamic placeholders
        return
      }

      const result = token.resolve(value, tokens)

      if (!result) return

      let cssRule = ''

      for (const cssProp in result) {
        cssRule += `${camelToKebab(cssProp)}:${result[cssProp]};`
      }

      const ruleKey = `${key}_${value}`

      cssRule = `.${ruleKey}{${cssRule}}`

      styles += cssRule
    })
  }

  return styles
}

export function inject<
  const S extends
    | TokenStyleDeclaration
    | {
        breakpoints?: Breakpoints<any>
      },
>(system: S) {
  const sheet = getStyleNodeById('toned/main')

  if (!sheet) {
    return
  }

  const styles = generate(system as TokenStyleDeclaration)

  sheet.innerHTML = styles
}
