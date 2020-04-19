import cp from 'child_process';

export const spawn = (command, parameters, options) =>
  new Promise((resolve, reject) => {
    cp.spawn(command, parameters, options).on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(`${command} ${parameters.join(' ')} => ${code} (error)`),
        );
      }
    });
  });

export const exec = (command, options) =>
  new Promise((resolve, reject) => {
    cp.exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({ stderr, stdout });
    });
  });

export default { exec, spawn };
