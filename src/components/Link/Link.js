import useStyles from 'isomorphic-style-loader/useStyles';
import startsWith from 'lodash/startsWith';
import PropTypes from 'prop-types';
import React, { memo, useCallback } from 'react';
import history from '../../history';
import style from './Link.css';

function isLeftClickEvent(event) {
  return event.button === 0;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export function isExternal(to) {
  if (startsWith(to, 'http://') || startsWith(to, 'https://')) {
    return true;
  }
  return false;
}

function Link(props) {
  useStyles(style);
  const { children, className, onClick, to } = props;
  const handleClick = useCallback(
    event => {
      if (onClick) {
        onClick(event);
      }

      if (isModifiedEvent(event) || !isLeftClickEvent(event)) {
        return;
      }

      if (event.defaultPrevented === true) {
        return;
      }

      if (!isExternal(to)) {
        event.preventDefault();
        history.push(to);
      }
    },
    [onClick, to],
  );

  return (
    <a
      className={className}
      href={to}
      onClick={handleClick}
      target={isExternal(to) ? '_blank' : undefined}
    >
      {children}
    </a>
  );
}
Link.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  to: PropTypes.string.isRequired,
};
Link.defaultProps = {
  className: '',
  onClick: null,
};
Link.whyDidYouRender = true;

export default memo(Link);
