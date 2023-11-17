import type {QlConfig, QlExtendedConfig} from '../../../types';

import {mapUndefinedConfigToV1} from './v1/mapUndefinedConfigToV1';

export const mapQlConfigToLatestVersion = (extendedConfig: QlExtendedConfig): QlConfig => {
    let config = extendedConfig;

    if (typeof config.version === 'undefined') {
        config = mapUndefinedConfigToV1(config);
    }

    return config;
};
