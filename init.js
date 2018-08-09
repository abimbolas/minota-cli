const fs = require('fs-extra-promise');
const config = require('minota-shared/config');

function init() {
  return fs.outputFileAsync('./minota.json', JSON.stringify(config, null, '  '));
}

module.exports = init;
