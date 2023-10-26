#!/usr/bin/env node

import sade from "sade"
import Action from '../actions/index.js'
const prog = sade('my-cli');



prog
  .version('1.0.0')
  .option('--global, -g', 'An example global flag')
  .option('-c, --config', 'Provide path to custom config', 'foo.config.js');

Action.init()

prog
  .command('start')
  .describe('Starts the development for the JSON server')
  .option('-port, --port')
  .example('start --port 3000')
  .action(Action.startServer);

prog
  .command("index <indexes>")
  .describe("generates indexes in config file")
  .option("-append", "--append")
  .action(Action.generateIndex)
prog.parse(process.argv);

export const name = "shayo"
