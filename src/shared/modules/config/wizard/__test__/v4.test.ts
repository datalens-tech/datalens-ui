import type {Field} from '../../../../types';
import {
    MOCKED_SHARED_DATA,
    MOCKED_V4_FIELD,
    MOCKED_V4_FIELD_WITH_DATE_MODE,
    MOCKED_V4_HIERARCHY_FIELD,
    getMockedV4Config,
} from '../mocks/v4.mock';
import {mapV4ConfigToV5} from '../v4/mapV4ConfigToV5';

describe('mapV4ConfigToV5', () => {
    it('Should extract field from hierarchy when sharedData.metaHierarchy exists', () => {
        const config = getMockedV4Config({
            visualizationId: 'flat-table',
            placeholders: [
                {
                    id: 'column',
                    items: [MOCKED_V4_HIERARCHY_FIELD as Field],
                    settings: {},
                },
            ],
        });

        const result = mapV4ConfigToV5(config, MOCKED_SHARED_DATA);
        expect(result.visualization.placeholders[0].items[0]).toBeDefined();
        expect(result.visualization.placeholders[0].items[0].data_type).not.toEqual('hierarchy');
        expect(result.visualization.placeholders[0].items[0].guid).toEqual('field-1');
    });

    it("Should return hierarchy when sharedData.metaHierarchy doesn't exists", () => {
        const config = getMockedV4Config({
            visualizationId: 'flat-table',
            placeholders: [
                {
                    id: 'column',
                    items: [MOCKED_V4_HIERARCHY_FIELD as Field],
                    settings: {},
                },
            ],
        });

        const result = mapV4ConfigToV5(config, undefined);
        expect(result.visualization.placeholders[0].items[0]).toBeDefined();
        expect(result.visualization.placeholders[0].items[0].data_type).toEqual('hierarchy');
        expect(result.visualization.placeholders[0].items[0].fields).toEqual([MOCKED_V4_FIELD]);
    });

    it('Should move dateMode setting to placeholder settings', () => {
        const config = getMockedV4Config({
            visualizationId: 'line',
            placeholders: [
                {
                    id: 'x',
                    items: [MOCKED_V4_FIELD_WITH_DATE_MODE as Field],
                    settings: {},
                },
            ],
        });

        const result = mapV4ConfigToV5(config, undefined);

        expect(result.visualization.placeholders[0].settings).toEqual({axisMode: 'discrete'});
        expect((result.visualization.placeholders[0].items[0] as any).dateMode).not.toBeDefined();
    });
});
