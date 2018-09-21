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
  // Restore full topic
  note.config.topic = [contextConfig.topic, userConfig.topic]
    .filter(topic => topic)
    .join(' / ');
  const filename = `${userConfig.topic.split(' / ').join('/')}.md`;
  return fs
    .outputFileAsync(filename, md.stringify(note))
    .then(() => ({ note, filename }));
}

module.exports = createNote;
