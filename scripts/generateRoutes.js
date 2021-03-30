const chokidar = require('chokidar');
const mkdirp = require('mkdirp');
const fs = require('fs');
const glob = require('glob');
const rimraf = require('rimraf');

const APP_PACKAGE_PATH = 'packages/tnsmart-apps';

const generateRoute = (path) => {
  if (!fs.existsSync(path)) return;
  const routeCfgs = JSON.parse(fs.readFileSync(path));
  routeCfgs.forEach((cfg) => {
    const names = cfg.path.split('/');
    if (names.length > 1) {
      const path = names.slice(0, names.length - 1).join('/');
      mkdirp.sync(`./pages${path}`, { recursive: true });
    }
    // Generate Page
    fs.writeFileSync(
      `./pages${cfg.path}.tsx`,
      `import { default as Page } from '${APP_PACKAGE_PATH}${cfg.page}';\nexport default Page;`,
    );

    const appName = cfg.page.split('/')[1];

    // Update tsconfig.ts
    const alias = `./${APP_PACKAGE_PATH}/${appName}/shared`;
    const packageName = `tnsmart-${appName}-shared`;

    //console.log('---', fs.readFileSync('./tsconfig.json'));
    const ts = JSON.parse(fs.readFileSync('./tsconfig.json'));

    if (
      !ts.compilerOptions.paths[packageName] ||
      ts.compilerOptions.paths[packageName][0] !== alias
    ) {
      ts.compilerOptions.paths[packageName] = [alias];
      fs.writeFileSync('./tsconfig.json', JSON.stringify(ts, null, 2));
    }

    // Update Babelrcs
    const babelrc = JSON.parse(fs.readFileSync('./.babelrc'));
    const [pluginName, pluginconfig] = babelrc.plugins.find(
      ([name]) => name === 'module-resolver',
    );

    if (pluginconfig.alias[packageName] !== alias) {
      pluginconfig.alias[packageName] = alias;
      fs.writeFileSync('./.babelrc', JSON.stringify(babelrc, null, 2));
    }
  });
};

fs.readdirSync(`./pages`).forEach((p) => {
  if (!['_app.tsx', '_error.tsx', '_document.tsx', 'api'].includes(p)) {
    rimraf.sync(`./pages/${p}`);
  }
});

if (process.argv.includes('--watch')) {
  chokidar.watch('./packages/**/routes.json').on('all', (event, path) => {
    console.log('> Generate routes ' + event + ' ' + path);
    generateRoute(path);
  });
} else {
  const routeFilePaths = glob.sync(`./${APP_PACKAGE_PATH}/**/routes.json`);
  routeFilePaths.forEach((path) => generateRoute(path));
}
