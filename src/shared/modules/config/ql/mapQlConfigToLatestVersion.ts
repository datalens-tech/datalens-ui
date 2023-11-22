import type {QlConfig, QlExtendedConfig} from '../../../types';
import type {GetTranslationFn} from '../../../types/language';
import {QlConfigVersions} from '../../../types/ql/versions';

import {mapUndefinedConfigToV1} from './v1/mapUndefinedConfigToV1';
import {mapV1ConfigToV2} from './v2/mapV1ConfigToV2';

type MapQlConfigToLatestVersionOptions = {
    i18n: GetTranslationFn;
};

export const mapQlConfigToLatestVersion = (
    extendedConfig: QlExtendedConfig,
    {i18n}: MapQlConfigToLatestVersionOptions,
): QlConfig => {
    let config = extendedConfig;

    if (typeof config.version === 'undefined') {
        config = mapUndefinedConfigToV1(config);
    }

    if (config.version === QlConfigVersions.V1) {
        config = mapV1ConfigToV2(config, i18n);
    }

    return config;
};
