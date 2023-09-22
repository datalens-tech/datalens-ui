import {
    ExtendedChartsConfig,
    Feature,
    ServerChartsConfig,
    isEnabledServerFeature,
    mapChartsConfigToLatestVersion,
} from '../../../../../../shared';
import {registry} from '../../../../../registry';

export const mapChartsConfigToServerConfig = (
    config: ExtendedChartsConfig & {sharedData: ServerChartsConfig['sharedData']},
): ServerChartsConfig => {
    const app = registry.getApp();
    const shouldMigrateDatetime = Boolean(
        isEnabledServerFeature(app.nodekit.ctx, Feature.GenericDatetimeMigration),
    );

    const latestConfig = mapChartsConfigToLatestVersion(config, {
        shouldMigrateDatetime,
        sharedData: config.sharedData || {},
    });

    const serverConfig: ServerChartsConfig = {
        ...latestConfig,
        sharedData: config.sharedData || {},
        // Fallback for old charts (where there are no links)
        links: latestConfig.links || [],
    };

    return serverConfig;
};
