import config from '@config/build/rollup.config'
import copy from 'rollup-plugin-copy'
import { createTransform } from 'rollup-copy-transform-css'

export default config({
	input: ['./shadcn/config.ts'],
	plugins: [
		copy({
			targets: [
				{
					src: 'shadcn/config.css',
					dest: 'dist/shadcn/',
					transform: createTransform({ inline: true, minify: true }),
				},
			],
		}),
	],
})
