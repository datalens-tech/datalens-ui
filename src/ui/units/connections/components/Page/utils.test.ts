import {ConnectorType} from 'shared';

import {FieldKey} from '../../constants';
import type {FormDict} from '../../typings';

import {isS3BasedConnForm} from './utils';

describe('connections/componens/Page/utils', () => {
    test.each<[FormDict, string | undefined, boolean]>([
        [{[FieldKey.DbType]: ConnectorType.File}, undefined, true],
        [{[FieldKey.DbType]: ConnectorType.GsheetsV2}, undefined, true],
        [{[FieldKey.DbType]: ConnectorType.Yq}, undefined, false],
        [{}, ConnectorType.File, true],
        [{}, ConnectorType.GsheetsV2, true],
        [{}, ConnectorType.Ydb, false],
        [{}, undefined, false],
    ])(
        'isS3BasedConnForm (args: {connectionData: %p, paramsType: %p})',
        (connectionData, paramsType, expected) => {
            const result = isS3BasedConnForm(connectionData, paramsType);
            expect(result).toEqual(expected);
        },
    );
});
