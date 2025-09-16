import '@toned/themes/shadcn/config.css'

import { defineConfig, setConfig } from '@toned/core'

import { insert } from '@toned/core/dom'
import reactConfig from '@toned/react/new/react-web'
import { system } from '@toned/systems/base'

insert(system)

// should be preset for the framework?
// also add options to process css-variables/native/tailwind etc

export default setConfig(defineConfig({ ...reactConfig, useClassName: true }))
