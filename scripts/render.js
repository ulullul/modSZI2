import endsWith from 'lodash/endsWith';
import map from 'lodash/map';
import fetch from 'node-fetch';
import path from 'path';
import { writeFile, makeDirectory } from './lib/fs';
import runServer from './run-server';

// Enter your paths here which you want to render as static
// Example:
// const routes = [
//   '/',           // => build/public/index.html
//   '/page',       // => build/public/page.html
//   '/page/',      // => build/public/page/index.html
//   '/page/name',  // => build/public/page/name.html
//   '/page/name/', // => build/public/page/name/index.html
// ];
const routes = [
  '/',
  '/404', // https://help.github.com/articles/creating-a-custom-404-page-for-your-github-pages-site/
];

async function render() {
  const server = await runServer();

  // add dynamic routes
  // const products = await fetch(`http://${server.host}/api/products`).then(res => res.json());
  // products.forEach(product => routes.push(
  //   `/product/${product.uri}`,
  //   `/product/${product.uri}/specs`
  // ));

  await Promise.all(
    map(routes, async (route, index) => {
      const url = `http://${server.host}${route}`;
      const fileName = endsWith(route, '/')
        ? 'index.html'
        : `${path.basename(route, '.html')}.html`;
      const directoryPath = path.join(
        'build/public',
        endsWith(route, '/') ? route : path.dirname(route),
      );
      const dist = path.join(directoryPath, fileName);
      const timeStart = new Date();
      const response = await fetch(url);
      const timeEnd = new Date();
      const text = await response.text();
      await makeDirectory(directoryPath);
      await writeFile(dist, text);
      const time = timeEnd.getTime() - timeStart.getTime();
      console.info(
        `#${index + 1} ${dist} => ${response.status} ${
          response.statusText
        } (${time} ms)`,
      );
    }),
  );

  server.kill('SIGTERM');
}

export default render;
