module.exports = function validateConfig(config) {
  const { tableName = 'evolutions', runQuery } = config
  let { evolutionsFolderPath = ['evolutions'] } = config
  if (typeof runQuery !== 'function') {
    throw Error('Invalid config: runQuery should be a function')
  }

  if (tableName !== undefined && typeof tableName !== 'string') {
    throw Error('Invalid config: table name should be a string')
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
    throw Error(
      'Invalid config: evolutionsFolderPath should be a string or Array<string>',
    )
  }

  return { tableName, runQuery, evolutionsFolderPath }
}
