// required for types portability
export const sym = <N extends string>(name: N) =>
  Symbol.for(`@toned/core/${name}`) as unknown as N

const camelToKebabRe = /([a-z0-9]|(?=[A-Z]))([A-Z])/g
export function camelToKebab(str: string): string {
  return str.replace(camelToKebabRe, '$1-$2').toLowerCase()
}
