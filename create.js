const moment = require('moment');
const uuid = require('uuid/v1');
const fs = require('fs-extra-promise');
const md = require('minota-shared/md');

function createNote() {
  const note = {
    config: {
      id: uuid(),
      date: moment().format(),
    },
    content: '(Enter your text here)',
  };
  const filename = `./note.${note.config.id}.md`;
  return fs
    .outputFileAsync(filename, md.stringify(note))
    .then(() => ({ note, filename }));
}

module.exports = createNote;
