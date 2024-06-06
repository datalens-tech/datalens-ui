import {ChartsConfigVersion} from '../../../../types';
import type {V2ChartsConfig} from '../../../../types/config/wizard/v2';
import type {V3ChartsConfig} from '../../../../types/config/wizard/v3';

export const mapV2ConfigToV3 = (config: V2ChartsConfig): V3ChartsConfig => {
    const visualization = config.visualization;
    if (visualization.id === 'geolayer') {
        const layers = visualization.layers || [];
        const v3Layers = layers.map((layer) => {
            const commonPlaceholders = layer.commonPlaceholders;
            // Fallback, historically we did not put sort in commonPlaceholders. Get it from the config.
            // To support the old charts, switch to have the same behavior for all fields
            if (layer.id === 'polyline') {
                return {
                    ...layer,
                    commonPlaceholders: {
                        ...commonPlaceholders,
                        sort: config.sort || [],
                    },
                };
            }
            return {
                ...layer,
                commonPlaceholders: {
                    ...commonPlaceholders,
                    sort: [],
                },
            };
        });

        return {
            ...config,
            version: ChartsConfigVersion.V3,
            visualization: {
                ...visualization,
                layers: v3Layers,
            },
        };
    }
    return {
        ...(config as unknown as V3ChartsConfig),
        version: ChartsConfigVersion.V3,
    };
};
