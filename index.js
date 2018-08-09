#!/usr/bin/env node

/* eslint no-console: off */
const cli = require('commander');
const chalk = require('chalk');
const server = require('minota-server');
const config = require('minota-shared/config');
const init = require('./init');
const create = require('./create');
const save = require('./save');
const load = require('./load');

// Init
cli
  .command('init')
  .action(() => {
    init().then(() => {
      console.log(chalk.green('Minota initialized'));
    });
  });

// Create
cli
  .command('create')
  .action(() => {
    create().then((data) => {
      console.log(chalk.green(`Note '${data.filename}' created`));
    });
  });

// Save
cli
  .command('save')
  .option('-f, --file <file>', 'Specify file to save')
  .action(({ file }) => {
    if (file && file !== true) {
      save({ file }, config.storage).then(() => {
        console.log(chalk.green(`Note '${file}' saved`));
      });
    }
    if (!file || file === true) {
      console.log(chalk.yellow('You should specify filenames with \'--file\' option'));
    }
  });

// Load
cli
  .command('load')
  .option('-l --last <last>')
  .action(({ last }) => {
    if (last) {
      load({ last }, config.storage).then(() => {
        console.log(chalk.green('Notes loaded'));
      });
    }
    if (!last) {
      console.log(chalk.yellow('You should specify load options'));
    }
  });

// Check config
cli
  .command('config')
  .action(() => {
    console.log(chalk.green('config:', JSON.stringify(config, null, '  ')));
  });

// Start server
cli
  .command('server')
  .option('-p, --port <port>', 'Specify port to listen')
  .action(({ port = 1234 }) => {
    if (port && port !== true) {
      server.listen(port, () => {
        console.log(`Server listening at 'http://localhost:${port}'`);
      });
    }
  });

// Parse command line arguments
cli.parse(process.argv);

// Show help if no command supplied
if (!process.argv.slice(2).length) {
  cli.help(text => chalk.gray(text));
}