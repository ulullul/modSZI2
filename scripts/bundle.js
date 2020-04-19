import get from 'lodash/get';
import head from 'lodash/head';
import invoke from 'lodash/invoke';
import webpack from 'webpack';
import webpackConfig from './webpack.config';

/**
 * Creates application bundles from the source files.
 */
export default function bundle() {
  return new Promise((resolve, reject) => {
    invoke(webpack(webpackConfig), 'run', (error, stats) => {
      if (error) {
        return reject(error);
      }

      console.info(
        invoke(stats, 'toString', get(head(webpackConfig), 'stats')),
      );
      if (invoke(stats, 'hasErrors')) {
        return reject(new Error('Webpack compilation errors'));
      }

      return resolve();
    });
  });
}
