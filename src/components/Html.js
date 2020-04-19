import get from 'lodash/get';
import map from 'lodash/map';
import PropTypes from 'prop-types';
import React, { memo, useMemo } from 'react';
import serialize from 'serialize-javascript';
import config from '../config';
import Style from './Style';

function Html(props) {
  const { title, description, styles, scripts, app, children } = props;
  const appHtml = useMemo(() => ({ __html: children }), [children]);
  const serializedState = useMemo(
    () => ({ __html: `window.App=${serialize(app)}` }),
    [app],
  );
  const ga = useMemo(
    () => ({
      __html:
        'window.ga=function(){ga.q.push(arguments)};ga.q=[];ga.l=+new Date;' +
        `ga('create','${get(
          config,
          'analytics.googleTrackingId',
        )}','auto');ga('send','pageview')`,
    }),
    [],
  );
  return (
    <html className="no-js" lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="ie=edge" httpEquiv="x-ua-compatible" />
        <title>{title}</title>
        <meta content={description} name="description" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        {map(scripts, script => (
          <link key={script} as="script" href={script} rel="preload" />
        ))}
        <link href="/site.webmanifest" rel="manifest" />
        <link href="https://fonts.googleapis.com/" rel="preconnect" />
        <link href="/icon.png" rel="apple-touch-icon" />
        {map(styles, style => (
          <Style key={style.id} cssText={style.cssText} id={style.id} />
        ))}
      </head>
      <body>
        {/* eslint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={appHtml} id="app" />
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={serializedState} />
        {map(scripts, script => (
          <script key={script} src={script} />
        ))}
        {get(config, 'analytics.googleTrackingId') && (
          /* eslint-disable-next-line react/no-danger */
          <script dangerouslySetInnerHTML={ga} />
        )}
        {get(config, 'analytics.googleTrackingId') && (
          <script
            async
            defer
            src="https://www.google-analytics.com/analytics.js"
          />
        )}
      </body>
    </html>
  );
}

Html.propTypes = {
  app: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  children: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  scripts: PropTypes.arrayOf(PropTypes.string.isRequired),
  styles: PropTypes.arrayOf(
    PropTypes.shape({
      cssText: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
    }).isRequired,
  ),
  title: PropTypes.string.isRequired,
};

Html.defaultProps = {
  scripts: [],
  styles: [],
};
Html.whyDidYouRender = true;
export default memo(Html);
