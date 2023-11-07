import {
    ChartsConfig,
    ChartsConfigVersion,
    ExtendedChartsConfig,
    ServerChartsConfig,
    Shared,
} from '../../../types';

import {mapV1ConfigToV2} from './v1/mapV1ConfigToV2';
import {mapV2ConfigToV3} from './v2/mapV2ConfigToV3';
import {mapV3ConfigToV4, migrateDatetime} from './v3/mapV3ConfigToV4';
import {mapV4ConfigToV5} from './v4/mapV4ConfigToV5';
import {mapV5ConfigToV6} from './v5/mapV5ConfigToV6';
import {mapV6ConfigToV7} from './v6/mapV6ConfigToV7';
import {mapV7ConfigToV8} from './v7/mapV7ConfigToV8';
import {mapV8ConfigToV9} from './v8/mapV8ConfigToV9';

export const mapChartsConfigToLatestVersion = (
    extendedConfig: ExtendedChartsConfig,
    options: {
        shouldMigrateDatetime: boolean;
        sharedData?: ServerChartsConfig['sharedData'];
    },
): ChartsConfig => {
    let config = extendedConfig;

    // CHARTS-7601
    // version 8 of the config mistakenly became a number instead of a string
    // in order to maintain consistency, cast all non string versions into string
    if (typeof config.version !== 'undefined') {
        config.version = String(config.version) as ChartsConfigVersion;
    }

    if (config.version === ChartsConfigVersion.V1 || typeof config.version === 'undefined') {
        config = mapV1ConfigToV2(config as Shared);
    }

    if (config.version === ChartsConfigVersion.V2) {
        config = mapV2ConfigToV3(config);
    }

    if (config.version === ChartsConfigVersion.V3) {
        config = mapV3ConfigToV4(config);
    }

    if (config.version === ChartsConfigVersion.V4) {
        if (options.shouldMigrateDatetime) {
            migrateDatetime(config);
        }

        config = mapV4ConfigToV5(config, options.sharedData);
    }

    if (config.version === ChartsConfigVersion.V5) {
        config = mapV5ConfigToV6(config);
    }

    if (config.version === ChartsConfigVersion.V6) {
        config = mapV6ConfigToV7(config, options.sharedData);
    }

    if (config.version === ChartsConfigVersion.V7) {
        config = mapV7ConfigToV8(config);
    }

    if (config.version === ChartsConfigVersion.V8) {
        config = mapV8ConfigToV9(config);
    }

    return config as ChartsConfig;
};
