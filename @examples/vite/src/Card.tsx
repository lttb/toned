import { useState } from 'react'

import { stylesheet, t } from '@runor/systems/base'
import { useStyles } from '@runor/react'

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
	code: t({ textColor: 'destructive' }),
})

const test = {
	p: t({ textColor: 'status_info' }),
}

function Card() {
	const s = useStyles(styles)
	const s2 = useStyles(test)
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

			<p {...s2.p}>
				Edit <code {...s.code}>src/App.tsx</code> and save to test HMR
			</p>
		</div>
	)
}

export default Card
