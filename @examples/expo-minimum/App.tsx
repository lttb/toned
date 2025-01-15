import { TokensContext, defineContext } from '@runor/core/ctx'
import shadcn from '@runor/themes/shadcn/config'

import { StatusBar } from 'expo-status-bar'
import React from 'react'
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
