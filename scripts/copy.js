import chokidar from 'chokidar';
import includes from 'lodash/includes';
import startsWith from 'lodash/startsWith';
import path from 'path';
import {
  writeFile,
  copyFile,
  makeDirectory,
  copyDirectory,
  cleanDirectory,
} from './lib/fs';
import package_ from '../package.json';
import { format } from './run';

const JSON_SPACE_NUM = 2;

async function handleChange(event, dist, filePath) {
  switch (event) {
    case 'add':
    case 'change':
      await makeDirectory(path.dirname(dist));
      await copyFile(filePath, dist);
      break;
    case 'unlink':
    case 'unlinkDir':
      cleanDirectory(dist, { dot: true, nosort: true });
      break;
    default:
  }
}

/**
 * Copies static files such as robots.txt, favicon.ico to the
 * output (build) folder.
 */
export default async function copy() {
  await makeDirectory('build');
  await Promise.all([
    writeFile(
      'build/package.json',
      JSON.stringify(
        {
          dependencies: package_.dependencies,
          engines: package_.engines,
          private: true,
          scripts: {
            start: 'node server.js',
          },
        },
        null,
        JSON_SPACE_NUM,
      ),
    ),
    copyFile('yarn.lock', 'build/yarn.lock'),
    copyDirectory('public', 'build/public'),
  ]);

  if (includes(process.argv, '--watch')) {
    const watcher = chokidar.watch(['public/**/*'], { ignoreInitial: true });

    watcher.on('all', async (event, filePath) => {
      const start = new Date();
      const source = path.relative('./', filePath);
      const dist = path.join(
        'build/',
        startsWith(source, 'src') ? path.relative('src', source) : source,
      );
      await handleChange(event, dist, filePath);
      const end = new Date();
      const time = end.getTime() - start.getTime();
      console.info(`[${format(end)}] ${event} '${dist}' after ${time} ms`);
    });
  }
}
