#! /usr/bin/env node

const path = require('path');
const fs = require('fs');
const jsonfile = require('jsonfile');
const execa = require('execa');

const pkg = require(path.join(process.cwd(), 'package.json'));
const outputPath = path.join(process.cwd(), 'node_modules/local-webpack-dlls');
const dllManifestPath = path.join(outputPath, 'package.json');
const argv = require('minimist')(process.argv.slice(2));

/**
 * I use node_modules/local-webpack-dlls by default just because
 * it isn't going to be version controlled and babel wont try to parse it.
 */
execa.sync('mkdir', ['-p', outputPath]);

/**
 * Create a manifest so npm install doesn't warn us
 */
if (!fs.existsSync(dllManifestPath)) {
  jsonfile.writeFileSync(
    dllManifestPath,
    {
      name: 'local-webpack-dll',
      private: true,
      author: pkg.author,
      repository: pkg.repository,
      version: pkg.version
    },
    {spaces: 2}
  );
}
const config = argv.c || argv.config;

if (!config) {
  throw new Error('Webpack config missing.')
}

/**
 * Compile the Webpack dll config file.
 */
execa('webpack', ['--display-chunks', '--color', '--config', config], { stdio: 'inherit'});