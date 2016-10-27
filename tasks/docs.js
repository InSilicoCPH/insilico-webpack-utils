const gulp = require('gulp');
const fs = require('fs');
var del = require('del');
const path = require('path');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const jsonfile = require('jsonfile');

/**
 * Generate docs from React components.
 * @param componentsDir {string} Path to the directory you want to look for components inside.
 * @param outputDir {string} Output the docs here
 * @param exampleJsonDir {string} You can place example json files here, and they will be included in the matching components as example input
 * @returns {EventEmitter|any|Domain}
 */
module.exports = function generateDocs(componentsDir, outputDir, exampleJsonDir) {
  componentsDir = componentsDir || path.join(process.cwd() + 'src/containers/');
  outputDir = outputDir || path.join(process.cwd() + 'serverside/docs/');
  exampleJsonDir = exampleJsonDir || path.join(process.cwd() + 'serverside/json/');

  // Dependencies
  const docGen = require('react-docgen');
  const docsToMarkdown = require('react-docs-markdown');
  const git = require('gulp-git');
  const touch = require('gulp-touch');

  // Delete existing docs
  del.sync(outputDir + '/**/*.*', {dryRun: false, force: false});

  // Ensure the docs exists
  mkdirp.sync(outputDir);

  getComponents(componentsDir, exampleJsonDir).forEach((comp) => {
    var api = docGen.parse(comp.src);

    var md = docsToMarkdown(api, comp.name, {
      excludeKeys: 'children',
      excludeTypes: 'node',
    });

    if (comp.example) {
      md += '\n## Example JSON\n';
      md += '\n```json\n';
      md += JSON.stringify(comp.example, null, 2);
      md += '\n```\n';
    }

    fs.writeFileSync(path.join(outputDir, comp.name + '.md'), md);
  });

  console.log('Docs written to:', chalk.cyan('./' + path.relative(process.cwd(), outputDir)));

  return gulp.src(outputDir + '/**/*.{md,json}')
    .pipe(touch())
    .pipe(git.add({quiet: true}))
    .on('end', ()=> {
      git.status({args: '--quiet'});
    });
};

function getComponents(componentsDir, jsonDir) {
  var dirs = fs.readdirSync(componentsDir).filter((file) => {
    return fs.statSync(path.join(componentsDir, file)).isDirectory();
  });

  console.log(chalk.cyan('Generate docs'));

  var output = dirs.map(name => {
    var src = `./${name}/${name}.js`;
    console.log('>', chalk.blue(name));

    return {
      src: getComponentFile(path.join(componentsDir, src)),
      example: getJsonExample(name, jsonDir),
      name: name,
    };
  });

  console.log('');
  return output;
}

function getComponentFile(file) {
  if (file.indexOf('.js') == -1) file += '.js';
  return fs.readFileSync(file);
}

function getJsonExample(name, jsonDir) {
  const lookupOptions = [
    path.join(jsonDir, name.toLowerCase() + '-example.json'),
    path.join(jsonDir, name.toLowerCase() + '.json'),
    path.join(jsonDir, name + '.json'),
  ];

  for (var i = 0; i < lookupOptions.length; i++) {
    if (fs.existsSync(lookupOptions[i])) {
      return jsonfile.readFileSync(lookupOptions[i]);
    }
  }

  return null;
}