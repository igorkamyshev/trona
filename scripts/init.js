const path = require('path')

const validateConfig = require('../lib/validateConfig')
const { Red, Yellow, Green } = require('../lib/colors')
const { getFileContent } = require('../lib/fs')

module.exports = async () => {
  try {
    const { tableName, runQuery } = validateConfig(
      require(path.join(process.cwd(), '.trona-config.js')),
    )
    console.log("Evolution's table init started")
    let query
    try {
      query = await getFileContent(
        path.join(__dirname, '..', 'lib', 'evolution_table.sql'),
      )
    } catch (err) {
      console.log('')
      console.log('')
      console.error(Red, err)

      throw Error(
        "Evolution's initialization failed! Can't read initial evolution sql file!",
      )
    }

    const modifiedQuery = query.replace('$EVOLUTIONS', tableName)
    console.log(Yellow, `Initializing evolutions table ${tableName}`)
    console.log('')
    console.log(Yellow, modifiedQuery)
    console.log('')

    await runQuery(modifiedQuery)
    console.log(Green, 'Evolutions table successfully created!')
  } catch (error) {
    console.log(Red, 'An error occured during initialization:')
    console.error(Red, error)
    throw error
  }
}
