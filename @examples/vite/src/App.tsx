import { Suspense, lazy } from 'react'

import '../zoru.css'

//import { TokensContext } from 'zoru/react'
//import shadcnTokens from '../zoru.shadcn'

// Works also with SSR as expected
const Card = lazy(() => import('./Card'))

function App() {
	return (
		<>
			<h1>Vite + React</h1>

			<Suspense fallback={<p>Loading card component...</p>}>
				<Card />
			</Suspense>
		</>
	)
}

export default App
