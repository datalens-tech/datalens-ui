import cloneDeep from 'lodash/cloneDeep';

import {colorizePivotTableByColorField, getColorSettings, getCurrentRowColorValues} from '../color';

import {
    MOCKED_COLORS_FIELDS,
    MOCKED_COLORS_FIELDS_MEASURE_NAME,
    MOCKED_PIVOT_ANNOTATIONS_MAP,
    MOCKED_PIVOT_COLORS_CONFIG,
    MOCKED_PIVOT_DATA_ROWS,
    MOCKED_PIVOT_DATA_ROWS_WITH_EMPTY_CELL,
    MOCKED_PIVOT_DATA_ROWS_WITH_FALSY_VALUES,
    MOCKED_PIVOT_DATA_ROWS_WITH_INVALID_VALUES,
    MOCKED_PIVOT_ROWS,
} from './mocks/color.mock';

describe('getCurrentRowColorValues', () => {
    it('Should return null|number array for currentRow', () => {
        const result = getCurrentRowColorValues(
            MOCKED_PIVOT_DATA_ROWS[0],
            MOCKED_PIVOT_ANNOTATIONS_MAP,
        );

        expect(result).toEqual([90402, 2120777]);
    });

    it('Should return null if cell is falsy value', () => {
        const result = getCurrentRowColorValues(
            MOCKED_PIVOT_DATA_ROWS_WITH_EMPTY_CELL[0],
            MOCKED_PIVOT_ANNOTATIONS_MAP,
        );

        expect(result).toEqual([425.23, null]);
    });

    it('Should return null when annotation is not found', () => {
        const result = getCurrentRowColorValues(MOCKED_PIVOT_DATA_ROWS[0], {});

        expect(result).toEqual([null, null]);
    });

    it('Should return null when colorValue is invalid', () => {
        const result = getCurrentRowColorValues(
            MOCKED_PIVOT_DATA_ROWS_WITH_INVALID_VALUES[0],
            MOCKED_PIVOT_ANNOTATIONS_MAP,
        );

        expect(result).toEqual([4205.45, null, null, null, null, null]);
    });
});

describe('getColorSettings', () => {
    it('Should return colorValues null|number array with min and max values from pivot rows', () => {
        const result = getColorSettings({
            rows: MOCKED_PIVOT_DATA_ROWS,
            annotationsMap: MOCKED_PIVOT_ANNOTATIONS_MAP,
        });

        const expectedColorValues = [
            [90402, 2120777],
            [5555, 142023],
            [156, 4748],
        ];

        expect(result!.colorValues).toEqual(expectedColorValues);
        expect(result!.min).toEqual(156);
        expect(result!.max).toEqual(2120777);
    });

    it('Should return undefined when rows are empty', () => {
        const result = getColorSettings({
            rows: [],
            annotationsMap: MOCKED_PIVOT_ANNOTATIONS_MAP,
        });

        expect(result).toBeUndefined();
    });

    it('Should return null in row array if data is not valid: [undefined, null, ""]', () => {
        const result = getColorSettings({
            rows: MOCKED_PIVOT_DATA_ROWS_WITH_FALSY_VALUES,
            annotationsMap: MOCKED_PIVOT_ANNOTATIONS_MAP,
        });

        expect(result!.colorValues).toEqual([[null, null, null]]);
    });

    it('Should return 0 as min and max when all data is not valid: [undefined, null, ""]', () => {
        const result = getColorSettings({
            rows: MOCKED_PIVOT_DATA_ROWS_WITH_FALSY_VALUES,
            annotationsMap: MOCKED_PIVOT_ANNOTATIONS_MAP,
        });

        expect(result!.min).toEqual(0);
        expect(result!.max).toEqual(0);
    });
});

describe('colorizePivotTableByColorField', () => {
    let PIVOT_ROWS: any[] = [];
    beforeEach(() => {
        // cloning the object for each test because colorizePivotTableByColorField mutate the rows
        PIVOT_ROWS = cloneDeep(MOCKED_PIVOT_ROWS);
    });

    it('Should return cells with css property', () => {
        colorizePivotTableByColorField({
            rows: PIVOT_ROWS,
            colorsConfig: MOCKED_PIVOT_COLORS_CONFIG,
            colors: MOCKED_COLORS_FIELDS,
            rowHeaderLength: 1,
            rowsData: MOCKED_PIVOT_DATA_ROWS,
            annotationsMap: MOCKED_PIVOT_ANNOTATIONS_MAP,
        });

        expect(PIVOT_ROWS).toStrictEqual([
            {
                cells: [
                    {
                        id: 0,
                        isTotalCell: false,
                        value: 'Australia',
                    },
                    {
                        css: {
                            backgroundColor: 'rgb(5, 73, 166)',
                            color: '#FFF',
                            value: 90402,
                        },
                        formattedValue: '657,06',
                        id: 1,
                        value: 657.058,
                    },
                    {
                        css: {
                            backgroundColor: 'rgb(140, 203, 255)',
                            color: '#FFF',
                            value: 2120777,
                        },
                        formattedValue: '2 901,74',
                        id: 2,
                        value: 2901.739000000002,
                    },
                ],
            },
            {
                cells: [
                    {
                        id: 3,
                        isTotalCell: false,
                        value: 'Austria',
                    },
                    {
                        css: {
                            backgroundColor: 'rgb(0, 68, 163)',
                            color: '#FFF',
                            value: 5555,
                        },
                        formattedValue: '7,89',
                        id: 4,
                        value: 7.891,
                    },
                    {
                        css: {
                            backgroundColor: 'rgb(9, 77, 169)',
                            color: '#FFF',
                            value: 142023,
                        },
                        formattedValue: '661,35',
                        id: 5,
                        value: 661.3510000000002,
                    },
                ],
            },
        ]);
    });

    it('Should not mutate rows when colors is empty', () => {
        colorizePivotTableByColorField({
            rows: PIVOT_ROWS,
            colorsConfig: MOCKED_PIVOT_COLORS_CONFIG,
            colors: [],
            rowHeaderLength: 1,
            rowsData: MOCKED_PIVOT_DATA_ROWS,
            annotationsMap: MOCKED_PIVOT_ANNOTATIONS_MAP,
        });

        expect(PIVOT_ROWS).toEqual(MOCKED_PIVOT_ROWS);
    });

    it('Should not mutate rows when colors are Measure Names', () => {
        colorizePivotTableByColorField({
            rows: PIVOT_ROWS,
            colorsConfig: MOCKED_PIVOT_COLORS_CONFIG,
            colors: MOCKED_COLORS_FIELDS_MEASURE_NAME,
            rowHeaderLength: 1,
            rowsData: MOCKED_PIVOT_DATA_ROWS,
            annotationsMap: MOCKED_PIVOT_ANNOTATIONS_MAP,
        });

        expect(PIVOT_ROWS).toEqual(MOCKED_PIVOT_ROWS);
    });

    it('Should not mutate rows when colorsSettings is undefined', () => {
        colorizePivotTableByColorField({
            rows: PIVOT_ROWS,
            colorsConfig: MOCKED_PIVOT_COLORS_CONFIG,
            colors: [],
            rowHeaderLength: 1,
            rowsData: MOCKED_PIVOT_DATA_ROWS,
            annotationsMap: {},
        });

        expect(PIVOT_ROWS).toEqual(MOCKED_PIVOT_ROWS);
    });
});
