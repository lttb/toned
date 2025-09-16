import { insert } from '@toned/core/dom'

import '@toned/themes/shadcn/config.css'
import './index.css'

import '../toned.config.ts'

import { system, t } from '@toned/systems/base'
import { lazy, Suspense } from 'react'

insert(system)

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
