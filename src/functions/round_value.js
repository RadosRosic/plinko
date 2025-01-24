export const roundValue = (num, decimals = 2) => {
  if (num === 0) {
    return 0
  }

  const factor = Math.pow(10, decimals)
  return Math.round((num + Number.EPSILON) * factor) / factor
}
