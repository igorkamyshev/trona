const path = require('path')
const md5 = require('md5')

const validateConfig = require('../lib/validateConfig')
const { Red, Yellow, Green, Blue } = require('../lib/colors')
const { forEach, map } = require('../lib/asyncIterators')
const { getFiles, getFileContent } = require('../lib/fs')
const {
  confirmOperation,
  OperationDeclinedError,
} = require('../lib/operationConfirmation')
const EvolutionTableDriver = require('../lib/EvolutionTableDriver')

module.exports = async interactive => {
  try {
    const { runQuery, tableName, evolutionsFolderPath } = validateConfig(
      require(path.join(process.cwd(), '.trona-config.js')),
    )
    const evolutionsDir = path.join(process.cwd(), ...evolutionsFolderPath)
    const awaitConfirmation = interactive
      ? confirmOperation
      : () => Promise.resolve()
    const tableDriver = new EvolutionTableDriver(runQuery, tableName)

    const fileNames = (await getFiles(evolutionsDir)).filter(fileName =>
      /^\d+\.sql$/.test(fileName),
    )

    const files = (await map(async file => {
      const data = await getFileContent(path.join(evolutionsDir, file))
      const [upScript, downScript] = data.split('#DOWN')

      return {
        data,
        upScript,
        downScript,
        file,
        checksum: md5(data),
        id: parseInt(file.split('.').shift(), 10),
      }
    }, fileNames)).sort((a, b) => a.id - b.id)

    const evolutions = await tableDriver.getEvolutions()

    // If inconsistent state is possible
    const checksumsMap = {}

    const addChecksum = sumName => ({ id, checksum }) => {
      if (!checksumsMap[id]) {
        checksumsMap[id] = {}
      }
      checksumsMap[id][sumName] = checksum
    }

    files.forEach(addChecksum('fileSumm'))
    evolutions.forEach(addChecksum('evolutionSumm'))
    const evolutionIds = Object.keys(checksumsMap).sort((a, b) => a - b)

    const firstInvalidEvolution = evolutionIds.reduce((carry, id) => {
      if (carry < Number.MAX_SAFE_INTEGER) {
        return carry
      }
      const { fileSumm, evolutionSumm } = checksumsMap[id]

      if (!fileSumm || !evolutionSumm || evolutionSumm !== fileSumm) {
        return id
      }

      return carry
    }, Number.MAX_SAFE_INTEGER)

    if (firstInvalidEvolution === Number.MAX_SAFE_INTEGER) {
      console.log(Green, 'All your database evolutions already consistent')
      return
    }

    console.log(
      Yellow,
      `Your first inconsistent evolution is ${firstInvalidEvolution}.sql`,
    )
    const invalidEvolutions = evolutions.filter(
      ({ id }) => id >= firstInvalidEvolution,
    )

    if (invalidEvolutions.length) {
      console.log(
        Yellow,
        `There are ${invalidEvolutions.length} inconsistent evolutions`,
      )
    }

    await forEach(async ({ id, down_script }) => {
      console.log('')
      console.log(Yellow, `--- ${id}.sql ---`)
      console.log(Yellow, down_script)

      await awaitConfirmation('Do you wish to run this degrade script?')
      await tableDriver.runQuery(down_script)
      await tableDriver.removeEvolutionRecord(id)
    }, invalidEvolutions.reverse())

    console.log('')
    console.log(Blue, 'Running evolve script')
    console.log('')

    await forEach(async ({ id, checksum, downScript, upScript }) => {
      console.log('')
      console.log(Blue, `--- ${id}.sql ---`)
      console.log(Blue, upScript)

      await tableDriver.runQuery(upScript)
      await tableDriver.createEvolutionRecord(id, checksum, downScript)
    }, files.filter(({ id }) => id >= firstInvalidEvolution))

    console.log(Green, 'Evolution is successful!')
  } catch (error) {
    if (error instanceof OperationDeclinedError) {
      console.error(Red, 'Operation aborted')
    } else {
      console.error(Red, error)
    }
    throw error
  }
}
