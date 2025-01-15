import '@runor/react/config'
import '@runor/themes/shadcn/config.css'
import './index.css'

import { Suspense, lazy } from 'react'

// Works also with SSR as expected
const Card = lazy(() => import('./Card'))

function App() {
	return (
		<main>
			<h1>Vite + React</h1>

			<Suspense fallback={<p>Loading card component...</p>}>
				<Card />
			</Suspense>
		</main>
	)
}

export default App
