import { use } from 'react'
import { TokensContext, defineContext } from '@toned/react/ctx.native'
import shadcn from '@toned/themes/shadcn/config'
import { setConfig } from '@toned/core'

import { Body, Html } from '@react-email/components'

import Card from './Card'

const ctx = defineContext(shadcn)

setConfig({
	getTokens() {
		return use(TokensContext)
	},
})

const Main = () => {
	return (
		<TokensContext.Provider value={ctx}>
			<Html>
				<Body>
					<Card />
				</Body>
			</Html>
		</TokensContext.Provider>
	)
}

export default function App() {
	return <Main />
}
