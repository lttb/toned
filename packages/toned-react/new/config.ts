import { version } from 'react'

import config18 from './config.18.ts'
import config19 from './config.19.ts'

export default Number.parseInt(version, 10) > 18 ? config19 : config18
