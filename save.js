const fs = require('fs-extra-promise');
const md = require('minota-shared/md');
const storage = require('minota-storage');

function saveNotes(params, config) {
  return fs.readFileAsync(`./${params.file}`, 'utf8')
    // read and parse notes
    .then(contents => md.parse(contents))
    // save to storage
    .then(notes => storage
      .config(config)
      .post({ notes }))
    // update focused
    .then((notes) => {
      fs.outputFileAsync(`./${params.file}`, md.stringify(notes));
    });
}

module.exports = saveNotes;
