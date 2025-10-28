import { styles } from '@examples/shared/card'
import { Text, View } from '@react-pdf/renderer'
import { useStyles } from '@toned/react'
import { t } from '@toned/systems/base'

import { Button } from './Button.js'

function Card() {
  const s = useStyles(styles)

  return (
    <View {...s.container}>
      <Button label={String(Math.random())} />

      <Text {...t({ textColor: 'status_info' })}>
        Edit <Text {...s.code}>src/App.tsx</Text> and save to test HMR
      </Text>
    </View>
  )
}

export default Card
