import includes from 'lodash/includes';
import invoke from 'lodash/invoke';
import path from 'path';
import fetch from 'node-fetch';
import { spawn } from './lib/cp';
import { makeDirectory, moveDirectory, cleanDirectory } from './lib/fs';
import run from './run';

// GitHub Pages
const remote = {
  branch: 'gh-pages',
  name: 'github',
  static: true,
  url: 'https://github.com/<user>/<repo>.git',
  website: 'https://eliftech.github.io/school-project-2019/',
};

// Heroku
// const remote = {
//   name: 'heroku',
//   url: 'https://git.heroku.com/<app>.git',
//   branch: 'master',
//   website: 'https://<app>.herokuapp.com',
// };

// Azure Web Apps
// const remote = {
//   name: 'azure',
//   url: 'https://<user>@<app>.scm.azurewebsites.net:443/<app>.git',
//   branch: 'master',
//   website: `http://<app>.azurewebsites.net`,
// };

const options = {
  cwd: path.resolve(__dirname, '../build'),
  stdio: ['ignore', 'inherit', 'inherit'],
};

/**
 * Deploy the contents of the `/build` folder to a remote server via Git.
 */
export default async function deploy() {
  // Initialize a new repository
  await makeDirectory('build');
  await spawn('git', ['init', '--quiet'], options);

  // Changing a remote's URL
  let isRemoteExists = false;
  try {
    await spawn(
      'git',
      ['config', '--get', `remote.${remote.name}.url`],
      options,
    );
    isRemoteExists = true;
  } catch (error) {
    /* skip */
  }
  await spawn(
    'git',
    ['remote', isRemoteExists ? 'set-url' : 'add', remote.name, remote.url],
    options,
  );

  // Fetch the remote repository if it exists
  let doesReferenceExist = false;
  try {
    await spawn(
      'git',
      ['ls-remote', '--quiet', '--exit-code', remote.url, remote.branch],
      options,
    );
    doesReferenceExist = true;
  } catch (error) {
    await spawn('git', ['update-ref', '-d', 'HEAD'], options);
  }
  if (doesReferenceExist) {
    await spawn('git', ['fetch', remote.name], options);
    await spawn(
      'git',
      ['reset', `${remote.name}/${remote.branch}`, '--hard'],
      options,
    );
    await spawn('git', ['clean', '--force'], options);
  }

  // Build the project in RELEASE mode which
  // generates optimized and minimized bundles
  invoke(process, 'argv.push', '--release');
  if (remote.static) invoke(process, 'argv.push', '--static');
  await run(require('./build').default); // eslint-disable-line global-require
  if (includes(process.argv, '--static')) {
    await cleanDirectory('build/*', {
      dot: true,
      ignore: ['build/.git', 'build/public'],
      nosort: true,
    });
    await moveDirectory('build/public', 'build');
  }

  // Push the contents of the build folder to the remote server via Git
  await spawn('git', ['add', '.', '--all'], options);
  try {
    await spawn('git', ['diff', '--cached', '--exit-code', '--quiet'], options);
  } catch (error) {
    await spawn(
      'git',
      ['commit', '--message', `Update ${new Date().toISOString()}`],
      options,
    );
  }
  await spawn(
    'git',
    ['push', remote.name, `master:${remote.branch}`, '--set-upstream'],
    options,
  );

  // Check if the site was successfully deployed
  const response = await fetch(remote.website);
  console.info(
    `${remote.website} => ${response.status} ${response.statusText}`,
  );
}
