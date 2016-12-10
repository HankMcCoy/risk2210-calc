import React, { Component } from 'react'

import simulate from './simulate'
import './App.css'

class App extends Component {
	constructor() {
		super()

		this.state = {
			attackMods: 0,
			attackCommanders: 0,
			defenseMods: 0,
			defenseCommanders: 0,
			hasSpaceStation: false,
			result: null,
		}
	}

	render() {
		return (
			<div>
				<FlexRoot>
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
				</FlexRoot>
				<div>
					<button onClick={this.simulate}>Simulate</button>
				</div>
				<div>
					{JSON.stringify(this.state.results)}
				</div>
			</div>
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
			results: simulate(this.state)
		})
	}
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
