import fs from 'fs';
import glob from 'glob';
import map from 'lodash/map';
import path from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';

export const readFile = file =>
  new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (error, data) =>
      error ? reject(error) : resolve(data),
    );
  });

export const writeFile = (file, contents) =>
  new Promise((resolve, reject) => {
    fs.writeFile(file, contents, 'utf8', error =>
      error ? reject(error) : resolve(),
    );
  });

export const renameFile = (source, target) =>
  new Promise((resolve, reject) => {
    fs.rename(source, target, error => (error ? reject(error) : resolve()));
  });

export const copyFile = (source, target) =>
  new Promise((resolve, reject) => {
    let callbackCalled = false;
    function done(error) {
      if (!callbackCalled) {
        callbackCalled = true;
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      }
    }

    const rd = fs.createReadStream(source);
    rd.on('error', error => done(error));
    const wr = fs.createWriteStream(target);
    wr.on('error', error => done(error));
    wr.on('close', error => done(error));
    rd.pipe(wr);
  });

export const readDirectory = (pattern, options) =>
  new Promise((resolve, reject) =>
    glob(pattern, options, (error, result) =>
      error ? reject(error) : resolve(result),
    ),
  );

export const makeDirectory = mkdirp;

export const moveDirectory = async (source, target) => {
  const directories = await readDirectory('**/*.*', {
    cwd: source,
    dot: true,
    nosort: true,
  });
  await Promise.all(
    map(directories, async directory => {
      const from = path.resolve(source, directory);
      const to = path.resolve(target, directory);
      await makeDirectory(path.dirname(to));
      await renameFile(from, to);
    }),
  );
};

export const copyDirectory = async (source, target) => {
  const directories = await readDirectory('**/*.*', {
    cwd: source,
    dot: true,
    nosort: true,
  });
  await Promise.all(
    map(directories, async directory => {
      const from = path.resolve(source, directory);
      const to = path.resolve(target, directory);
      await makeDirectory(path.dirname(to));
      await copyFile(from, to);
    }),
  );
};

export const cleanDirectory = (pattern, options) =>
  new Promise((resolve, reject) =>
    rimraf(pattern, { glob: options }, (error, result) =>
      error ? reject(error) : resolve(result),
    ),
  );

export default {
  cleanDirectory,
  copyDirectory,
  copyFile,
  makeDirectory,
  moveDirectory,
  readFile,
  renameFile,
  writeFile,
};
