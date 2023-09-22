import React from 'react';

import DatalensChartkitCustomError, {
    ERROR_CODE,
} from '../datalens-chartkit-custom-error/datalens-chartkit-custom-error';

const extensions = {};

function withWrapperComponent(id) {
    const WrapperComponent = (props) => {
        const Component = extensions[id];
        if (!Component) {
            return null;
        }
        return <Component {...props} />;
    };
    return WrapperComponent;
}

class ExtensionsManager {
    static add(key, value) {
        extensions[key] = value;
    }

    static register(...plugins) {
        plugins.forEach(({key, value}) => {
            extensions[key] = value;
        });
    }

    static get(key) {
        if (extensions[key]) {
            return extensions[key];
        }
        throw new DatalensChartkitCustomError(null, {
            code: ERROR_CODE.UNKNOWN_EXTENSION,
            details: {key},
        });
    }

    static getWithWrapper(key) {
        return withWrapperComponent(key);
    }

    static has(key) {
        return Boolean(extensions[key]);
    }
}

export default ExtensionsManager;
