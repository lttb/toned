import { useState } from 'react'

import { stylesheet } from '@zoru/systems/base'
import { useStyles } from 'zoru/react'

const styles = stylesheet({
	container: { bgColor: 'default' },
	button: {
		bgColor: 'action',
		textColor: 'on_action',
		paddingX: 4,
		paddingY: 2,
		borderRadius: 'medium',
		borderWith: 'none',
	},
	code: { textColor: 'destructive' },
})

function Card() {
	const s = useStyles(styles)
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

			<p {...s.t({ textColor: 'action' })}>
				Edit <code {...s.code}>src/App.tsx</code> and save to test HMR
			</p>
		</div>
	)
}

export default Card
