import type { Tokens } from './types'

const config = {
	getTokens: (): Tokens => ({}),

	initRef: () => {},
	initInteraction: () => {},
}

export function getConfig(): Readonly<typeof config> {
	return config
}

export function setConfig(newConfig: Partial<typeof config>) {
	Object.assign(config, newConfig)
}
