import preparePivotTable from '../old-pivot-table';
const {
    baseCase1,
    baseCase2,
    baseCase3,
    baseCase4,
    baseCase5,
    baseCase6,
    baseCase7,
    baseCase8,
    baseCase9,
    baseCase10,
    baseCase11,
    baseCase12,
    baseCase13,
    baseCase14,

    preparingGrouppedMarkupDataWith1ColumnLevel,
    preparingGrouppedMarkupDataWith2ColumnLevel,
    preparingPivotTableWithEmptyAndNullValues,
    preparingSortedTable,
    preparingDataWithShiftedMeasureNames,
    preparingDataWithDataByNullKeys,
} = require('./mocks/old-pivot-table.mock');

describe('pivot-table', () => {
    test('base case 1', () => {
        const result = preparePivotTable(baseCase1) as any;

        expect(result.head.length).toEqual(6);
        expect(result.rows.length).toEqual(17);

        expect(result.rows[0].cells[2].value).toBeCloseTo(21065.32);
        expect(result.rows[0].cells[5].value).toBeCloseTo(68536.88);
        expect(result.rows[16].cells[2].value).toBeCloseTo(53615.87);
        expect(result.rows[16].cells[5].value).toBeCloseTo(197147.72);
    });

    test('base case 2', () => {
        const result = preparePivotTable(baseCase2) as any;

        expect(result.head.length).toEqual(4);
        expect(result.rows.length).toEqual(1);

        expect(result.head[0].name).toEqual('First Class');
        expect(result.head[3].name).toEqual('Standard Class');
    });

    test('base case 3', () => {
        const result = preparePivotTable(baseCase3) as any;

        expect(result.head.length).toEqual(2);
        expect(result.rows.length).toEqual(4);

        expect(result.rows[0].cells[0].value).toEqual('First Class');
        expect(result.rows[3].cells[0].value).toEqual('Standard Class');
    });

    test('base case 4', () => {
        const result = preparePivotTable(baseCase4) as any;

        expect(result.head.length).toEqual(1);
        expect(result.rows.length).toEqual(1);

        expect(result.head[0].name).toEqual('Sales (1)');
        expect(result.rows[0].cells[0].value).toBeCloseTo(2297200.86);
    });

    test('base case 5', () => {
        const result = preparePivotTable(baseCase5) as any;

        expect(result.head.length).toEqual(5);
        expect(result.rows.length).toEqual(1);

        expect(result.rows[0].cells[0].value).toEqual('Sales (1)');
        expect(result.rows[0].cells[4].value).toBeCloseTo(1358215.74);
    });

    test('base case 6', () => {
        const result = preparePivotTable(baseCase6) as any;

        expect(result.head.length).toEqual(2);
        expect(result.rows.length).toEqual(4);

        expect(result.head[1].name).toEqual('Sales (1)');
        expect(result.rows[0].cells[0].value).toEqual('First Class');
        expect(result.rows[0].cells[1].value).toBeCloseTo(351428.42);
        expect(result.rows[3].cells[1].value).toBeCloseTo(1358215.74);
    });

    test('base case 7', () => {
        const result = preparePivotTable(baseCase7) as any;

        expect(result.head.length).toEqual(4);
        expect(result.rows.length).toEqual(4);

        expect(result.head[1].name).toEqual('Consumer');
        expect(result.rows[0].cells[0].value).toEqual('First Class');
        expect(result.rows[0].cells[1].value).toBeCloseTo(159168.96, 1);
        expect(result.rows[3].cells[1].value).toBeCloseTo(710137.07);
        expect(result.rows[0].cells[3].value).toBeCloseTo(86400.99);
        expect(result.rows[3].cells[3].value).toBeCloseTo(239038.14);
    });

    test('base case 8', () => {
        const result = preparePivotTable(baseCase8) as any;

        expect(result.head.length).toEqual(4);
        expect(result.rows.length).toEqual(4);

        expect(result.head[1].name).toEqual('Consumer');
        expect(result.rows[0].cells[0].value).toEqual('First Class');
    });

    test('base case 9', () => {
        const result = preparePivotTable(baseCase9) as any;

        expect(result.head.length).toEqual(4);
        expect(result.rows.length).toEqual(4);

        expect(result.head[1].name).toEqual('Consumer');
        expect(result.rows[0].cells[0].value).toEqual('First Class');
        expect(result.rows[0].cells[1].css.backgroundColor.replace(/\s/g, '')).toEqual(
            'rgb(27,94,181)',
        );
        expect(result.rows[0].cells[3].css.backgroundColor.replace(/\s/g, '')).toEqual(
            'rgb(12,80,171)',
        );
        expect(result.rows[3].cells[1].css.backgroundColor.replace(/\s/g, '')).toEqual(
            'rgb(140,203,255)',
        );
        expect(result.rows[3].cells[3].css.backgroundColor.replace(/\s/g, '')).toEqual(
            'rgb(44,110,191)',
        );
    });

    test('base case 10', () => {
        const result = preparePivotTable(baseCase10) as any;

        expect(result.head.length).toEqual(4);
        expect(result.rows.length).toEqual(4);

        expect(result.head[1].name).toEqual('Consumer');
        expect(result.rows[0].cells[0].value).toEqual('First Class');
        expect(result.rows[0].cells[1].css.backgroundColor.replace(/\s/g, '')).toEqual(
            'rgb(27,94,181)',
        );
        expect(result.rows[0].cells[3].css.backgroundColor.replace(/\s/g, '')).toEqual(
            'rgb(12,80,171)',
        );
        expect(result.rows[3].cells[1].css.backgroundColor.replace(/\s/g, '')).toEqual(
            'rgb(140,203,255)',
        );
        expect(result.rows[3].cells[3].css.backgroundColor.replace(/\s/g, '')).toEqual(
            'rgb(44,110,191)',
        );
        expect(result.rows[0].cells[1].value).toBeCloseTo(159168.96, 1);
        expect(result.rows[3].cells[1].value).toBeCloseTo(710137.07);
        expect(result.rows[0].cells[3].value).toBeCloseTo(86400.99);
        expect(result.rows[3].cells[3].value).toBeCloseTo(239038.14);
    });

    test('base case 11', () => {
        const result = preparePivotTable(baseCase11) as any;

        expect(result.head.length).toEqual(5);
        expect(result.rows.length).toEqual(176);

        expect(result.head[2].name).toEqual('Consumer');
        expect(result.rows[0].cells[0].value).toEqual('First Class');
        expect(result.rows[0].cells[1].value).toEqual('Alabama');
        expect(result.rows[0].cells[2].value).toBeCloseTo(8.96);
        expect(result.rows[1].cells[0].value).toEqual('First Class');
        expect(result.rows[1].cells[1].value).toEqual('Arizona');
        expect(result.rows[1].cells[2].value).toBeCloseTo(1988.72);
    });

    test('base case 12', () => {
        const result = preparePivotTable(baseCase12) as any;

        expect(result.head.length).toEqual(4);
        expect(result.head[1].sub.length).toEqual(47);
        expect(result.rows.length).toEqual(4);

        expect(result.head[1].name).toEqual('Consumer');
        expect(result.rows[0].cells[0].value).toEqual('First Class');
        expect(result.rows[0].cells[1].value).toBeCloseTo(8.96);
        expect(result.rows[1].cells[0].value).toEqual('Same Day');
        expect(result.rows[1].cells[1].value).toBeCloseTo(29);
    });

    test('base case 13', () => {
        const result = preparePivotTable(baseCase13) as any;

        expect(result.head.length).toEqual(3);
        expect(result.rows.length).toEqual(176);
    });

    test('base case 14', () => {
        const result = preparePivotTable(baseCase14) as any;

        expect(result.head.length).toEqual(4);
        expect(result.head[1].sub.length).toEqual(39);
        expect(result.rows.length).toEqual(1);
    });

    test('should prepare 10+1 columns and 2 rows table', () => {
        const result = preparePivotTable(preparingGrouppedMarkupDataWith1ColumnLevel) as any;
        expect(result.head.length).toEqual(11);
        expect(result.rows.length).toEqual(2);
    });

    test('should prepare 2+1 columns and 9 rows table', () => {
        const result = preparePivotTable(preparingGrouppedMarkupDataWith2ColumnLevel) as any;
        expect(result.head.length).toEqual(3);
        expect(result.rows.length).toEqual(9);
    });

    test('should sort dates ascending and order status ascending', () => {
        const result = preparePivotTable(preparingSortedTable) as any;
        expect(result.head[3].name).toEqual('-1');
        expect(result.head[4].name).toEqual('65');
        expect(result.head[5].name).toEqual('92');
        expect(result.head[8].name).toEqual('99');

        expect(result.rows[0].cells[2].value).toEqual('13.02.2021 08:00:00');
        expect(result.rows[1].cells[2].value).toEqual('13.02.2021 17:00:00');
        expect(result.rows[2].cells[2].value).toEqual('13.02.2021 18:00:00');
        expect(result.rows[24].cells[2].value).toEqual('14.02.2021 06:00:00');
    });

    test('should prepare table with null and empty string values', () => {
        const result = preparePivotTable(preparingPivotTableWithEmptyAndNullValues) as any;
        expect(result.head.length).toEqual(3);
        expect(result.rows.length).toEqual(205);

        expect(result.rows[0].cells[2].value).toEqual(8257.2523776);
        expect(result.rows[12].cells[2].value).toEqual(812446.068);
        expect(result.rows[18].cells[0].value).toEqual(null);
    });

    test('should prepare table with shifted measure names correctly', () => {
        const result = preparePivotTable(preparingDataWithShiftedMeasureNames) as any;
        expect(result.head.length).toEqual(6);
        expect(result.rows.length).toEqual(66);

        expect(result.rows[0].cells[3].value).toEqual(3574310);
        expect(result.rows[0].cells[5].value).toEqual(3142528);
        expect(result.rows[65].cells[3].value).toEqual(5.25);
        expect(result.rows[65].cells[5].value).toEqual(50.06);
    });

    test('should prepare table with data by null keys', () => {
        const result = preparePivotTable(preparingDataWithDataByNullKeys) as any;
        expect(result.head.length).toEqual(3);
        expect(result.rows.length).toEqual(13);

        expect(result.rows[12].cells[0].value).toEqual(null);
        expect(result.rows[12].cells[1].value).toEqual(177689);
        expect(result.rows[12].cells[2].value).toEqual(2433471983.5393696);
    });
});
