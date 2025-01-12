import { useState } from 'react'

import { t } from '@examples/vite/zoru'

function Card() {
	const [count, setCount] = useState(0)

	return (
		<div {...t({ bgColor: 'default' })}>
			<button type="button" onClick={() => setCount((count) => count + 1)}>
				count is {count}
			</button>

			<p>
				Edit <code>src/App.tsx</code> and save to test HMR
			</p>
		</div>
	)
}

export default Card
