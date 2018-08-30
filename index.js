#!/usr/bin/env node

/* eslint no-console: off */
const cli = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra-promise');
const path = require('path');
const server = require('minota-server');
const config = require('minota-shared/config');
const init = require('./init');
const create = require('./create');
const save = require('./save');
const load = require('./load');

// Init
cli
  .command('init')
  .option('-t, --topic [topic]', 'Initialize with topic')
  .action(({ topic }) => {
    // Abort if already initialized at ancestors
    const ancestors = config.readAncestors().reverse();
    console.log(ancestors);
    if (ancestors.length) {
      let configPath = path.resolve('.');
      for (let i = 0; i < ancestors.length; i += 1) {
        configPath = path.resolve(configPath, '..');
      }
      console.log(chalk.yellow(`Already initialized at ${configPath}`));
      return;
    }

    const errors = [];
    const argsConfig = config.read();

    // Config from arguments
    if (topic && topic !== true) {
      argsConfig.topic = topic;
    }

    // Errors
    if (topic === true) {
      errors.push(chalk.yellow('Error: You should specify topic'));
    }

    // Process
    if (!errors.length) {
      init(argsConfig).then(() => {
        console.log(chalk.green('Minota initialized'));
      });
    } else {
      errors.forEach(error => console.log(error));
    }
  });

// Create
cli
  .command('create')
  .option('-t, --topic [topic]', 'Create note with topic (title)')
  .action(({ topic }) => {
    const errors = [];
    const argsConfig = {
      topic: (config.read().topic || ''),
    };

    console.log(config.readPath());

    if (topic && topic !== true) {
      argsConfig.topic = `${argsConfig.topic}${argsConfig.topic ? ' / ' : ''}${topic}`;
    }

    if (topic === true) {
      errors.push(chalk.yellow('Error: You should specify topic'));
    } else {
      // console.log('Config', argsConfig);
      // create(argsConfig).then((data) => {
      //   console.log(chalk.green(`Note '${data.filename}' created`));
      // });
    }
  });

// Save
cli
  .command('save')
  .option('-f, --file <file>', 'Specify file to save')
  .action(({ file }) => {
    const userConfig = config.read();
    if (file && file !== true) {
      fs.statAsync(file).then((stats) => {
        const notesConfig = {
          date: stats.mtime,
          topic: userConfig.topic,
        };
        return save({ file }, userConfig.storage, notesConfig);
      }).then(() => {
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
  .option('-l, --last [last]')
  .action(({ last }) => {
    if (last) {
      load({ last }, config.read().storage).then(() => {
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
