'use strict';

const yaml = require('js-yaml');

// oclif core 1.x still calls the removed safe aliases. js-yaml 4's primary
// load/dump APIs are safe by default, so expose those implementations first.
yaml.safeLoad = yaml.load;
yaml.safeDump = yaml.dump;

module.exports = yaml;
