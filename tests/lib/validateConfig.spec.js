const validateConfig = require('../../lib/validateConfig')

describe('validateConfig', () => {
  const evolutionsConfig = {
    tableName: 'myEvolutions',
    runQuery: () => {},
    evolutionsFolderPath: ['ev'],
  }

  it('Validates correct config and modifies table format correctly', () => {
    expect(validateConfig(evolutionsConfig)).toStrictEqual(evolutionsConfig)

    expect(
      validateConfig({
        ...evolutionsConfig,
        evolutionsFolderPath: 'ev',
      }),
    ).toStrictEqual(evolutionsConfig)

    expect(
      validateConfig({
        ...evolutionsConfig,
        tableName: undefined,
        evolutionsFolderPath: undefined,
      }),
    ).toStrictEqual({
      ...evolutionsConfig,
      tableName: 'evolutions',
      evolutionsFolderPath: ['evolutions'],
    })
  })

  it('Throws error if table name is not string', () => {
    expect(() =>
      validateConfig({
        ...evolutionsConfig,
        tableName: () => {},
      }),
    ).toThrow()
  })

  it('Throws error when runQuery is not a function', () => {
    expect(() =>
      validateConfig({
        ...evolutionsConfig,
        runQuery: {},
      }),
    ).toThrow()
  })

  it('Throws error when evolutionPathFolder has non-strings in it', () => {
    expect(() =>
      validateConfig({
        ...evolutionsConfig,
        evolutionsFolderPath: ['ev', {}],
      }),
    ).toThrow()
  })
})
