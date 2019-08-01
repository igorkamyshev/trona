#!/usr/bin/env node
const commandLineArgs = require('command-line-args')

const optionDefinitions = [
  { name: 'init', alias: 'i', type: Boolean },
  { name: 'no-interactive', alias: 'y', type: Boolean, default: false },
]
const args = commandLineArgs(optionDefinitions)
const noInteractivity = args['no-interactive']

if (args.init) {
  require('../scripts/init')()
} else {
  require('../scripts/run')(!noInteractivity)
}
