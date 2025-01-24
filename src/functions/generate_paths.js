export function generatePaths(rows) {
  const allPaths = []

  function traverse(row = 0, col = 0, currentPath = []) {
    currentPath.push(col)

    if (row === rows) {
      allPaths.push([...currentPath])
      return
    }

    traverse(row + 1, col, [...currentPath])
    traverse(row + 1, col + 1, [...currentPath])
  }

  traverse()
  return allPaths
}
