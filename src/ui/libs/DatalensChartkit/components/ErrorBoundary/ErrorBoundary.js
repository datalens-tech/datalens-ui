import React from 'react';

import PropTypes from 'prop-types';

class ErrorBoundary extends React.PureComponent {
    static propTypes = {
        children: PropTypes.oneOfType([PropTypes.node, PropTypes.element]),
        fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.element, PropTypes.func]),
    };

    static getDerivedStateFromError(error) {
        return {error};
    }

    state = {error: null};

    render() {
        const {error} = this.state;
        const {children, fallback} = this.props;

        if (error) {
            if (typeof fallback === 'function') {
                return fallback(error);
            }
            return fallback;
        }

        return children;
    }
}

export default ErrorBoundary;
