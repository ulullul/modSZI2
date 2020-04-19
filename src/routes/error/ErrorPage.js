import React, { memo } from 'react';
import PropTypes from 'prop-types';


function ErrorPage(props) {

  const { error } = props;
  if (__DEV__ && error) {
    return (
      <div>
        <h1>{error.name}</h1>
        <pre>{error.stack}</pre>
      </div>
    );
  }

  return (
    <div>
      <h1>Error</h1>
      <p>Sorry, a critical error occurred on this page.</p>
    </div>
  );
}
ErrorPage.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    stack: PropTypes.string.isRequired,
  }),
};

ErrorPage.defaultProps = {
  error: null,
};
ErrorPage.whyDidYouRender = true;
export { ErrorPage as ErrorPageWithoutStyle };
export default memo(ErrorPage);
