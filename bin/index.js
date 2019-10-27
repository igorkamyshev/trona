#!/usr/bin/env node
const commandLineArgs = require('command-line-args')

const optionDefinitions = [
  { name: 'init', alias: 'i', type: Boolean },
  { name: 'no-interactive', alias: 'y', type: Boolean, default: false },
]
const args = commandLineArgs(optionDefinitions)
const noInteractivity = args['no-interactive']

const operation = require(args.init ? '../scripts/init' : '../scripts/run')(
  noInteractivity,
)
operation.then(() => process.exit(0), () => process.exit(1))
