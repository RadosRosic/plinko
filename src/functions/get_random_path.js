import { pathCache } from "./create_path_cache.js"

export function getRandomPath(generator, rows) {
  const paths = pathCache.get(rows)
  const randomIndex = Math.floor(generator.random() * paths.length)

  return paths[randomIndex]
}
