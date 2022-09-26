#!/usr/bin/env node

import sade from "sade"
import Action from '../actions/index.cjs'
const prog = sade('my-cli');



prog
  .version('1.0.0')
  .option('--global, -g', 'An example global flag')
  .option('-c, --config', 'Provide path to custom config', 'foo.config.js');

// prog
//   .command('build <src> <dest>')
//   .describe('Build the source directory. Expects an `index.js` entry file.')
//   .option('-o, --output', 'Change the name of the output file', 'bundle.js')
//   .example('build src build --global --config my-conf.js')
//   .example('build app public -o main.js')
//   .action((src, dest, opts) => {
//     console.log(`> building from ${src} to ${dest}`);
//     console.log('> these are extra opts', opts);
//   });

prog
  .command('start')
  .describe('Starts the development for the JSON server')
  .option('-port, --port')
  .example('start --port 3000')
  .action(Action.startServer);
prog.parse(process.argv);

export const name = "shayo"
