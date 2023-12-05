import type {QlConfigV1} from '../../../../types/config/ql/v1';
import {QlConfigVersions} from '../../../../types/ql/versions';
import {mapV1ConfigToV2} from '../v2/mapV1ConfigToV2';

const mockedI18n = (_keyset: string, _key: string) => 'Query';

describe('mapV1ToV2Config', () => {
    it('should add queryName to all queries', () => {
        const config = {
            queries: [
                {
                    params: [],
                    value: 'test',
                    hidden: false,
                },
                {
                    params: [
                        {name: 'test-param', type: 'string', defaultValue: 'test-param-value'},
                    ],
                    value: 'test2',
                    hidden: true,
                },
                {
                    params: [],
                    value: 'test3',
                    hidden: true,
                },
            ],
            version: QlConfigVersions.V1,
        } as unknown as QlConfigV1;

        const result = mapV1ConfigToV2(config, mockedI18n);

        expect(result.queries).toEqual([
            {
                params: [],
                value: 'test',
                hidden: false,
                queryName: 'Query 1',
            },
            {
                params: [{name: 'test-param', type: 'string', defaultValue: 'test-param-value'}],
                value: 'test2',
                hidden: true,
                queryName: 'Query 2',
            },
            {
                params: [],
                value: 'test3',
                hidden: true,
                queryName: 'Query 3',
            },
        ]);
    });

    it('should return same config with new version, if queries doesnt exists', () => {
        const config = {
            version: QlConfigVersions.V1,
            visualization: {id: 'line'},
        } as unknown as QlConfigV1;

        const result = mapV1ConfigToV2(config, mockedI18n);

        expect(result).toMatchObject({...config, version: '2'});
    });
});
