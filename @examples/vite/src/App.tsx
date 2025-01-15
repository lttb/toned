import '@runor/react/config'
import '@runor/themes/shadcn/config.css'
import './index.css'

import { Suspense, lazy } from 'react'
import { t } from '@runor/systems/base'

// Works also with SSR as expected
const Card = lazy(() => import('./Card'))

function App() {
	return (
		<main>
			<h1 {...t({ typo: 'heading_1' })}>Vite + React</h1>

			<Suspense fallback={<p>Loading card component...</p>}>
				<Card />
			</Suspense>
		</main>
	)
}

export default App
