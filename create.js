const moment = require('moment');
const uuid = require('uuid/v1');
const fs = require('fs-extra-promise');
const md = require('minota-shared/md');

function createNote({
  userConfig,
  contextConfig,
  parentTopic = '',
} = {}) {
  const note = {
    config: {
      id: uuid(),
      date: moment().format(),
    },
    content: '(Enter your text here)',
  };
  Object.assign(note.config, userConfig);

  // Restore full topic from all parts
  note.config.topic = [
    contextConfig.topic,
    parentTopic,
    userConfig.topic,
  ].filter(topic => topic).join(' / ');

  // Set filename to user topic, if it was provided.
  let filename;
  if (userConfig.topic) {
    filename = `${userConfig.topic.split(' / ').join('/')}.md`;
  } else {
    filename = `note.${note.config.id}.md`;
  }

  try {
    // If file already present, abort...
    const stats = fs.statSync(filename);
    const date = moment(stats.birthtime).format('LLL');
    return Promise.reject(new Error(`"${filename}" already created on ${date}`));
  } catch (error) {
    // ..otherwise, create note
    return fs
      .outputFileAsync(filename, md.stringify(note))
      .then(() => ({ note, filename }));
  }
}

module.exports = createNote;
