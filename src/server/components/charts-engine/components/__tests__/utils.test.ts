import {URL_ACTION_PARAMS_PREFIX} from '../../../../../shared';
import {normalizeParams} from '../utils';

const cloneDeep = require('lodash/cloneDeep');
const MockDate = require('mockdate');

const {resolveParams, resolveNormalizedParams} = require('../utils');

MockDate.set('2020-02-14T22:34:55.359Z');

const normalizeParamsTestData = {
    test1: {
        in: {
            param1: '1',
            param2: ['2'],
        },
        out: {
            params: {
                param1: ['1'],
                param2: ['2'],
            },
            actionParams: {},
        },
    },
    test2: {
        in: {
            param1: '1',
            param2: ['2'],
            [`${URL_ACTION_PARAMS_PREFIX}param3`]: '3',
            [`${URL_ACTION_PARAMS_PREFIX}param4`]: ['4'],
        },
        out: {
            params: {
                param1: ['1'],
                param2: ['2'],
            },
            actionParams: {
                param3: ['3'],
                param4: ['4'],
            },
        },
    },
    test3: {
        in: {
            [`${URL_ACTION_PARAMS_PREFIX}param3`]: '3',
            [`${URL_ACTION_PARAMS_PREFIX}param4`]: ['4'],
        },
        out: {
            params: {},
            actionParams: {
                param3: ['3'],
                param4: ['4'],
            },
        },
    },
};

describe('Charts Engine utils', () => {
    test('do not change incorrect formats', () => {
        const params = {
            a: [''],
            b: ['2020-01-01T00:00:00.000Z'],
            c: ['__relative_*0d'],
            d: ['__relative_-0T'],
            f: ['__interval___relative_-0d_'],
            e: ['__interval___relative_-14d__relative_-7d'],
            g: ['__interval_2020-01-01_'],
            h: ['__interval_2020-01-01T23:59_01.01.2010'],
            i: ['__interval_2020-01-01 23:59_2010-01-01'],
        };

        const resolvedNormalizedParams = resolveNormalizedParams(params);

        const resolvedParams = cloneDeep(params);
        resolveParams(resolvedParams);

        expect(resolvedParams).toStrictEqual(params);
        expect(resolvedNormalizedParams).toStrictEqual(params);
    });

    test('resolve relative', () => {
        const params = {
            a: ['__relative_-0d'],
            b: ['__relative_+1w'],
            c: ['__relative_-2M'],
            d: ['__relative_+3Q'],
            e: ['__relative_-4y'],
            f: ['__relative_-24h'],
            g: ['__relative_+60m'],
            h: ['__relative_-300s'],
            i: ['__relative_+1000ms'],
            j: ['2021-01-01T00:00:00.000Z'],
        };

        const resolvedNormalizedParams = resolveNormalizedParams(params);

        const resolvedParams = cloneDeep(params);
        resolveParams(resolvedParams);

        const expectation = {
            a: ['2020-02-14T00:00:00.000Z'],
            b: ['2020-02-21T00:00:00.000Z'],
            c: ['2019-12-14T00:00:00.000Z'],
            d: ['2020-11-14T00:00:00.000Z'],
            e: ['2016-02-14T00:00:00.000Z'],
            f: ['2020-02-13T22:34:55.359Z'],
            g: ['2020-02-14T23:34:55.359Z'],
            h: ['2020-02-14T22:29:55.359Z'],
            i: ['2020-02-14T22:34:56.359Z'],
            j: ['2021-01-01T00:00:00.000Z'],
        };

        expect(resolvedParams).toStrictEqual(expectation);
        expect(resolvedNormalizedParams).toStrictEqual(expectation);
    });

    test('resolve relative with cast', () => {
        const params = {
            a: ['__relative_-0d_sw'],
            b: ['__relative_+1w_eM'],
            c: ['__relative_-2M_sQ'],
            d: ['__relative_+3Q_ey'],
            e: ['__relative_-4y_sw'],
            f: ['__relative_-24h_em'],
            g: ['__relative_+60m_ss'],
            h: ['__relative_-300s_eh'],
            i: ['__relative_+1000ms_sd'],
            j: ['2021-01-01T00:00:00.000Z'],
        };

        const resolvedNormalizedParams = resolveNormalizedParams(params);

        const resolvedParams = cloneDeep(params);
        resolveParams(resolvedParams);

        const expectation = {
            a: ['2020-02-10T00:00:00.000Z'],
            b: ['2020-02-29T23:59:59.999Z'],
            c: ['2019-10-01T00:00:00.000Z'],
            d: ['2020-12-31T23:59:59.999Z'],
            e: ['2016-02-08T00:00:00.000Z'],
            f: ['2020-02-13T22:34:59.999Z'],
            g: ['2020-02-14T23:34:55.000Z'],
            h: ['2020-02-14T22:59:59.999Z'],
            i: ['2020-02-14T00:00:00.000Z'],
            j: ['2021-01-01T00:00:00.000Z'],
        };

        expect(resolvedParams).toStrictEqual(expectation);
        expect(resolvedNormalizedParams).toStrictEqual(expectation);
    });

    test('resolve interval', () => {
        const params = {
            a: ['__interval_01_2021'],
            b: ['__interval_2020-01-01_2021-01-01'],
            c: ['__interval_2020-01-01_2021-01-01'],
            d: ['__interval_2020-01-01_2010-01-01'],
            e: ['__interval_2020___relative_-0d'],
            f: ['__interval___relative_+0d_2099-12-31'],
            g: ['__interval_2020-01-01___relative_-15m'],
            h: ['__interval___relative_-1d___relative_+1h'],
            i: ['__interval___relative_+1h___relative_-1d'],
            j: ['2021-01-01T00:00:00.000Z'],
        };

        const resolvedNormalizedParams = resolveNormalizedParams(params);

        const resolvedParams = cloneDeep(params);
        resolveParams(resolvedParams);

        const expectation = {
            a: ['__interval_01_2021'],
            b: ['__interval_2020-01-01_2021-01-01'],
            c: ['__interval_2020-01-01_2021-01-01'],
            d: ['__interval_2020-01-01_2010-01-01'],
            e: ['__interval_2020_2020-02-14T23:59:59.999Z'],
            f: ['__interval_2020-02-14T00:00:00.000Z_2099-12-31'],
            g: ['__interval_2020-01-01_2020-02-14T22:19:55.359Z'],
            h: ['__interval_2020-02-13T00:00:00.000Z_2020-02-14T23:34:55.359Z'],
            i: ['__interval_2020-02-14T23:34:55.359Z_2020-02-13T23:59:59.999Z'],
            j: ['2021-01-01T00:00:00.000Z'],
        };

        expect(resolvedParams).toStrictEqual(expectation);
        expect(resolvedNormalizedParams).toStrictEqual(expectation);
    });

    test('resolve interval with cast', () => {
        const params = {
            a: ['__interval_01_2021'],
            b: ['__interval_2020-01-01_2021-01-01'],
            c: ['__interval_2020-01-01_2021-01-01'],
            d: ['__interval_2020-01-01_2010-01-01'],
            e: ['__interval_2020___relative_-0d_sw'],
            f: ['__interval___relative_+0d_eM_2099-12-31'],
            g: ['__interval_2020-01-01___relative_-15m_sQ'],
            h: ['__interval___relative_-1d_ey___relative_+1h_sd'],
            i: ['__interval___relative_+1h_ed___relative_-1d_sM'],
            j: ['2021-01-01T00:00:00.000Z'],
        };

        const resolvedNormalizedParams = resolveNormalizedParams(params);

        const resolvedParams = cloneDeep(params);
        resolveParams(resolvedParams);

        const expectation = {
            a: ['__interval_01_2021'],
            b: ['__interval_2020-01-01_2021-01-01'],
            c: ['__interval_2020-01-01_2021-01-01'],
            d: ['__interval_2020-01-01_2010-01-01'],
            e: ['__interval_2020_2020-02-10T00:00:00.000Z'],
            f: ['__interval_2020-02-29T23:59:59.999Z_2099-12-31'],
            g: ['__interval_2020-01-01_2020-01-01T00:00:00.000Z'],
            h: ['__interval_2020-12-31T23:59:59.999Z_2020-02-14T00:00:00.000Z'],
            i: ['__interval_2020-02-14T23:59:59.999Z_2020-02-01T00:00:00.000Z'],
            j: ['2021-01-01T00:00:00.000Z'],
        };

        expect(resolvedParams).toStrictEqual(expectation);
        expect(resolvedNormalizedParams).toStrictEqual(expectation);
    });

    test('normalizeParams different cases', () => {
        const res = normalizeParams();
        expect(res.params).toEqual({});
        expect(res.actionParams).toEqual({});

        const res1 = normalizeParams(normalizeParamsTestData.test1.in);
        expect(res1.params).toEqual(normalizeParamsTestData.test1.out.params);
        expect(res1.actionParams).toEqual(normalizeParamsTestData.test1.out.actionParams);

        const res2 = normalizeParams(normalizeParamsTestData.test2.in);
        expect(res2.params).toEqual(normalizeParamsTestData.test2.out.params);
        expect(res2.actionParams).toEqual(normalizeParamsTestData.test2.out.actionParams);

        const res3 = normalizeParams(normalizeParamsTestData.test3.in);
        expect(res3.params).toEqual(normalizeParamsTestData.test3.out.params);
        expect(res3.actionParams).toEqual(normalizeParamsTestData.test3.out.actionParams);
    });
});
