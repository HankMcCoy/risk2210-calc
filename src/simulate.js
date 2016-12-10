import _ from 'lodash'

const NUM_TRIALS = 1000

export default function simulate(opts) {
	const trialOutcomes = new Array(NUM_TRIALS)
	for (var i = 0; i < NUM_TRIALS; i++) {
		trialOutcomes[i] = runBattle(opts)
	}

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

	const attackRolls = getRolls(attackDice)
	const defenseRolls = getRolls(defenseDice)

	const casualties = getCasualties(attackRolls, defenseRolls)

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

	return {
		average: troopCountOutcomes.reduce((sum, x) => sum + (x / NUM_TRIALS), 0),
		outcomeCounts: uniqueTroopCountOutcomes.map(
			(troopCountOutcome) => ({
				outcome: troopCountOutcome,
				count: troopCountOutcomeCounts[troopCountOutcome],
			})
		)
	}
}

/* UTIL METHODS */
const maxDice = {
	attack: 3,
	defense: 2,
}
const getDice = (troopCounts, side) => {
	// Defenders always roll 8s if they have a space station
	if (side === 'defense' && troopCounts.hasSpaceStation) {
		const numDice = Math.max(
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
