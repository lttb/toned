import { renderToString } from 'react-dom/server'
import { write } from 'bun'

import App from './App.tsx'

const stream = renderToString(<App />)
await write(`${__dirname}/example.html`, stream)
