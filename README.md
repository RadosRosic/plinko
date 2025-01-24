# PLINKO

### `npm install`

### `npm start`

### send http request to /play

### mandatory params are `rows`, `difficultyLevel`, and `bet`

### `rows` must be between 8 and 16

### `difficulty` must be between 0 and 2

### `bet` must be between 0.1 and 100

## Simulation

### To run the simulation use `npm run test`

### `npm run test` order of params: `numGames`, `rows`, `difficultyLevel`, `bet`, `batchSize`, `outputFile`.

### For example `npm run test 100000 16 2 50 1000` will run 100k games with 16 rows on difficulty level 2, using a bet of 50, in batches of 1000 games. `outputFile` is omitted and will use the default value.
