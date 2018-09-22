#!/usr/bin/env node

/* eslint no-console: off */
const cli = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const glob = require('fast-glob');
const merge = require('merge');
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
    // Abort if already initialized at current path or at parents.
    // Force re-initialization if we were supplied with --force option
    const searchResult = config.search();
    const currentPath = path.resolve('.').replace(/\\/g, '/');
    const isInitializedHere = currentPath.indexOf(searchResult.path) === 0;
    if (searchResult.config && isInitializedHere) {
      const where = searchResult.path === currentPath ? 'here' : `at ${searchResult.path}`;
      if (!force) {
        console.log(chalk.yellow(`Already initialized ${where}, init aborted.`));
        return;
      }
      console.log(chalk.yellow(
        `Forcing init here, though already initialized ${where}`,
      ));
    }

    const errors = [];
    const contextConfig = searchResult.config || config.default;
    const userConfig = {};

    // Config from arguments
    if (topic && topic !== true) {
      userConfig.topic = topic;
    }

    // Errors
    if (topic === true) {
      errors.push(chalk.yellow('Error: You should specify topic'));
    }

    // Process
    if (!errors.length) {
      init(merge(contextConfig, userConfig)).then(() => {
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
  .option('-i, --ignoreBreadcrumbs', 'Include path from config file as topic breadcrumbs')
  .action(({ topic, ignoreBreadcrumbs } = {}) => {
    const errors = [];
    const searchResult = config.search();
    const contextConfig = searchResult.config || config.default;
    const userConfig = { topic: '' };
    let parentTopic = '';

    if (topic && topic !== true) {
      userConfig.topic = topic;
    }

    if (!ignoreBreadcrumbs && searchResult.breadcrumbs) {
      parentTopic = searchResult.breadcrumbs.split('/').join(' / ');
    }

    // Errors
    if (topic === true) {
      errors.push(chalk.yellow('Error: You should specify topic'));
    }

    // Process
    if (!errors.length) {
      create({
        contextConfig,
        userConfig,
        parentTopic,
      }).then((data) => {
        console.log(chalk.green(`Note '${data.filename}' created`));
      }).catch((error) => {
        console.log(chalk.yellow(`${error.message}, creation aborted.`));
      });
    } else {
      errors.forEach(error => console.log(error));
    }
  });

// Save
cli
  .command('save')
  .option('-f, --file <file>', 'Specify file to save')
  .option('-p, --pattern <pattern>', 'Specify files pattern to save\'em all')
  .action(({ file, pattern }) => {
    const errors = [];
    const searchResult = config.search();
    const contextConfig = searchResult.config || config.default;
    let fileList = [];

    if (file && file !== true) {
      fileList.push(file);
    } else if (file === true) {
      errors.push(chalk.yellow('Error: You should specify filename'));
    }

    if (pattern && pattern !== true) {
      const patternList = pattern.split(/;|,/).map(item => item.trim());
      fileList = fileList.concat(glob.sync(patternList));
    } else if (pattern === true) {
      errors.push(chalk.yellow('Error: You should specify pattern'));
    }

    if (!file && !pattern) {
      errors.push(chalk.yellow('Error: You should specify --file or files --pattern option to save something'));
    }

    // Process
    if (!errors.length) {
      fileList.forEach(item => console.log(item));
      inquirer.prompt([{
        type: 'confirm',
        name: 'saveFiles',
        message: 'Do you want to save all these files?',
        default: true,
      }]).then((answers) => {
        if (answers.saveFiles) {
          save({
            fileList,
            contextConfig,
            parentTopic: searchResult.breadcrumbs || '',
          }).then(() => {
            console.log(chalk.green('Notes saved.'));
          });
        } else {
          console.log(chalk.green('Notes saving aborted.'));
        }
      });
    } else {
      errors.forEach(error => console.log(error));
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
    console.log(chalk.green('config:', JSON.stringify(config.read(), null, '  ')));
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
