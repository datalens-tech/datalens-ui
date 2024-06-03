import MockDate from 'mockdate';

import type {Field} from '../../types';
import {
    Operations,
    OperationsWithoutValue,
    resolveIntervalDate,
    resolveOperation,
    resolveRelativeDate,
    splitParamsToParametersAndFilters,
} from '../charts-shared';

describe('charts-shared date helpers', () => {
    MockDate.set('2020-02-14T22:34:55.359Z');

    test.each([
        [null, null],
        [undefined, null],
        ['', null],
        ['2020-01-01T00:00:00.000Z', null],
        ['__relative_*0d', null],
        ['__relative_+0T', null],
        ['__relative_-0T_ed', null],
        ['__relative_+5d_eD', null],
        ['__interval___relative_-14d___relative_-7d', null],
        ['__relative_-0d', '2020-02-14T00:00:00.000Z'],
        ['__relative_+1w', '2020-02-21T00:00:00.000Z'],
        ['__relative_-2M', '2019-12-14T00:00:00.000Z'],
        ['__relative_+3Q', '2020-11-14T00:00:00.000Z'],
        ['__relative_-4y', '2016-02-14T00:00:00.000Z'],
        ['__relative_-0d_sw', '2020-02-10T00:00:00.000Z'],
        ['__relative_+1w_eM', '2020-02-29T23:59:59.999Z'],
        ['__relative_-2M_sQ', '2019-10-01T00:00:00.000Z'],
        ['__relative_+3Q_ey', '2020-12-31T23:59:59.999Z'],
        ['__relative_-4y_sw', '2016-02-08T00:00:00.000Z'],
        ['__relative_-24h', '2020-02-13T22:34:55.359Z'],
        ['__relative_+60m', '2020-02-14T23:34:55.359Z'],
        ['__relative_-300s', '2020-02-14T22:29:55.359Z'],
        ['__relative_+1000ms', '2020-02-14T22:34:56.359Z'],
        ['__relative_-24h_em', '2020-02-13T22:34:59.999Z'],
        ['__relative_+60m_ss', '2020-02-14T23:34:55.000Z'],
        ['__relative_-300s_eh', '2020-02-14T22:59:59.999Z'],
        ['__relative_+1000ms_sd', '2020-02-14T00:00:00.000Z'],
        ['now', '2020-02-14T22:34:55.359Z'],
        ['now-0d', '2020-02-14T22:34:55.359Z'],
        ['now+1w', '2020-02-21T22:34:55.359Z'],
        ['now-2M', '2019-12-14T22:34:55.359Z'],
        ['now+3Q', '2020-11-14T22:34:55.359Z'],
        ['now-4y', '2016-02-14T22:34:55.359Z'],
        ['now-24h', '2020-02-13T22:34:55.359Z'],
        ['now+60m', '2020-02-14T23:34:55.359Z'],
        ['now-300s', '2020-02-14T22:29:55.359Z'],
        ['now+1000ms', null],
        ['now/s', '2020-02-14T22:34:55.000Z'],
        ['now/m', '2020-02-14T22:34:00.000Z'],
        ['now/d', '2020-02-14T00:00:00.000Z'],
        ['now/w', '2020-02-10T00:00:00.000Z'],
        ['now/M', '2020-02-01T00:00:00.000Z'],
        ['now/Q', '2020-01-01T00:00:00.000Z'],
        ['now/y', '2020-01-01T00:00:00.000Z'],
    ])('resolveRelativeDate (args: %j)', (input, expected) => {
        const result = resolveRelativeDate(input);
        expect(result).toEqual(expected);
    });

    test.each([
        [null, null],
        [undefined, null],
        ['', null],
        ['__relative_-0d', null],
        ['2020-01-01T00:00:00.000Z', null],
        ['__interval___relative_-0d_', null],
        ['__interval_2020-01-01_', null],
        ['__interval_2020-01-01T00:15___relative_-15m_sD', null],
        ['__interval___relative_-1d_e___relative_+1h_sd', null],
        ['__interval___relative_+1h_ed___relative_-1d_M', null],
        ['__interval_01_2021', {from: '01', to: '2021'}],
        ['__interval_2020-01-01T00:00_2021-01-01', {from: '2020-01-01T00:00', to: '2021-01-01'}],
        ['__interval_2020-01-01T23:59_2010-01-01', {from: '2020-01-01T23:59', to: '2010-01-01'}],
        [
            '__interval_2020-01-01T00:00:00_2021-01-01T00:00:00.000Z',
            {from: '2020-01-01T00:00:00', to: '2021-01-01T00:00:00.000Z'},
        ],
        ['__interval_2020___relative_-0d', {from: '2020', to: '2020-02-14T23:59:59.999Z'}],
        [
            '__interval___relative_+0d_2099-12-31',
            {from: '2020-02-14T00:00:00.000Z', to: '2099-12-31'},
        ],
        [
            '__interval_2020-01-01T00:15___relative_-15m',
            {from: '2020-01-01T00:15', to: '2020-02-14T22:19:55.359Z'},
        ],
        [
            '__interval___relative_-1d___relative_+1h',
            {from: '2020-02-13T00:00:00.000Z', to: '2020-02-14T23:34:55.359Z'},
        ],
        [
            '__interval___relative_+1h___relative_-1d',
            {from: '2020-02-14T23:34:55.359Z', to: '2020-02-13T23:59:59.999Z'},
        ],
        ['__interval_2020___relative_-0d_sw', {from: '2020', to: '2020-02-10T00:00:00.000Z'}],
        [
            '__interval___relative_+0d_eM_2099-12-31',
            {from: '2020-02-29T23:59:59.999Z', to: '2099-12-31'},
        ],
        [
            '__interval_2020-01-01T00:15___relative_-15m_sQ',
            {from: '2020-01-01T00:15', to: '2020-01-01T00:00:00.000Z'},
        ],
        [
            '__interval___relative_-1d_ey___relative_+1h_sd',
            {from: '2020-12-31T23:59:59.999Z', to: '2020-02-14T00:00:00.000Z'},
        ],
        [
            '__interval___relative_+1h_ed___relative_-1d_sM',
            {from: '2020-02-14T23:59:59.999Z', to: '2020-02-01T00:00:00.000Z'},
        ],
        ['__interval_now_2021', {from: '2020-02-14T22:34:55.359Z', to: '2021'}],
        ['__interval_01_now', {from: '01', to: '2020-02-14T22:34:55.359Z'}],
        [
            '__interval_now_now+1d',
            {from: '2020-02-14T22:34:55.359Z', to: '2020-02-15T22:34:55.359Z'},
        ],
        [
            '__interval_now/d_now/d',
            {from: '2020-02-14T00:00:00.000Z', to: '2020-02-14T23:59:59.999Z'},
        ],
    ])('resolveIntervalDate (args: %j)', (input, expected) => {
        const result = resolveIntervalDate(input);
        expect(result).toEqual(expected);
    });
});

describe('charts-shared resolveOperation', () => {
    const simpleUrlValue = '__eq_2';
    const complexUrlValue = '__between_date1_date2';
    const symbolsInUrlValue = '__contains_symbols_~_[]_\\_|_()_*_&_^_%_$_#_№_@_"_!_;_:_{}_=';
    const missedOperation = '__thisOperationIsMissed_{value}';
    const intervalUrlValue = '__interval___relative_+0d_2099-12-31';
    const withoutValue = '__eq_';

    it('should parse value from url and return object {operation: Operations, value: string}', () => {
        const expectedResult = {
            operation: Operations.EQ,
            value: '2',
        };

        const result = resolveOperation(simpleUrlValue);

        expect(result).toEqual(expectedResult);
    });

    it('should properly parse values with multiple underscores', () => {
        const expectedResult = {
            operation: Operations.BETWEEN,
            value: 'date1_date2',
        };

        const result = resolveOperation(complexUrlValue);

        expect(result).toEqual(expectedResult);
    });

    it('should properly parse values with any characters', () => {
        const expectedResult = {
            operation: Operations.CONTAINS,
            value: 'symbols_~_[]_\\_|_()_*_&_^_%_$_#_№_@_"_!_;_:_{}_=',
        };

        const result = resolveOperation(symbolsInUrlValue);

        expect(result).toEqual(expectedResult);
    });

    it('should return null if input incoming value is casted to false', () => {
        const falsyValues = [null, undefined, ''];

        const expectedResult = [null, null, null];

        const result = falsyValues.map(resolveOperation);

        expect(result).toEqual(expectedResult);
    });

    it('should return the IN/BETWEEN default operation and the entered value, if the operator is not listed in Operations', () => {
        const expectedResult = {
            operation: Operations.IN,
            value: missedOperation,
        };

        const result = resolveOperation(missedOperation);

        expect(result).toEqual(expectedResult);
    });

    it('should return the IN/BETWEEN default operation and the entered value, if operation do not have value', () => {
        const expectedResult = {
            operation: Operations.IN,
            value: withoutValue,
        };

        const result = resolveOperation(withoutValue);

        expect(result).toEqual(expectedResult);
    });

    it('should return the default BETWEEN operation if the operation has a value __interval', () => {
        const expectedResult = {
            operation: Operations.BETWEEN,
            value: intervalUrlValue,
        };

        const result = resolveOperation(intervalUrlValue);

        expect(result).toEqual(expectedResult);
    });

    it.each([
        ...Object.values(OperationsWithoutValue).map((operation) => [`__${operation}_`, operation]),
    ] as [string, string][])(
        'should return operation and value = undefined if operation does not imply value',
        (stringOperation, rawOperation) => {
            const result = resolveOperation(stringOperation);

            expect(result).toEqual({
                operation: rawOperation,
                value: undefined,
            });
        },
    );

    it.each([[{fake: 1}], [1], [[]], [true]])(
        'should return value with IN operation if value is not string',
        (value: any) => {
            const expectedValue = {
                operation: Operations.IN,
                value: value,
            };

            const result = resolveOperation(value);

            expect(result).toEqual(expectedValue);
        },
    );
});

describe('charts-shared splitParamsToParametersAndFilters', () => {
    const parameterFields = [
        {guid: 'test_guid_1', calc_mode: 'parameter', title: 'test_guid_1'},
        {guid: 'test_guid_2', calc_mode: 'parameter', title: 'test_guid_2'},
        {guid: 'test_guid_3', calc_mode: 'parameter', title: 'test_guid_3'},
        {guid: 'test_guid_4', calc_mode: 'parameter', title: 'test_guid_4'},
    ] as Field[];
    it('should delete operations from parameters', () => {
        const searchParams: Array<[string, string]> = [
            ['test_guid_1', '__eq_abc'],
            ['test_guid_2', '__in_test'],
            ['test_guid_3', 'abc'],
        ];
        const expectedSearchParams = [
            ['test_guid_1', 'abc'],
            ['test_guid_2', 'test'],
            ['test_guid_3', 'abc'],
        ];

        const result = splitParamsToParametersAndFilters(searchParams, parameterFields);

        expect(result.parametersParams).toEqual(expectedSearchParams);
    });

    it('Should delete existing operations in parameters', () => {
        const searchParams: Array<[string, string]> = [
            ['test_guid_1', '__interval_22.12.2023_23.12.2023'],
            ['test_guid_2', '__between___interval_22.12.2023_23.12.2023'],
            ['test_guid_3', '__in_abc'],
            ['test_guid_4', '__qwe_def'],
        ];
        const expectedSearchParams = [
            ['test_guid_1', '__interval_22.12.2023_23.12.2023'],
            ['test_guid_2', '__interval_22.12.2023_23.12.2023'],
            ['test_guid_3', 'abc'],
            ['test_guid_4', '__qwe_def'],
        ];

        const result = splitParamsToParametersAndFilters(searchParams, parameterFields);

        expect(result.parametersParams).toEqual(expectedSearchParams);
    });
});
