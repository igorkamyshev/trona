const fs = require('fs')
const path = require('path')

const validateConfig = require('../lib/validateConfig')
const { Red, Yellow, Green } = require('../lib/colors')

const defaultOptions = {
  skipFailure: false,
  exitAfterExecute: true,
}

module.exports = ({ skipFailure, exitAfterExecute } = defaultOptions) => {
  const { tableName, runQuery } = validateConfig(
    require(path.join(process.cwd(), '.trona-config.js')),
  )
  console.log("Evolution's table init started")
  fs.readFile(
    path.join(__dirname, '..', 'lib', 'evolution_table.sql'),
    'utf8',
    (err, query) => {
      if (err) {
        console.log(
          Red,
          "Evolution's initialization failed! Can't read initial evolution sql file!",
        )
        console.log('')
        console.log('')
        console.error(Red, err)
      } else {
        const modifiedQuery = query.replace('$EVOLUTIONS', tableName)
        console.log(Yellow, `Initializing evolutions table ${tableName}`)
        console.log('')
        console.log(Yellow, modifiedQuery)
        console.log('')

        runQuery(modifiedQuery)
          .then(
            () => {
              console.log(Green, 'Evolutions table successfully created!')

              return 0
            },
            error => {
              if (skipFailure) {
                console.log(Green, "Can't create evolutions table!")

                return 0
              }

              console.log(Red, 'An error occured during initialization:')
              console.error(Red, error)

              return 1
            },
          )
          .then(code => {
            if (exitAfterExecute) {
              process.exit(code)
            }
          })
      }
    },
  )
}
