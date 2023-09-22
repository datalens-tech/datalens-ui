import React from 'react';

import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import './Body.scss';

const b = block('chartkit-modal-body');

function Body({children, className}) {
    return <div className={b(false, className)}>{children}</div>;
}

Body.propTypes = {
    children: PropTypes.arrayOf(PropTypes.element).isRequired,
    className: PropTypes.string.isRequired,
};

export default Body;
