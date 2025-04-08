import ReactPDF from '@react-pdf/renderer'

import App from './App.tsx'

ReactPDF.render(<App />, `${__dirname}/example.pdf`)
