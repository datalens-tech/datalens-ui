import {buildTotalRequestFields} from '../../default-request';

import {
    COLUMNS,
    COLUMNS_FOR_DATASET_ID_1,
    COLUMNS_FOR_DATASET_ID_2,
    COLUMNS_FOR_ORDER_TEST,
    DATASET_ID_1,
    DATASET_ID_2,
    FIELDS,
    FIELDS_FOR_ORDER_TEST,
    FIELDS_WITH_DIFFERENT_DATASET_ID_TEST,
} from './mocks/buildTotalRequests.mock';

describe('buildTotalRequestFields', () => {
    it('Returns fields for totals: A stub for the measurement and a field with the total role for the measure', () => {
        const totalsColumns = buildTotalRequestFields({
            fields: FIELDS,
            datasetId: DATASET_ID_1,
            columns: COLUMNS,
        });

        expect(totalsColumns).toHaveLength(2);

        const dimensionPlaceholderColumn = totalsColumns[0];
        const measureTotalColumn = totalsColumns[1];

        expect(dimensionPlaceholderColumn.role_spec?.role).toEqual('template');
        expect(dimensionPlaceholderColumn.role_spec?.template).toEqual('');
        expect(dimensionPlaceholderColumn.ref.type).toEqual('placeholder');

        expect(measureTotalColumn.ref.type).toEqual('id');

        const measureFieldGuid = FIELDS[1].guid;

        // @ts-ignore
        expect(measureTotalColumn.ref.id).toEqual(measureFieldGuid);
        expect(measureTotalColumn.role_spec?.role).toEqual('total');
    });

    it('The order in the returned array depends on the order of fields and columns', () => {
        const totalsColumns = buildTotalRequestFields({
            fields: FIELDS_FOR_ORDER_TEST,
            columns: COLUMNS_FOR_ORDER_TEST,
            datasetId: DATASET_ID_1,
        });

        expect(totalsColumns).toHaveLength(3);

        const measureField_1 = FIELDS_FOR_ORDER_TEST[0];
        const measureField_2 = FIELDS_FOR_ORDER_TEST[2];

        expect(totalsColumns[0].ref.type).toEqual('id');
        // @ts-ignore
        expect(totalsColumns[0].ref.id).toEqual(measureField_1.guid);

        expect(totalsColumns[1].ref.type).toEqual('placeholder');
        expect(totalsColumns[1].role_spec?.role).toEqual('template');
        expect(totalsColumns[1].role_spec?.template).toEqual('');

        expect(totalsColumns[2].ref.type).toEqual('id');
        // @ts-ignore
        expect(totalsColumns[2].ref.id).toEqual(measureField_2.guid);
    });

    it('Only fields with the datasetId used to build the query get into the totals query', () => {
        const totalsColumns = buildTotalRequestFields({
            fields: FIELDS_WITH_DIFFERENT_DATASET_ID_TEST,
            columns: COLUMNS_FOR_DATASET_ID_1,
            datasetId: DATASET_ID_1,
        });

        expect(totalsColumns).toHaveLength(3);

        expect(totalsColumns[0].ref.type).toEqual('placeholder');

        expect(totalsColumns[1].ref.type).toEqual('id');
        // @ts-ignore
        expect(totalsColumns[1].ref.id).toEqual(FIELDS_WITH_DIFFERENT_DATASET_ID_TEST[1].guid);
        expect(totalsColumns[1].role_spec?.role).toEqual('total');

        expect(totalsColumns[2].ref.type).toEqual('id');
        // @ts-ignore
        expect(totalsColumns[2].ref.id).toEqual(FIELDS_WITH_DIFFERENT_DATASET_ID_TEST[2].guid);
        expect(totalsColumns[2].role_spec?.role).toEqual('total');
    });

    it('If there are columns in columns that are not in fields, then they are added to the end of the array of totals in the form of placeholder', () => {
        const totalsColumns = buildTotalRequestFields({
            fields: FIELDS_WITH_DIFFERENT_DATASET_ID_TEST,
            columns: COLUMNS_FOR_DATASET_ID_2,
            datasetId: DATASET_ID_2,
        });

        expect(totalsColumns).toHaveLength(2);

        expect(totalsColumns[0].ref.type).toEqual('id');
        //@ts-ignore
        expect(totalsColumns[0].ref.id).toEqual(FIELDS_WITH_DIFFERENT_DATASET_ID_TEST[3].guid);
        expect(totalsColumns[0].role_spec?.role).toEqual('total');

        expect(totalsColumns[1].ref.type).toEqual('placeholder');
        expect(totalsColumns[1].role_spec?.role).toEqual('template');
        expect(totalsColumns[1].role_spec?.template).toEqual('');
    });
});
