const moment = require('moment');
const uuid = require('uuid/v1');
const fs = require('fs-extra-promise');
const md = require('minota-shared/md');
// const config = require('minota-shared/config');

function createNote(userConfig = {}) {
  const note = {
    config: {
      id: uuid(),
      date: moment().format(),
    },
    content: '(Enter your text here)',
  };
  Object.assign(note.config, userConfig);
  const filename = `./note.${note.config.id}.md`;
  return fs
    .outputFileAsync(filename, md.stringify(note))
    .then(() => ({ note, filename }));
}

module.exports = createNote;
