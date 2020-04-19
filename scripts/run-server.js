import cp from 'child_process';
import get from 'lodash/get';
import invoke from 'lodash/invoke';
import nth from 'lodash/nth';
import replace from 'lodash/replace';
import path from 'path';
import webpackConfig from './webpack.config';

// Should match the text string used in `src/server.js/server.listen(...)`
const RUNNING_REGEXP = /The server is running at http:\/\/(.*?)\//;

let server;
let pending = true;
const [, serverConfig] = webpackConfig;
const serverPath = path.join(
  get(serverConfig, 'output.path'),
  replace(get(serverConfig, 'output.filename'), '[name]', 'server'),
);

// Launch or restart the Node.js server
export default function runServer() {
  return new Promise(resolve => {
    function onStdOut(data) {
      const time = new Date().toTimeString();
      const match = data.toString('utf8').match(RUNNING_REGEXP);

      invoke(
        process,
        'stdout.write',
        replace(time, /.*(\d{2}:\d{2}:\d{2}).*/, '[$1] '),
      );
      invoke(process, 'stdout.write', data);

      if (match) {
        server.host = nth(match, 1);
        invoke(server, 'stdout.removeListener', 'data', onStdOut);
        invoke(server, 'stdout.on', 'data', x =>
          invoke(process, 'stdout.write', x),
        );
        pending = false;
        resolve(server);
      }
    }

    if (server) {
      server.kill('SIGTERM');
    }

    server = cp.spawn('node', [serverPath], {
      env: { NODE_ENV: 'development', ...process.env },
      silent: false,
    });

    if (pending) {
      server.once('exit', (code, signal) => {
        if (pending) {
          throw new Error(
            `Server terminated unexpectedly with code: ${code} signal: ${signal}`,
          );
        }
      });
    }

    invoke(server, 'stdout.on', 'data', onStdOut);
    invoke(server, 'stderr.on', 'data', x =>
      invoke(process, 'stderr.write', x),
    );

    return server;
  });
}

process.on('exit', () => {
  if (server) {
    server.kill('SIGTERM');
  }
});
