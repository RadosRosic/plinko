import { MAX_ROWS, MIN_ROWS } from "../constants.js"
import { generatePaths } from "./generate_paths.js"

export const pathCache = new Map()

export function createPathCache(minRows = MIN_ROWS, maxRows = MAX_ROWS) {
  for (let rows = minRows; rows <= maxRows; rows++) {
    pathCache.set(rows, generatePaths(rows))
  }
}
