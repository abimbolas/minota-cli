const fs = require('fs-extra-promise');
const defaultConfig = require('minota-shared/config').default;

function init(config = defaultConfig) {
  const json = JSON.stringify(config, null, '  ');
  return fs.outputFileAsync('./minota.json', json);
}

module.exports = init;
