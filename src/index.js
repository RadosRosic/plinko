import express from "express"
import MersenneTwister from "mersenne-twister"
import {
  PORT,
  MULTIPLIERS,
  DIFFICULTY_LEVELS,
  MIN_ROWS,
  MIN_DIFFICULTY,
  MAX_DIFFICULTY,
  MIN_BET,
  MAX_BET,
  MAX_ROWS,
} from "./constants.js"
import { getRandomPath } from "./functions/get_random_path.js"
import { createPathCache } from "./functions/create_path_cache.js"
import { roundValue } from "./functions/round_value.js"

createPathCache()

const generator = new MersenneTwister()

const app = express()
app.use(express.json())

app.post("/play", (req, res) => {
  const { rows, difficultyLevel, bet } = req.body

  if (!rows || rows < MIN_ROWS || rows > MAX_ROWS) {
    return res.status(400).json({
      error: `Invalid rows. Value must be between ${MIN_ROWS} and ${MAX_ROWS}.`,
    })
  }

  if (difficultyLevel < MIN_DIFFICULTY || difficultyLevel > MAX_DIFFICULTY) {
    return res.status(400).json({
      error: `Invalid difficulty. Value must be between ${MIN_DIFFICULTY} and ${MAX_DIFFICULTY}.`,
    })
  }

  if (!bet || bet < MIN_BET || bet > MAX_BET) {
    return res.status(400).json({
      error: `Invalid bet. Value must be between ${MIN_BET} and ${MAX_BET}.`,
    })
  }

  try {
    const difficulty = DIFFICULTY_LEVELS[difficultyLevel]
    const path = getRandomPath(generator, rows)
    const finalLocation = path.at(-1)
    const multiplier = MULTIPLIERS[difficulty][rows - MIN_ROWS][finalLocation]
    const win = roundValue(bet * multiplier)

    res.status(200).json({ win, path, finalLocation, multiplier })
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" })
  }
})

app.listen(PORT, () => {
  console.log(`Plinko is running on port: ${PORT}`)
})
