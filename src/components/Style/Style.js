import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

function Style({ id, cssText }) {
  const innerHtml = useMemo(() => ({ __html: cssText }), [cssText]);
  // eslint-disable-next-line react/no-danger
  return <style dangerouslySetInnerHTML={innerHtml} id={id} />;
}
Style.propTypes = {
  cssText: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default Style;
