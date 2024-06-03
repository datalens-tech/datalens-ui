import {PlaceholderId} from '../../../../constants';
import type {QLEntryDataShared} from '../../../../types';
import type {QlConfigV1} from '../../../../types/config/ql/v1';
import {QlConfigVersions} from '../../../../types/ql/versions';

export const mapUndefinedConfigToV1 = (config: QLEntryDataShared): QlConfigV1 => {
    const isPlaceholdersExists = config.visualization && 'placeholders' in config.visualization;

    if (!isPlaceholdersExists) {
        return {
            ...config,
            version: QlConfigVersions.V1,
        };
    }

    const updatedVisualization = {
        ...config.visualization,
        placeholders: config.visualization.placeholders.map((placeholder) => {
            if (placeholder.id === PlaceholderId.Y || placeholder.id === PlaceholderId.Y2) {
                return {
                    ...placeholder,
                    settings: {
                        ...placeholder.settings,
                        nulls:
                            placeholder.settings?.nulls === 'ignore'
                                ? 'connect'
                                : placeholder.settings?.nulls,
                    },
                };
            }

            return placeholder;
        }),
    };

    return {
        ...config,
        visualization: updatedVisualization,
        version: QlConfigVersions.V1,
    };
};
