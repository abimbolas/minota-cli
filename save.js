const fs = require('fs-extra-promise');
const md = require('minota-shared/md');
const storage = require('minota-storage');

function saveNotes({
  fileList = [],
  contextConfig,
  parentTopic = '',
}) {
  return Promise.all(fileList.map((file) => {
    const fileConfig = {
      topic: [contextConfig.topic, parentTopic, file.replace(/\.md$/, '')]
        .filter(topic => topic)
        .join('/')
        .split('/')
        .join(' / '),
      date: fs.statSync(file).birthtime,
    };
    return fs.readFileAsync(file, 'utf8')
      .then(content => md.parse(content, fileConfig))
      .then(notes => storage
        .config(contextConfig.storage)
        .post({ notes }))
      .then(notes => fs.outputFileAsync(file, md.stringify(notes)));
  }));
}

module.exports = saveNotes;
