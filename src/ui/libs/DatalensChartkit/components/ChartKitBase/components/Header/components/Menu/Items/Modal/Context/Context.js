import React from 'react';

import PropTypes from 'prop-types';

const Context = React.createContext();

function Provider({children, ...props}) {
    return <Context.Provider value={props}>{children}</Context.Provider>;
}

Provider.propTypes = {
    children: PropTypes.arrayOf(PropTypes.element).isRequired,
};

export {Context, Provider};
