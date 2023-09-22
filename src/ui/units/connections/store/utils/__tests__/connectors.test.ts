import {ConnectorType} from '../../../../../../shared';
import type {ConnectorItem} from '../../../../../../shared/schema/types';
import {getConnectorItemFromFlattenList} from '../connectors';

const CONNECTORS = [
    {conn_type: ConnectorType.Clickhouse},
    {
        conn_type: ConnectorType.__Meta__,
        includes: [{conn_type: ConnectorType.Postgres}, {conn_type: ConnectorType.Mysql}],
    },
];

describe('connections/store/utils/connectors', () => {
    test.each([
        [ConnectorType.Clickhouse, ConnectorType.Clickhouse],
        [ConnectorType.Postgres, ConnectorType.Postgres],
        [ConnectorType.__Meta__, undefined],
        [ConnectorType.File, undefined],
    ])('getConnectorItemFromFlattenList (type: %s)', (type, expected) => {
        const connector = getConnectorItemFromFlattenList(CONNECTORS as ConnectorItem[], type);
        expect(connector?.conn_type).toEqual(expected);
    });
});
