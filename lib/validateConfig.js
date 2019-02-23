const { Red } = require('./colors')

module.exports = function validateConfig(config) {
  const { tableName = 'evolutions', runQuery } = config
  let { evolutionsFolderPath = ['evolutions'] } = config
  if (typeof runQuery !== 'function') {
    console.error(Red, 'Invalid config: runQuery should be a function')
    process.exit(1)
  }

  if (tableName !== undefined && typeof tableName !== 'string') {
    console.error(Red, 'Invalid config: table name should be a string')
    process.exit(1)
  }

  if (!Array.isArray(evolutionsFolderPath)) {
    evolutionsFolderPath = [evolutionsFolderPath]
  }

  if (
    !evolutionsFolderPath.reduce(
      (carry, pathChunk) => carry && typeof pathChunk === 'string',
      true,
    )
  ) {
    console.error(
      Red,
      'Invalid config: evolutionsFolderPath should be a string or Array<string>',
    )
    process.exit(1)
  }

  return { tableName, runQuery, evolutionsFolderPath }
}
