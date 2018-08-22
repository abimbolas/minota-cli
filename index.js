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
  .option('-t, --topic [topic]', 'Initialize with topic')
  .action(({ topic }) => {
    const inlineConfig = {};
    const errors = [];
    if (topic && topic !== true) {
      inlineConfig.topic = topic;
    }

    if (topic === true) {
      errors.push(chalk.yellow('Error: You should specify topic'));
    } else {
      init(inlineConfig).then(() => {
        console.log(chalk.green('Minota initialized'));
      });
    }

    if (errors.length) {
      errors.forEach(error => console.log(error));
    }
  });

// Create
cli
  .command('create')
  .option('-t, --topic [topic]', 'Create note with topic (title)')
  .action(({ topic }) => {
    // console.log(config.read().topic || '');
    const inlineConfig = {
      topic: (config.read().topic || ''),
    };
    const errors = [];
    if (topic && topic !== true) {
      inlineConfig.topic = `${inlineConfig.topic}${inlineConfig.topic ? ' / ' : ''}${topic}`;
      // console.log(inlineConfig);
    }
    if (topic === true) {
      errors.push(chalk.yellow('Error: You should specify topic'));
    } else {
      console.log('Config', inlineConfig);
      create(inlineConfig).then((data) => {
        console.log(chalk.green(`Note '${data.filename}' created`));
      });
    }
  });

// Save
cli
  .command('save')
  .option('-f, --file <file>', 'Specify file to save')
  .action(({ file }) => {
    if (file && file !== true) {
      save({ file }, config.read().storage).then(() => {
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
