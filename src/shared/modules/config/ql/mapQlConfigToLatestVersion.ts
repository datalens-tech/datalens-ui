import type {QlConfig, QlExtendedConfig} from '../../../types';
import type {GetTranslationFn} from '../../../types/language';
import {QlConfigVersions} from '../../../types/ql/versions';

import {mapUndefinedConfigToV1} from './v1/mapUndefinedConfigToV1';
import {mapV1ConfigToV2} from './v2/mapV1ConfigToV2';
import {mapV2ConfigToV3} from './v3/mapV2ConfigToV3';
import {mapV3ConfigToV4} from './v4/mapV3ConfigToV4';

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

    if (config.version === QlConfigVersions.V2) {
        config = mapV2ConfigToV3(config);
    }

    if (config.version === QlConfigVersions.V3) {
        config = mapV3ConfigToV4(config);
    }

    return config;
};
