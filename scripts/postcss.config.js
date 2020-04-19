import includes from 'lodash/includes';

// eslint-disable-next-line no-underscore-dangle
const package_ = require('../package.json');

module.exports = () => ({
  // The list of plugins for PostCSS
  // https://github.com/postcss/postcss
  plugins: [
    // Transfer @import rule by inlining content, e.g. @import 'normalize.css'
    // https://github.com/postcss/postcss-import
    // eslint-disable-next-line global-require
    require('postcss-import')(),
    // W3C calc() function, e.g. div { height: calc(100px - 2em); }
    // https://github.com/postcss/postcss-calc
    // eslint-disable-next-line global-require
    require('postcss-calc')(),
    // Convert CSS shorthand filters to SVG equivalent, e.g. .blur { filter: blur(4px); }
    // https://github.com/iamvdo/pleeease-filters
    // eslint-disable-next-line global-require
    require('pleeease-filters')(),
    // Generate pixel fallback for "rem" units, e.g. div { margin: 2.5rem 2px 3em 100%; }
    // https://github.com/robwierzbowski/node-pixrem
    // eslint-disable-next-line global-require
    require('pixrem')(),
    // Postcss flexbox bug fixer
    // https://github.com/luisrudge/postcss-flexbugs-fixes
    // eslint-disable-next-line global-require
    require('postcss-flexbugs-fixes')(),
    // PostCSS Preset Env, which allows you easily to use all the features in cssdb.
    // See what features in which stage in https://preset-env.cssdb.org/features
    // https://github.com/csstools/postcss-preset-env
    // eslint-disable-next-line global-require
    require('postcss-preset-env')({
      autoprefixer: { flexbox: 'no-2009' },
      browsers: package_.browserslist,
      stage: 3,
    }),
    includes(process.argv, '--release')
      ? undefined
      : // eslint-disable-next-line global-require
        require('cssnano')({
          discardComments: { removeAll: true },
        }),
  ],
});
