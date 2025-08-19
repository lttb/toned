import '@toned/react/config'
import '@toned/themes/shadcn/config.css'

import { defineContext, TokensContext } from '@toned/react/ctx'
import shadcn from '@toned/themes/shadcn/config'

import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View } from 'react-native'

import Card from './Card'

const ctx = defineContext(shadcn)

const Main = () => {
  return (
    <View style={styles.container}>
      <TokensContext.Provider value={ctx}>
        <Card />
      </TokensContext.Provider>
      <StatusBar style="auto" />
    </View>
  )
}

export default function App() {
  return <Main />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
