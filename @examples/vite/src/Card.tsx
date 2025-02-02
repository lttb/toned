import { stylesheet, t } from '@toned/systems/base'

import { Button } from './Button'

const s = stylesheet({
	container: { bgColor: 'default' },
	button: {
		bgColor: 'action',
		textColor: 'on_action',
		paddingX: 4,
		paddingY: 2,
		borderRadius: 'medium',
		borderWith: 'none',
		typo: 'label_medium',
	},
	code: { textColor: 'destructive' },
})

function Card() {
	return (
		<div {...s.container}>
			<Button label="click" />

			<p {...t({ textColor: 'status_info' })}>
				Edit <code {...s.code}>src/App.tsx</code> and save to test HMR
			</p>
		</div>
	)
}

export default Card
