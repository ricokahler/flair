const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const md5 = require('md5');

function execute(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(stdout);
        console.error(stderr);
        reject(error);
      } else {
        console.warn(stderr);
        console.log(stdout);
        resolve();
      }
    });
  });
}

async function main() {
  console.log('cleaning…');
  await execute('rm -rf dist');

  console.log('linting…');
  await execute('npx eslint src --ext .ts,.tsx,.js,.jsx');

  console.log('generating types…');
  await execute('npx tsc');

  console.log('rolling…');
  await execute('npx rollup -c');

  const bundleContent = await fs.promises.readFile(
    path.join(__dirname, '../dist/bundle.esm.js'),
  );
  const pluginContent = await fs.promises.readFile(
    path.join(__dirname, '../dist/babel.js'),
  );
  const collectContent = await fs.promises.readFile(
    path.join(__dirname, '../dist/collect.js'),
  );
  const ssrContent = await fs.promises.readFile(
    path.join(__dirname, '../dist/ssr.js'),
  );
  const buildHash = md5(
    bundleContent.toString() +
      pluginContent.toString() +
      collectContent.toString() +
      ssrContent.toString(),
  ).substring(0, 9);

  console.log('writing build package.json…');
  const rawPackageJson = await fs.promises.readFile(
    path.join(__dirname, '../package.json'),
  );

  const packageJson = JSON.parse(rawPackageJson.toString());
  const {
    private: _private,
    scripts: _scripts,
    devDependencies: _devDependencies,
    version,
    ...restOfPackageJson
  } = packageJson;

  const updatedPackageJson = {
    ...restOfPackageJson,
    version: `0.0.0-${buildHash}`,
    module: './bundle.esm.js',
    main: './bundle.umd.js',
    types: './types/src',
  };

  await fs.promises.writeFile(
    path.join(__dirname, '../dist/package.json'),
    JSON.stringify(updatedPackageJson, null, 2),
  );

  console.log('DONE!');
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
