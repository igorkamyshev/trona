const path = require('path')
const md5 = require('md5')

const validateConfig = require('../lib/validateConfig')
const { Red, Yellow, Green, Blue } = require('../lib/colors')
const { getFiles, getFileContent } = require('../lib/fs')
const {
  confirmOperation,
  OperationDeclinedError,
} = require('../lib/operationConfirmation')

const init = require('./init')

const fileNameToNumber = file => parseInt(file.split('.').shift(), 10)

module.exports = (interactive, withInit) => {
  const { runQuery, tableName, evolutionsFolderPath } = validateConfig(
    require(path.join(process.cwd(), '.trona-config.js')),
  )
  const evolutionsDir = path.join(process.cwd(), ...evolutionsFolderPath)
  const awaitConfirmation = interactive
    ? confirmOperation
    : () => Promise.resolve()

  const initializing = withInit
    ? () =>
        init({
          skipFailure: true,
          exitAfterExecute: false,
        })
    : () => Promise.resolve()

  initializing()
    .then(() => getFiles(evolutionsDir))
    .then(files => files.filter(fileName => /^\d+\.sql$/.test(fileName)))
    .then(files =>
      files.sort((a, b) => fileNameToNumber(a) - fileNameToNumber(b)),
    )
    .then(files =>
      Promise.all(
        files.map(file =>
          getFileContent(path.join(evolutionsDir, file)).then(data => ({
            data,
            file,
            checksum: md5(data),
            id: fileNameToNumber(file),
          })),
        ),
      ),
    )
    .then(files =>
      runQuery(
        `SELECT id, checksum, down_script FROM ${tableName} ORDER BY id ASC;`,
      ).then(evolutions => ({ files, evolutions })),
    )
    .then(({ files, evolutions }) => {
      if (!evolutions.length && files.length) {
        return Promise.resolve(files)
      }

      const filesChecksumMap = {}
      const evolutionsChecksumMap = {}
      let firstInvalidEvolution = Number.MAX_SAFE_INTEGER

      const evolutionIdsSet = new Set()
      files.forEach(({ id, checksum }) => {
        filesChecksumMap[id] = checksum
        evolutionIdsSet.add(id)
      })
      evolutions.forEach(({ checksum, id }) => {
        evolutionsChecksumMap[id] = checksum
        evolutionIdsSet.add(id)
      })
      const evolutionIds = Array.from(evolutionIdsSet).sort((a, b) => a - b)
      evolutionIds.forEach(id => {
        if (
          id < firstInvalidEvolution &&
          (!filesChecksumMap[id] ||
            !evolutionsChecksumMap[id] ||
            filesChecksumMap[id] !== evolutionsChecksumMap[id])
        ) {
          firstInvalidEvolution = id
        }
      })

      if (firstInvalidEvolution === Number.MAX_SAFE_INTEGER) {
        console.log(Green, 'All your database evolutions already consistent')
        process.exit(0)
      } else {
        console.log(
          Yellow,
          `Your first inconsistent evolution is ${firstInvalidEvolution}.sql`,
        )
        // TODO: ask if user wants to continue
      }
      const invalidEvolution = evolutions.filter(
        ({ id }) => id >= firstInvalidEvolution,
      )
      if (invalidEvolution.length) {
        console.log(
          Yellow,
          `There are ${invalidEvolution.length} inconsistent evolutions`,
        )
      }

      return invalidEvolution
        .reduceRight(
          (promise, { id, down_script }) =>
            promise /* eslint-disable-line camelcase */
              .then(() => {
                console.log('')
                console.log(Yellow, `--- ${id}.sql ---`)
                console.log(Yellow, down_script)

                return awaitConfirmation(
                  'Do you wish to run this degrade script?',
                )
              })
              .then(() => {
                return runQuery(down_script)
              })
              .then(() =>
                runQuery(`DELETE FROM ${tableName} WHERE id = ${id};`),
              ),
          Promise.resolve(),
        )
        .then(() => files.filter(({ id }) => id >= firstInvalidEvolution))
    })
    .then(files => {
      console.log('')
      console.log(Blue, 'Running evolve script')
      console.log('')

      return files.reduce((promise, { data, checksum, id }) => {
        const [upScript, downScript] = data.split('#DOWN')

        return promise
          .then(() => {
            console.log('')
            console.log(Blue, `--- ${id}.sql ---`)
            console.log(Blue, upScript)

            return runQuery(upScript)
          })
          .then(() =>
            runQuery(
              `INSERT INTO ${tableName} (id, checksum, down_script) VALUES (${id}, '${checksum}', ${
                downScript ? `'${downScript.replace(/'/g, "''")}'` : 'NULL'
              });`,
            ),
          )
      }, Promise.resolve())
    })
    .then(
      () => {
        console.log(Green, 'Evolution is successful!')
        process.exit(0)
      },
      error => {
        if (error instanceof OperationDeclinedError) {
          console.error(Red, 'Operation aborted')
        } else {
          console.error(Red, error)
        }
        process.exit(1)
      },
    )
}
