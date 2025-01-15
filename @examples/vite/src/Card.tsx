import { useState } from 'react'

import { stylesheet, t } from '@runor/systems/base'

const s = stylesheet({
	container: { bgColor: 'default' },
	button: t({
		bgColor: 'action',
		textColor: 'on_action',
		paddingX: 4,
		paddingY: 2,
		borderRadius: 'medium',
		borderWith: 'none',
		typo: 'label_medium',
	}),
	code: { textColor: 'destructive' },
})

function Card() {
	const [count, setCount] = useState(0)

	return (
		<div {...s.container}>
			<button
				{...s.button}
				type="button"
				onClick={() => setCount((count) => count + 1)}
			>
				count is {count}
			</button>

			<p {...t({ textColor: 'status_info' })}>
				Edit <code {...s.code}>src/App.tsx</code> and save to test HMR
			</p>
		</div>
	)
}

export default Card
