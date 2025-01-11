import { Suspense, lazy } from 'react'

// Works also with SSR as expected
const Card = lazy(() => import('./Card'))

function App() {
  return (
    <>
      <h1>Vite + React</h1>

      <Suspense fallback={<p>Loading card component...</p>}>
        <Card />
      </Suspense>

      <p>Click on the Vite and React logos to learn more</p>
    </>
  )
}

export default App
