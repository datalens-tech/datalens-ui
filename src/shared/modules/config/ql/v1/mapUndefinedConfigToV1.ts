import {PlaceholderId} from '../../../../constants';
import {QLEntryDataShared} from '../../../../types';
import {QlConfigV1} from '../../../../types/config/ql/v1';
import {QlConfigVersions} from '../../../../types/ql/versions';

export const mapUndefinedConfigToV1 = (config: QLEntryDataShared): QlConfigV1 => {
    const updatedVisualization: QlConfigV1['visualization'] = {
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
