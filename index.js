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
  .option('-f, --force', 'Force init inside already initialized folder')
  .action(({ topic, force }) => {
    // Abort if already initialized at ancestors
    // (need to force-init explicitly if we want init inside
    // already initialized folder)
    const ancestors = config.readAncestors().reverse();
    if (ancestors.length) {
      let configPath = path.resolve('.');
      for (let i = 0; i < ancestors.length; i += 1) {
        configPath = path.resolve(configPath, '..');
      }
      if (!force) {
        console.log(chalk.yellow(`Already initialized at ${configPath}, aborting`));
        return;
      }
      console.log(chalk.yellow(`Forcing init here, though already initialized at ${configPath}`));
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
    const contextConfig = config.read();
    const userConfig = {
      topic: (contextConfig.topic || ''),
    };

    if (topic && topic !== true) {
      userConfig.topic = `${userConfig.topic}${userConfig.topic ? ' / ' : ''}${topic}`;
    }

    if (topic === true) {
      errors.push(chalk.yellow('Error: You should specify topic'));
    } else {
      console.log('Config', userConfig);
      create(userConfig, contextConfig).then((data) => {
        console.log(chalk.green(`Note '${data.filename}' created`));
      });
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
