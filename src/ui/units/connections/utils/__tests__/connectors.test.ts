import {ConnectorType} from 'shared';

import type {ConnectorItem} from '../../../../../shared/schema/types';
import {getConnItemByType} from '../connectors';

const CONNECTORS = [
    {conn_type: ConnectorType.File},
    {conn_type: ConnectorType.MetrikaApi, alias: 'metrica'},
    {
        conn_type: ConnectorType.__Meta__,
        alias: 'root-conn-alias',
        includes: [
            {conn_type: ConnectorType.Mssql, alias: 'nested-conn-alias'},
            {conn_type: ConnectorType.Mysql},
        ],
    },
] as ConnectorItem[];

describe('connections/store/utils/connectors', () => {
    test.each([
        ['', undefined],
        [ConnectorType.Clickhouse, undefined],
        [ConnectorType.File, CONNECTORS[0]],
        ['metrica', CONNECTORS[1]],
        [ConnectorType.__Meta__, CONNECTORS[2]],
        [ConnectorType.Mysql, CONNECTORS[2]],
        ['root-conn-alias', CONNECTORS[2]],
        ['nested-conn-alias', CONNECTORS[2]],
    ])('getConnItemByType (queryType: %s)', (queryType, expected) => {
        const result = getConnItemByType({connectors: CONNECTORS, type: queryType});
        expect(result).toEqual(expected);
    });
});
