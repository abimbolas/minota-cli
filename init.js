const fs = require('fs-extra-promise');
const config = require('minota-shared/config');

function init(userConfig = {}) {
  const mergedConfig = Object.assign({}, config.read(), userConfig);
  const json = JSON.stringify(mergedConfig, null, '  ');
  return fs.outputFileAsync('./minota.json', json);
}

module.exports = init;
