#!/usr/bin/env node
const commandLineArgs = require('command-line-args');

const initScript = require('../scripts/init');
const runScript = require('../scripts/run');

const optionDefinitions = [
  { name: 'init', alias: 'i', type: Boolean },
  { name: 'no-interactive', alias: 'y', type: Boolean, default: false },
];
const args = commandLineArgs(optionDefinitions);
const noInteractivity = args['no-interactive'];

if (args.init) {
  initScript();
} else {
  runScript(!noInteractivity);
}
