import { t } from '@toned/systems/base'
import { useStyles } from '@toned/react'

import { styles } from '@examples/shared/card'

import { Button } from './Button'

function Card() {
	const s = useStyles(styles)

	return (
		<div {...s.container}>
			<Button label={String(Math.random())} />

			<span {...t({ textColor: 'status_info' })}>
				Edit <span {...s.code}>src/App.tsx</span> and save to test HMR
			</span>
		</div>
	)
}

export default Card
