import fs from "fs/promises"
import {
  PORT,
  MIN_ROWS,
  MAX_ROWS,
  MIN_DIFFICULTY,
  MAX_DIFFICULTY,
  MIN_BET,
  MAX_BET,
} from "../src/constants.js"
import { roundValue } from "../src/functions/round_value.js"

async function runSimulation({
  numGames = 10000,
  rows = 16,
  difficultyLevel = 1,
  bet = 100,
  batchSize = 100,
  outputFile = `./test/simulations/simulation_${Date.now()}_${rows}_${difficultyLevel}.json`,
}) {
  console.log({
    numGames,
    rows,
    difficultyLevel,
    bet,
    batchSize,
    outputFile,
  })

  const summary = {
    totalGames: numGames,
    totalWagered: 0,
    totalWon: 0,
    maxWin: 0,
    minWin: Infinity,
    multiplierHits: {},
    multiplierPercentages: {},
  }

  if (!rows || rows < MIN_ROWS || rows > MAX_ROWS) {
    console.error(
      `Invalid rows. Value must be between ${MIN_ROWS} and ${MAX_ROWS}.`
    )
    return
  }

  if (difficultyLevel < MIN_DIFFICULTY || difficultyLevel > MAX_DIFFICULTY) {
    console.error(
      `Invalid difficulty. Value must be between ${MIN_DIFFICULTY} and ${MAX_DIFFICULTY}.`
    )
    return
  }

  if (!bet || bet < MIN_BET || bet > MAX_BET) {
    console.error(
      `Invalid bet. Value must be between ${MIN_BET} and ${MAX_BET}.`
    )
    return
  }

  console.log(`Starting simulation of ${numGames} games...`)
  console.time("Simulation Duration")

  for (let i = 0; i < numGames; i += batchSize) {
    const currentBatch = Math.min(batchSize, numGames - i)
    const batchPromises = Array(currentBatch)
      .fill()
      .map(() =>
        fetch(`http://localhost:${PORT}/play`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rows,
            difficultyLevel,
            bet,
          }),
        }).then((res) => res.json())
      )

    try {
      const batchResults = await Promise.all(batchPromises)

      batchResults.forEach((result) => {
        summary.totalWagered += bet
        summary.totalWon += result.win
        summary.maxWin = Math.max(summary.maxWin, result.win)
        summary.minWin = Math.min(summary.minWin, result.win)

        summary.multiplierHits[result.multiplier] =
          (summary.multiplierHits[result.multiplier] || 0) + 1
      })

      if (
        (i + batchSize) % (batchSize * 10) === 0 ||
        i + batchSize >= numGames
      ) {
        console.log(`Processed ${Math.min(i + batchSize, numGames)} games...`)
      }
    } catch (error) {
      console.error("Error processing batch:", error)
      continue
    }
  }

  summary.returnToPlayer = (summary.totalWon / summary.totalWagered) * 100

  Object.entries(summary.multiplierHits).forEach(([multiplier, hits]) => {
    summary.multiplierPercentages[multiplier] = roundValue(
      (hits / numGames) * 100,
      4
    )
  })

  const sortedMultiplierStats = Object.entries(summary.multiplierHits)
    .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
    .map(([multiplier, hits]) => {
      return {
        multiplier,
        hits,
        percentage: summary.multiplierPercentages[multiplier] + "%",
      }
    })

  const output = {
    configuration: {
      numGames,
      rows,
      difficultyLevel,
      bet,
    },
    summary: {
      totalGames: numGames,
      totalWagered: summary.totalWagered,
      totalWon: roundValue(summary.totalWon, 2),
      returnToPlayer: roundValue(summary.returnToPlayer, 4),
      maxWin: summary.maxWin,
      minWin: summary.minWin,
      multiplierStatistics: sortedMultiplierStats,
    },
  }

  await fs.writeFile(outputFile, JSON.stringify(output, null, 2))

  console.timeEnd("Simulation Duration")

  console.log("\nSimulation Results:")
  console.log(`Total Games: ${numGames}`)
  console.log(`Total Wagered: ${summary.totalWagered}`)
  console.log(`Total Won: ${summary.totalWon}`)
  console.log(`RTP: ${summary.returnToPlayer}%`)
  console.log(`Highest Win: ${summary.maxWin}`)
  console.log(`Lowest Win: ${summary.minWin}`)
  console.log("\nMultiplier Distribution:")

  sortedMultiplierStats.forEach((e) => {
    console.log(`${e.multiplier}x: ${e.hits} hits (${e.percentage})`)
  })

  console.log(`\nResults written to: ${outputFile}`)
}

const args = process.argv

const numGames = !isNaN(args[2]) ? +args[2] : undefined
const rows = !isNaN(args[3]) ? +args[3] : undefined
const difficultyLevel = !isNaN(args[4]) ? +args[4] : undefined
const bet = !isNaN(args[5]) ? +args[5] : undefined
const batchSize = !isNaN(args[6]) ? +args[6] : undefined
const outputFile = args[7]

runSimulation({
  numGames,
  rows,
  difficultyLevel,
  bet,
  outputFile,
  batchSize,
}).catch(console.error)
