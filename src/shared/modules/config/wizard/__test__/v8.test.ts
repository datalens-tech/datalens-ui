import type {V8ChartsConfig, V8Color} from '../../../../types';
import {ChartsConfigVersion} from '../../../../types';
import {mapV8ConfigToV9} from '../v8/mapV8ConfigToV9';

describe('mapV8ConfigToV9', () => {
    it('scatter: shapes should be set when dimension field exists in colors', () => {
        const colorField: V8Color = {
            calc_mode: 'direct',
            datasetId: '',
            title: '',
            type: 'DIMENSION',
            guid: 'field-1',
            data_type: 'string',
        };

        const config: V8ChartsConfig = {
            colors: [colorField],
            datasetsIds: [],
            datasetsPartialFields: [],
            extraSettings: undefined,
            filters: [],
            hierarchies: [],
            labels: [],
            links: [],
            segments: [],
            shapes: [],
            sort: [],
            tooltips: [],
            type: 'datalens',
            updates: [],
            version: ChartsConfigVersion.V8,
            visualization: {
                id: 'scatter',
                placeholders: [],
            },
        };

        const result = mapV8ConfigToV9(config);
        expect(result.shapes).toEqual(config.colors);
    });
});
