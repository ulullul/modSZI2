import bootstrap from 'bootstrap/dist/css/bootstrap.min.css';
import useStyles from 'isomorphic-style-loader/useStyles';
import PropTypes from 'prop-types';
import React, { memo } from 'react';

// external-global styles must be imported in your JS.
import normalizeCss from 'normalize.css';
import s from './Layout.css';

function Layout(props) {
  useStyles(normalizeCss, bootstrap, s);
  const { children } = props;
  return <div className="container-fluid">{children}</div>;
}
Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
Layout.whyDidYouRender = true;
export default memo(Layout);
