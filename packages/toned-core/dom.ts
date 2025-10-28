import type { TokenConfig } from './types.ts'

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

const camelToKebabRe = /([a-z0-9]|(?=[A-Z]))([A-Z])/g
function camelToKebab(str: string): string {
  return str.replace(camelToKebabRe, '$1-$2').toLowerCase()
}

export function insert<const S extends Record<string, TokenConfig<any, any>>>(
  system: S,
) {
  const sheet = getStyleNodeById('toned/main')

  let styles = ''

  for (const key in system) {
    const token = system[key]

    token?.values.forEach((value: any) => {
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

  if (sheet) {
    sheet.innerHTML = styles
  }

  // console.log(styles)
}
