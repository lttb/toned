import { lazy, StrictMode } from 'react'
import {
  type RenderToPipeableStreamOptions,
  renderToPipeableStream,
} from 'react-dom/server'

const App = lazy(() => import('./App.tsx'))

export function render(_url: string, options?: RenderToPipeableStreamOptions) {
  return renderToPipeableStream(
    <StrictMode>
      <App />
    </StrictMode>,
    options,
  )
}
