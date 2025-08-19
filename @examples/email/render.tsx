import { write } from 'bun'
import { renderToString } from 'react-dom/server'

import App from './App.tsx'

const stream = renderToString(<App />)
await write(`${__dirname}/example.html`, stream)
