import {getRegularFields} from '../helpers';

import {ORDER_BY_MAP} from './mocks/common.mock';
import {
    COLUMNS,
    COLUMNS_MEASURE_NAME,
    MEASURES,
    ROWS,
    ROWS_MEASURE_NAME_AND_MEASURE_VALUE,
} from './mocks/getRegularFields.mock';

describe('getRegularFields', () => {
    it('Should return a stacked array of columns', () => {
        const {columnsReq} = getRegularFields({
            columns: COLUMNS,
            orderByMap: {},
            legendItemCounter: {legendItemIdIndex: 0},
            rows: [],
            measures: [],
        });

        expect(columnsReq).toEqual([
            {
                legend_item_id: 0,
                block_id: 0,
                role_spec: {
                    role: 'pivot_column',
                    direction: 'asc',
                },
                ref: {type: 'id', id: '9aa48a4f-cace-4256-bd59-55fc7aa43c4f'},
            },
        ]);
    });

    it('Must return the accumulated array of strings', () => {
        const {rowsReq} = getRegularFields({
            columns: [],
            orderByMap: {},
            legendItemCounter: {legendItemIdIndex: 0},
            rows: ROWS,
            measures: [],
        });

        expect(rowsReq).toEqual([
            {
                legend_item_id: 0,
                block_id: 0,
                role_spec: {
                    role: 'pivot_row',
                    direction: 'asc',
                },
                ref: {type: 'id', id: '56185375-6b39-4ca2-aec2-f0971b7332bc'},
            },
        ]);
    });

    it('Must return the accumulated array of measures', () => {
        const {measuresReq} = getRegularFields({
            columns: [],
            orderByMap: {},
            legendItemCounter: {legendItemIdIndex: 0},
            rows: [],
            measures: MEASURES,
        });

        expect(measuresReq).toEqual([
            {
                legend_item_id: 0,
                block_id: 0,
                role_spec: {
                    role: 'pivot_measure',
                    direction: 'asc',
                },
                ref: {type: 'id', id: '9781c180-fe55-11ea-be64-078ac452d479'},
            },
        ]);
    });

    it('Should return a stacked array of columns if Measure Names is there', () => {
        const {columnsReq} = getRegularFields({
            columns: COLUMNS_MEASURE_NAME,
            orderByMap: {},
            legendItemCounter: {legendItemIdIndex: 0},
            rows: [],
            measures: [],
        });

        expect(columnsReq).toEqual([
            {
                legend_item_id: 0,
                block_id: 0,
                role_spec: {
                    role: 'pivot_column',
                    direction: 'asc',
                },
                ref: {type: 'measure_name'},
            },
        ]);
    });

    it('Should return the accumulated array of strings if there is a Measure Names or Measure Values', () => {
        const {rowsReq} = getRegularFields({
            columns: [],
            orderByMap: {},
            legendItemCounter: {legendItemIdIndex: 0},
            rows: ROWS_MEASURE_NAME_AND_MEASURE_VALUE,
            measures: [],
        });

        expect(rowsReq).toEqual([
            {
                legend_item_id: 0,
                block_id: 0,
                role_spec: {
                    role: 'pivot_row',
                    direction: 'asc',
                },
                ref: {type: 'measure_name'},
            },
            {
                legend_item_id: 1,
                block_id: 0,
                role_spec: {
                    role: 'pivot_row',
                    direction: 'asc',
                },
                ref: {type: 'measure_name'},
            },
        ]);
    });

    it('Must put direction, depending on the orderByMap object', () => {
        const {columnsReq, rowsReq, measuresReq} = getRegularFields({
            columns: COLUMNS,
            orderByMap: ORDER_BY_MAP,
            legendItemCounter: {legendItemIdIndex: 0},
            rows: ROWS,
            measures: MEASURES,
        });

        expect(columnsReq[0].role_spec?.direction).toEqual('desc');
        expect(rowsReq[0].role_spec?.direction).toEqual('asc');
        expect(measuresReq[0].role_spec?.direction).toEqual('desc');
    });

    it('Must increment legend_item_id by one for each field in turn: [columnsReq, rowsReq, measuresReq, colorsReq]', () => {
        const {columnsReq, rowsReq, measuresReq} = getRegularFields({
            columns: COLUMNS,
            rows: ROWS,
            measures: MEASURES,
            legendItemCounter: {legendItemIdIndex: 0},
            orderByMap: {},
        });

        expect(columnsReq[0].legend_item_id).toEqual(0);
        expect(rowsReq[0].legend_item_id).toEqual(1);
        expect(measuresReq[0].legend_item_id).toEqual(2);
    });
});
