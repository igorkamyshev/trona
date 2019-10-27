class EvolutionTableDriver {
  constructor(runQuery, evolutionsTable) {
    this.runQuery = runQuery
    this.evolutionsTable = evolutionsTable
  }

  getEvolutions() {
    return this.runQuery(
      `SELECT id, checksum, down_script FROM ${this.evolutionsTable} ORDER BY id ASC;`,
    )
  }

  removeEvolutionRecord(id) {
    return this.runQuery(
      `DELETE FROM ${this.evolutionsTable} WHERE id = ${id};`,
    )
  }

  createEvolutionRecord(id, checksum, downScript) {
    return this.runQuery(
      `INSERT INTO ${
        this.evolutionsTable
      } (id, checksum, down_script) VALUES (${id}, '${checksum}', ${this.normalizeScript(
        downScript,
      )});`,
    )
  }

  updateEvolution(id, checksum, downScript) {
    return this.runQuery(
      `UPDATE ${
        this.evolutionsTable
      } SET checksum = \'${checksum}\', down_script = ${this.normalizeScript(
        downScript,
      )} WHERE id = ${id};`,
    )
  }

  normalizeScript(script) {
    return script ? `'${script.replace(/'/g, "''")}'` : 'NULL'
  }
}

module.exports = EvolutionTableDriver
