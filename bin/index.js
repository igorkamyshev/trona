#!/usr/bin/env node
const commandLineArgs = require('command-line-args')


const optionDefinitions = [
  {name: 'init', alias: 'i', type: Boolean},
]
const {init} = commandLineArgs(optionDefinitions)

if (init) {
  require('../scripts/init')()
} else {
  require('../scripts/run')()
}