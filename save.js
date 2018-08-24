const fs = require('fs-extra-promise');
const md = require('minota-shared/md');
const storage = require('minota-storage');

function saveNotes(params, storageConfig, notesConfig) {
  return fs.readFileAsync(`./${params.file}`, 'utf8')
    // read and parse notes
    .then(contents => md.parse(contents, notesConfig))
    // save to storage
    .then(notes => storage
      .config(storageConfig)
      .post({ notes }))
    // update focused
    .then((notes) => {
      fs.outputFileAsync(`./${params.file}`, md.stringify(notes));
    });
}

module.exports = saveNotes;
