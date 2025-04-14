import type { Tokens, Config } from './types'

const config: Config = {
	getTokens: (): Tokens => ({}),
}

export function getConfig(): Config {
	return config
}

export function setConfig(newConfig: Partial<typeof config>) {
	Object.assign(config, newConfig)
}
