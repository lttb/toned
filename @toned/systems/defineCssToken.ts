import { defineToken } from '@toned/core'
import type { Tokens } from '@toned/core/types'
import type { CSSProperties } from 'react'

export const defineCssToken = <const Values extends Readonly<any[]>>(
  propName: keyof CSSProperties | Array<keyof CSSProperties>,
  values: Values,
  getValue?: (value: Values[number], tokens: Tokens) => string | number,
) => {
  return defineToken({
    values,
    resolve: (value, tokens) => {
      const v = getValue ? getValue(value, tokens) : value

      if (!Array.isArray(propName)) {
        return {
          [propName]: v,
        }
      }

      return Object.fromEntries(propName.map((name) => [name, v]))
    },
  })
}
