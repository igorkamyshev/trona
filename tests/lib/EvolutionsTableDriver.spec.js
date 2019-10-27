const EvolutionTableDriver = require('../../lib/EvolutionTableDriver')

describe('EvolutionTableDriver', () => {
  const tableDriver = new EvolutionTableDriver(query => query, 'evolutions')
  it('runs getEvolutions', () => {
    expect(tableDriver.getEvolutions()).toBe(
      'SELECT id, checksum, down_script FROM evolutions ORDER BY id ASC;',
    )
  })
  it('runs removeEvolutionRecord', () => {
    expect(tableDriver.removeEvolutionRecord(21)).toBe(
      'DELETE FROM evolutions WHERE id = 21;',
    )
  })
  it('runs createEvolutionRecord', () => {
    expect(
      tableDriver.createEvolutionRecord(
        21,
        'checksum',
        "some script in need of 'escapes'",
      ),
    ).toBe(
      "INSERT INTO evolutions (id, checksum, down_script) VALUES (21, 'checksum', 'some script in need of ''escapes''');",
    )
  })
  it('runs updateEvolution', () => {
    expect(
      tableDriver.updateEvolution(
        21,
        'checksum',
        "some script in need of 'escapes'",
      ),
    ).toBe(
      "UPDATE evolutions SET checksum = 'checksum', down_script = 'some script in need of ''escapes''' WHERE id = 21;",
    )
  })
})
