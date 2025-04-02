import '@toned/themes/shadcn/config.css'

import { TokensContext, defineContext } from '@toned/react/ctx.native'
import shadcn from '@toned/themes/shadcn/config'
import { setConfig } from '@toned/core'

import { Document, Page } from '@react-pdf/renderer'

import Card from './Card'

const ctx = defineContext(shadcn)

setConfig({
	getTokens() {
		return ctx
	},
})

const Main = () => {
	return (
			<Document>
				<Page size="A4">
					<Card />
				</Page>
			</Document>
	)
}

export default function App() {
	return <Main />
}
