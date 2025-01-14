import { Suspense, lazy } from 'react'

//import { TokensContext } from 'runor/react'
//import shadcnTokens from '../runor.shadcn'

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
