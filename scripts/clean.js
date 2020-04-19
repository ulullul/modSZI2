import { cleanDirectory } from './lib/fs';

/**
 * Cleans up the output (build) directory.
 */
export default function clean() {
  return Promise.all([
    cleanDirectory('build/*', {
      dot: true,
      ignore: ['build/.git'],
      nosort: true,
    }),
  ]);
}
