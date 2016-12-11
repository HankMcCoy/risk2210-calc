import React, { Component } from 'react'
import {
	VictoryAxis,
	VictoryBar,
	VictoryChart,
} from 'victory'

import simulate from './simulate'
import './App.css'

class App extends Component {
	constructor() {
		super()

		this.state = {
			attackMods: 4,
			attackCommanders: 1,
			defenseMods: 3,
			defenseCommanders: 0,
			hasSpaceStation: false,
			result: null,
		}
	}

	render() {
		const { result } = this.state

		return (
			<FlexRoot>
				<Flex>
					<FlexRoot direction="column">
						<Flex>
							<h2>Attackers</h2>
							<label>
								How many MODs?
								{this.renderBoundNumber('attackMods')}
							</label>
							<label>
								How many Commanders?
								{this.renderBoundNumber('attackCommanders')}
							</label>
						</Flex>
						<Flex>
							<h2>Defenders</h2>
							<label>
								How many MODs?
								{this.renderBoundNumber('defenseMods')}
							</label>
							<label>
								How many Commanders?
								{this.renderBoundNumber('defenseCommanders')}
							</label>
							<label>
								Is there a Space Station?
								<input
									type="checkbox"
									checked={this.state.hasSpaceStation}
									onClick={() => {
										this.setState((state) => ({
											hasSpaceStation: !state.hasSpaceStation,
										}))
									}}
								/>
							</label>
						</Flex>
						<Flex>
							<button onClick={this.simulate}>Simulate</button>
						</Flex>
					</FlexRoot>
				</Flex>
				<Flex>
					{result && (
						<div style={{ maxWidth: '800px' }}>
							<h2>Expected Outcome</h2>
							<div>
								{result.average >= 0 ? 'Attacker ' : 'Defender '}
								wins {result.winPcnt.toFixed(2)}% of the time with an average
								of {Math.abs(result.average).toFixed(2)} pieces left.
							</div>
							<OutcomeChart outcomeCounts={result.outcomeCounts} />
						</div>
					)}
				</Flex>
			</FlexRoot>
		)
	}

	renderBoundNumber = (fieldName) => (
		<input
			type="number"
			value={this.state[fieldName]}
			onChange={(e) => {
				this.setState({
					[fieldName]: +e.target.value,
				})
			}}
		/>
	)

	simulate = () => {
		this.setState({
			result: simulate(this.state)
		})
	}
}

const OutcomeChart = ({ outcomeCounts }) => {
	const offset = outcomeCounts[0].outcome <= 0
		? -outcomeCounts[0].outcome + 1
		: 1
	const data = outcomeCounts.map((val) => ({
		outcome: val.outcome + offset,
		pcnt: val.pcnt,
	}))

	return (
		<VictoryChart domainPadding={20}>
			<VictoryAxis
				label="Survivors"
				tickFormat={(tick) => {
					const signedCount = tick - offset
					const count = Math.abs(signedCount)

					return `${count} ${signedCount > 0 ? 'attacker' : 'defender'}` +
					(count != 1 ? 's' : '')
				}}
				style={{
					axisLabel: { fontSize: 10 },
					tickLabels: { fontSize: 8 },
				}}
			/>
			<VictoryAxis
				label="% chance"
				dependentAxis
				style={{
					axisLabel: { fontSize: 10 },
					tickLabels: { fontSize: 8 },
				}}
			/>
			<VictoryBar
				data={data}
				x="outcome"
				y="pcnt"
			/>
		</VictoryChart>
	)
}

const FlexRoot = ({ children, direction }) => (
	<div
		style={{
			display: 'flex',
			flexDirection: direction,
		}}
	>
		{children}
	</div>
)

const Flex =  ({ children, grow, shrink, basis }) => {
	const def = (val, defVal) => val != null ? val : defVal
	return (
		<div
			style={{
				flex: `${def(grow, 1)} ${def(shrink, 1)} ${def(basis, '0%')}`
			}}
		>
			{children}
		</div>
	)
}

export default App
