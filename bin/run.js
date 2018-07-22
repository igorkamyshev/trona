#!/usr/bin/env node
const path = require('path')
const md5 = require('md5')

const validateConfig = require('../lib/validateConfig')
const {
  Red, Yellow, Green, Blue,
} = require('../lib/colors')
const { runQuery, tableName, evolutionsFolderPath } = validateConfig(require(path.join(process.cwd(), '.trona-config.js')))

const { getFiles, getFileContent } = require('../lib/fs')

const evolutionsDir = path.join(process.cwd(), ...evolutionsFolderPath)
getFiles(evolutionsDir)
  .then(files => files.filter(fileName => /^\d+\.sql$/.test(fileName)))
  .then(files => Promise.all(files.map(file => getFileContent(path.join(evolutionsDir, file))
    .then(data => ({
      data,
      file,
      checksum: md5(data),
      id: parseInt(file.split('.').shift(), 10),
    })))))
  .then(files => runQuery(`SELECT id, checksum, down_script FROM ${tableName} ORDER BY id ASC;`)
    .then(evolutions => ({ files, evolutions })))
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
    evolutionIds.forEach((id) => {
      if (id < firstInvalidEvolution
                && (
                  !filesChecksumMap[id]
                    || !evolutionsChecksumMap[id]
                    || filesChecksumMap[id] !== evolutionsChecksumMap[id]
                )
      ) {
        firstInvalidEvolution = id
      }
    })


    if (firstInvalidEvolution === Number.MAX_SAFE_INTEGER) {
      console.log(Green, 'All your database evolutions already consistent')
      process.exit(0)
    } else {
      console.log(Yellow, `Your first inconsistent evolution is ${firstInvalidEvolution}.sql`)
      // TODO: ask if user wants to continue
    }
    const invalidEvolution = evolutions.filter(({ id }) => id >= firstInvalidEvolution)
    if (invalidEvolution.length) {
      console.log(Yellow, `There are ${invalidEvolution.length} inconsistent evolutions`)
      console.log(Yellow, 'Running degrade script')
    }

    return invalidEvolution
      .reduceRight((promise, { id, down_script }) => promise /* eslint-disable-line camelcase */
        .then(() => {
          console.log('')
          console.log(Yellow, `--- ${id}.sql ---`)
          console.log('')
          console.log(Yellow, down_script)

          return runQuery(down_script)
        })
        .then(() => runQuery(`DELETE FROM ${tableName} WHERE id = ${id};`)), Promise.resolve())
      .then(() => files.filter(({ id }) => id >= firstInvalidEvolution))
  })
  .then((files) => {
    console.log('')
    console.log(Blue, 'Running evolve script')
    console.log('')

    return files.reduce((promise, { data, checksum, id }) => {
      const [upScript, downScript] = data.split('#DOWN')

      console.log(Blue, `--- ${id}.sql ---`)
      console.log('')
      console.log(Blue, upScript)
      console.log('')

      return promise
        .then(() => runQuery(upScript))
        .then(() => runQuery(`INSERT INTO ${tableName} (id, checksum, down_script) VALUES (${id}, '${checksum}', ${downScript ? `'${downScript}'` : 'NULL'});`))
    }, Promise.resolve())
  })
  .then(
    () => {
      console.log(Green, 'Evolution is successful!')
      process.exit(0)
    },
    (error) => {
      console.error(Red, error)
      process.exit(1)
    },
  )
