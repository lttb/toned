// required for types portability
export const sym = <N extends string>(name: N) =>
  Symbol.for(`@toned/core/${name}`) as unknown as N
