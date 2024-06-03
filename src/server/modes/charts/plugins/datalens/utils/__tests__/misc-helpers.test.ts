import type {
    DATASET_FIELD_TYPES,
    Field,
    ServerPlaceholder,
    Shared,
} from '../../../../../../../shared';
import {getSortedColumnId, isNeedToCalcClosestPointManually} from '../misc-helpers';

type ChartType = Shared['visualization']['id'];

const MOCKED_GUID = 'MOCKED_GUID';
const ANOTHER_MOCKED_GUID = 'ANOTHER_MOCKED_GUID';
const ANY_VISUALIZATION_ID = 'line' as ChartType;
const COLUMN_VISUALIZATION_ID = 'column' as ChartType;
const BAR_VISUALIZATION_ID = 'bar' as ChartType;

const MOCKED_COLOR = {
    guid: MOCKED_GUID,
} as Field;

const MOCKED_COLOR_WITH_ANOTHER_GUID = {guid: ANOTHER_MOCKED_GUID} as Field;

const MOCKED_X_COLUMN_ITEM = {
    guid: MOCKED_GUID,
} as Field;

const MOCKED_Y_BAR_ITEM = {
    guid: MOCKED_GUID,
} as Field;

const MOCKED_X_PLACEHOLDER = {
    items: [MOCKED_X_COLUMN_ITEM],
    id: 'x',
} as ServerPlaceholder;

const MOCKED_Y_PLACEHOLDER = {
    items: [MOCKED_Y_BAR_ITEM],
    id: 'y',
    settings: {},
} as ServerPlaceholder;

describe('isNeedToCalcClosestPointManually', () => {
    it.each([
        {
            visualizationId: COLUMN_VISUALIZATION_ID,
            placeholder: MOCKED_X_PLACEHOLDER,
            colorItem: MOCKED_COLOR,
            dataType: 'date',
        },
        {
            visualizationId: COLUMN_VISUALIZATION_ID,
            placeholder: MOCKED_X_PLACEHOLDER,
            colorItem: MOCKED_COLOR,
            dataType: 'datetime',
        },
    ])(
        `should return true if the chart type is "column", and fields in Section "X" and "Colors" are equal, and type "X" is date or datetime`,
        ({visualizationId, placeholder, colorItem, dataType}) => {
            MOCKED_X_COLUMN_ITEM.data_type = dataType as DATASET_FIELD_TYPES;
            expect(
                isNeedToCalcClosestPointManually(visualizationId, [placeholder], [colorItem]),
            ).toEqual(true);
        },
    );

    it.each([
        {
            visualizationId: BAR_VISUALIZATION_ID,
            placeholder: MOCKED_Y_PLACEHOLDER,
            colorItem: MOCKED_COLOR,
            dataType: 'date',
        },
        {
            visualizationId: BAR_VISUALIZATION_ID,
            placeholder: MOCKED_Y_PLACEHOLDER,
            colorItem: MOCKED_COLOR,
            dataType: 'datetime',
        },
    ])(
        'Should return true if chart type is "bar", and fields in Section "Y" and "Colors" are equal, and type "Y" is date or datetime',
        ({visualizationId, placeholder, colorItem, dataType}) => {
            MOCKED_Y_BAR_ITEM.data_type = dataType as DATASET_FIELD_TYPES;
            expect(
                isNeedToCalcClosestPointManually(visualizationId, [placeholder], [colorItem]),
            ).toEqual(true);
        },
    );

    it('should return false, if visualizationId is not column or bar', () => {
        MOCKED_X_COLUMN_ITEM.data_type = 'date' as DATASET_FIELD_TYPES;
        expect(
            isNeedToCalcClosestPointManually(
                ANY_VISUALIZATION_ID,
                [MOCKED_X_PLACEHOLDER],
                [MOCKED_COLOR],
            ),
        ).toEqual(false);
    });

    it('should return false if placeholders = undefined', () => {
        MOCKED_X_COLUMN_ITEM.data_type = 'date' as DATASET_FIELD_TYPES;
        expect(
            isNeedToCalcClosestPointManually(COLUMN_VISUALIZATION_ID, undefined, [MOCKED_COLOR]),
        ).toEqual(false);
    });

    it('should return false, if data_type is not "date" or "datetime"', () => {
        MOCKED_X_COLUMN_ITEM.data_type = 'integer' as DATASET_FIELD_TYPES;
        expect(
            isNeedToCalcClosestPointManually(
                COLUMN_VISUALIZATION_ID,
                [MOCKED_X_PLACEHOLDER],
                [MOCKED_COLOR],
            ),
        ).toEqual(false);
    });

    it('should return false, if Columns Sections do not have a Section "X"', () => {
        MOCKED_X_COLUMN_ITEM.data_type = 'date' as DATASET_FIELD_TYPES;
        expect(
            isNeedToCalcClosestPointManually(
                COLUMN_VISUALIZATION_ID,
                [MOCKED_Y_PLACEHOLDER],
                [MOCKED_COLOR],
            ),
        ).toEqual(false);
    });

    it('should return false, if Columns Sections do not have a Section "Y"', () => {
        MOCKED_Y_BAR_ITEM.data_type = 'date' as DATASET_FIELD_TYPES;
        expect(
            isNeedToCalcClosestPointManually(
                BAR_VISUALIZATION_ID,
                [MOCKED_X_PLACEHOLDER],
                [MOCKED_COLOR],
            ),
        ).toEqual(false);
    });

    it('should return false, if colors is empty array', () => {
        MOCKED_X_COLUMN_ITEM.data_type = 'date' as DATASET_FIELD_TYPES;
        expect(
            isNeedToCalcClosestPointManually(COLUMN_VISUALIZATION_ID, [MOCKED_X_PLACEHOLDER], []),
        ).toEqual(false);
    });

    it('should return true, if Color and Field guid are not equal', () => {
        MOCKED_X_COLUMN_ITEM.data_type = 'date' as DATASET_FIELD_TYPES;
        expect(
            isNeedToCalcClosestPointManually(
                COLUMN_VISUALIZATION_ID,
                [MOCKED_X_PLACEHOLDER],
                [MOCKED_COLOR_WITH_ANOTHER_GUID],
            ),
        ).toEqual(true);
    });
});

describe('getSortedColumnId', () => {
    const expectedFieldId = '5b58a23b-68a2-4979-bfb3-9ee13f16d24d';
    const mockedPivotTableSortColumnId =
        '0_0_1_id=fieldId=5b58a23b-68a2-4979-bfb3-9ee13f16d24d__index=0_name=Average rating';
    const mockedSortColumnId = '0_0_1_id=5b58a23b-68a2-4979-bfb3-9ee13f16d24d_name=Average rating';

    it('Should parse sorted column id from flat table columnId', () => {
        const fieldId = getSortedColumnId(mockedSortColumnId);

        expect(fieldId).toEqual(expectedFieldId);
    });

    it('Should parse sorted column id from pivot table columnId', () => {
        const fieldId = getSortedColumnId(mockedPivotTableSortColumnId, true);

        expect(fieldId).toEqual(expectedFieldId);
    });
});
