import React, { memo } from 'react';
import PropTypes from 'prop-types';
import useStyles from 'isomorphic-style-loader/useStyles';
import s from './NotFound.css';

function NotFound(props) {
  useStyles(s);
  const { title } = props;
  return (
    <div className={s.root}>
      <div className={s.container}>
        <h1>{title}</h1>
        <p>Sorry, the page you were trying to view does not exist.</p>
      </div>
    </div>
  );
}
NotFound.propTypes = {
  title: PropTypes.string.isRequired,
};
NotFound.whyDidYouRender = true;
export default memo(NotFound);
