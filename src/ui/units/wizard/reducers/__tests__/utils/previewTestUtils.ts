import type {Placeholder, Shared} from 'shared';
import {isVisualizationWithLayers} from 'shared';
import {getAvailableVisualizations} from 'ui/units/wizard/utils/visualization';

import {getSelectedLayer} from '../../../utils/helpers';
import {commonFieldMock} from '../mocks/common.mock';

const chartkitSettings = {highcharts: {enabled: true}, yandexMap: {enabled: true}};

export const getMockedVisualizationsListWithId = () =>
    getAvailableVisualizations(chartkitSettings).reduce(
        (acc, visualization: any, index) => {
            if (isVisualizationWithLayers(visualization)) {
                const selectedLayer = getSelectedLayer(visualization);

                if (selectedLayer) {
                    selectedLayer.placeholders[0].items = [commonFieldMock];
                }
            } else {
                visualization.placeholders = visualization.placeholders.map(
                    (placeholder: Placeholder) => {
                        return {
                            ...placeholder,
                            items: [commonFieldMock],
                        };
                    },
                );
            }
            acc[index] = [visualization.id, visualization];
            return acc;
        },
        [] as Array<[string, Shared['visualization']]>,
    );
