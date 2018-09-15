const moment = require('moment');
const uuid = require('uuid/v1');
const fs = require('fs-extra-promise');
const md = require('minota-shared/md');
// const config = require('minota-shared/config');

function createNote(userConfig = {}, contextConfig = {}) {
  const note = {
    config: {
      id: uuid(),
      date: moment().format(),
    },
    content: '(Enter your text here)',
  };
  Object.assign(note.config, userConfig);
  // Form tree path, remove context topic
  let treePath;
  if (note.config.topic) {
    if (contextConfig.topic) {
      const pathRegexp = new RegExp(`^${contextConfig.topic}`);
      treePath = note.config.topic
        .replace(pathRegexp, '')
        .split(' / ')
        .filter(t => t);
    } else {
      treePath = note.config.topic
        .split(' / ')
        .filter(t => t);
    }
  }
  const filename = `${treePath.join('/')}.md`;
  return fs
    .outputFileAsync(filename, md.stringify(note))
    .then(() => ({ note, filename }));
}

module.exports = createNote;
