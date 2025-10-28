import { writeFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

import App from './App.tsx'

const stream = renderToString(createElement(App))
await writeFile(`${__dirname}/example.html`, stream)
