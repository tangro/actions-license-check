const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const package = require('../package.json');

const readmeTemplateContent = fs
  .readFileSync(path.join(__dirname, '..', 'templates', 'README.md'))
  .toString('utf-8');

const output = ejs.render(readmeTemplateContent, { version: package.version });

fs.writeFileSync(path.join(__dirname, '..', 'README.md'), output);
