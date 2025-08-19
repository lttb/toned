import type { Config, Tokens } from './types'

const config: Config = {
  getTokens: (): Tokens => ({}),

  initRef: () => {},
  initInteraction: () => {},
}

export function getConfig(): Config {
  return config
}

export function setConfig(newConfig: Partial<typeof config>) {
  Object.assign(config, newConfig)
}
