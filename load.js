const fs = require('fs-extra-promise');
const md = require('minota-shared/md');
const storage = require('minota-storage');

function loadNotes(params, config) {
  return storage
    .config(config)
    .get(params)
    .then(notes => Promise.all(
      notes.map(note => fs.outputFileAsync(
        `./note.${note.config.id}.md`,
        md.stringify(note),
      )),
    ));
}

module.exports = loadNotes;
