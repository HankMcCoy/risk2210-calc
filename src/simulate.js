import _ from 'lodash'

const NUM_TRIALS = 50000
const log = _.noop //console.log

export default function simulate(opts) {
	const trialOutcomes = new Array(NUM_TRIALS)
	for (var i = 0; i < NUM_TRIALS; i++) {
		trialOutcomes[i] = runBattle(opts)
	}

log('outcomes', trialOutcomes)

	return calculateAnalysis(trialOutcomes)
}

function runBattle(troopCounts) {
	// Roll the dice and get the new troop counts
	const nextTroopCounts = runRoll(troopCounts)

	return bothSidesHaveTroopsLeft(nextTroopCounts)
		? runBattle(nextTroopCounts)
		: nextTroopCounts
}

function runRoll(troopCounts) {
	// Get the number and type of dice for each side
	const attackDice = getDice(troopCounts, 'attack')
	const defenseDice = getDice(troopCounts, 'defense')
log('attack dice', attackDice)
log('defense dice', defenseDice)

	const attackRolls = getRolls(attackDice)
	const defenseRolls = getRolls(defenseDice)
log('attack rolls', attackRolls)
log('defense rolls', defenseRolls)

	const casualties = getCasualties(attackRolls, defenseRolls)
log('casualties', casualties)

	return getNextTroopCounts(troopCounts, casualties)
}

function calculateAnalysis(trialOutcomes) {
	const troopCountOutcomes = trialOutcomes.map(getSignedTroopCount)
	const uniqueTroopCountOutcomes = _.sortBy(_.uniq(troopCountOutcomes))
	const troopCountOutcomeCounts = troopCountOutcomes
		.reduce(
			function incrementCount(counts, signedCount) {
				counts[signedCount] = (counts[signedCount] || 0) + 1
				return counts
			},
			{}
		)

	const results = {
		average: troopCountOutcomes.reduce((sum, x) => sum + (x / NUM_TRIALS), 0),
		outcomeCounts: uniqueTroopCountOutcomes.map(
			(troopCountOutcome) => ({
				outcome: troopCountOutcome,
				pcnt: troopCountOutcomeCounts[troopCountOutcome] / NUM_TRIALS * 100,
			})
		)
	}
	results.winPcnt = results.outcomeCounts.reduce(
		(winPcnt, outcomeCount) => {
			if (results.average >= 0) {
				if (outcomeCount.outcome >= 0) {
					return winPcnt + outcomeCount.pcnt
				}
			} else {
				if (outcomeCount.outcome < 0) {
					return winPcnt + outcomeCount.pcnt
				}
			}

			return winPcnt
		},
		0
	)

log(results)

	return results
}

/* UTIL METHODS */
const maxDice = {
	attack: 3,
	defense: 2,
}
const getDice = (troopCounts, side) => {
	// Defenders always roll 8s if they have a space station
	if (side === 'defense' && troopCounts.hasSpaceStation) {
		const numDice = Math.min(
			numTroopsLeft(troopCounts, 'defense'),
			maxDice.defense
		)

		return new Array(numDice).fill({ size: 8 })
	}

	return []
		.concat(
			new Array(troopCounts[side + 'Commanders']).fill({ size: 8 }),
			new Array(troopCounts[side + 'Mods']).fill({ size: 6 }),
		)
		.slice(0, maxDice[side])
}

const getRolls = (dice) => dice
	.map((die) => Math.ceil(Math.random() * die.size))
	.sort()
	.reverse()

const getCasualties = (attackRolls, defenseRolls) => {
	const minLength = Math.min(attackRolls.length, defenseRolls.length)
	const casualties = {
		attack: 0,
		defense: 0,
	}

	for (var i = 0; i < minLength; i++) {
		if (attackRolls[i] > defenseRolls[i]) {
			casualties.defense += 1
		} else {
			casualties.attack += 1
		}
	}

	return casualties
}

const getNextTroopCounts = (troopCounts, casualties) => {
	const getNextTroopCountsFor = (side) => {
		const nextModCount = troopCounts[side + 'Mods'] - casualties[side]
		const prevCommanderCount = troopCounts[side + 'Commanders']

		if (nextModCount >= 0) {
			return {
				[side + 'Mods']: nextModCount,
				[side + 'Commanders']: prevCommanderCount,
			}
		} else {
			const commanderCasualties = -nextModCount
			return {
				[side + 'Mods']: 0,
				[side + 'Commanders']: Math.max(
					prevCommanderCount - commanderCasualties,
					0
				)
			}
		}
	}

	return {
		...getNextTroopCountsFor('attack'),
		...getNextTroopCountsFor('defense'),
		hasSpaceStation: troopCounts.hasSpaceStation
	}
}

const numTroopsLeft = (troopCounts, side) =>
	troopCounts[side + 'Mods'] + troopCounts[side + 'Commanders']

const hasTroopsLeft = (troopCounts, side) => numTroopsLeft(troopCounts, side) > 0

const bothSidesHaveTroopsLeft = (troopCounts) =>
	hasTroopsLeft(troopCounts, 'attack') && hasTroopsLeft(troopCounts, 'defense')

const getSignedTroopCount = (troopCounts) =>
	numTroopsLeft(troopCounts, 'attack') - numTroopsLeft(troopCounts, 'defense')
