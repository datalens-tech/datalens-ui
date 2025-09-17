import type {QLConfigQuery} from '../../../../../../../shared';
import {ConnectorType} from '../../../../../../../shared';
import {convertConnectionType} from '../connection';
import {buildSource, doesQueryContainOrderBy, iterateThroughVisibleQueries} from '../misc-helpers';

const MOCK_ID = 'MOCK_ID';

const commonBuildSourceArgsSet = {
    id: MOCK_ID,
    connectionType: 'postgres',
    qlConnectionTypeMap: {postgres: ConnectorType.Postgres},
};

const mockedBuildSourceArgsSet = {
    ...commonBuildSourceArgsSet,
    query: 'select built_year, iznos from public.sample where built_year in {{years}} limit 10',
    params: {years: '1995'},
    paramsDescription: [
        {type: 'string', name: 'years', defaultValue: ['1990', '1995'], overridenValue: '1995'},
    ],
};

const expectedBuildSourceResultSet = {
    url: `/_bi_connections/${MOCK_ID}/dashsql`,
    method: 'post',
    data: {
        sql_query:
            "select built_year, iznos from public.sample where built_year in (E'1995') limit 10",
        params: {},
    },
};

const mockedBuildSourceArgsSingle = {
    ...commonBuildSourceArgsSet,
    query: 'select built_year, iznos from public.sample where built_year = {{years}} limit 10',
    params: {years: '1995'},
    paramsDescription: [
        {type: 'string', name: 'years', defaultValue: ['1990', '1995'], overridenValue: '1995'},
    ],
};

const expectedBuildSourceResultSingle = {
    url: `/_bi_connections/${MOCK_ID}/dashsql`,
    method: 'post',
    data: {
        sql_query:
            "select built_year, iznos from public.sample where built_year = E'1995' limit 10",
        params: {},
    },
};

const mockedBuildSourceArgsPrewrapped = {
    ...commonBuildSourceArgsSet,
    query: 'select built_year, iznos from public.sample where built_year in ({{years}}) limit 10',
    params: {years: '1995'},
    paramsDescription: [
        {type: 'string', name: 'years', defaultValue: ['1990', '1995'], overridenValue: '1995'},
    ],
};

const expectedBuildSourceResultPrewrapped = {
    url: `/_bi_connections/${MOCK_ID}/dashsql?with_export_info=true`,
    method: 'post',
    data: {
        sql_query:
            "select built_year, iznos from public.sample where built_year in (E'1995') limit 10",
        params: {},
    },
};

jest.mock('../../../../../../registry', () => {
    return {
        registry: {
            getConvertConnectorTypeToQLConnectionType: () => convertConnectionType,
        },
    };
});

describe('buildSource', () => {
    it('should work correctly with parameter-set substitution', () => {
        const buildSourceResult = buildSource(mockedBuildSourceArgsSet);

        expect(buildSourceResult).toEqual(expectedBuildSourceResultSet);
    });

    it('should work correctly with substitution of parameter "scalar" value', () => {
        const buildSourceResult = buildSource(mockedBuildSourceArgsSingle);

        expect(buildSourceResult).toEqual(expectedBuildSourceResultSingle);
    });

    it('should work correctly with parameter-set substitution where value is already wrapped by user', () => {
        const buildSourceResult = buildSource(mockedBuildSourceArgsPrewrapped);

        expect(buildSourceResult).toEqual(expectedBuildSourceResultPrewrapped);
    });
});

describe('iterateThroughVisibleQueries', () => {
    it('should execute callback only for queries where hidden property is falsy', () => {
        const cb = jest.fn();

        const queries: QLConfigQuery[] = [
            {queryName: 'Query #1', value: 'sql-1', params: [], hidden: false},
            {queryName: 'Query #2', value: 'sql-2', params: [], hidden: true},
            {queryName: 'Query #3', value: 'sql-3', params: [], hidden: false},
            {queryName: 'Query #4', value: 'sql-4', params: [], hidden: false},
            {queryName: 'Query #5', value: 'sql-5', params: []},
        ];

        iterateThroughVisibleQueries(queries, cb);

        expect(cb.mock.calls.length).toEqual(4);
        expect(
            cb.mock.calls.every((args) => {
                const index = args[1];
                return index !== 1;
            }),
        );
    });
});

describe('doesQueryContainOrderBy', () => {
    it('should return true when order by is used normally', () => {
        const queryContainsOrderBy = doesQueryContainOrderBy('select a from b order by a desc');

        expect(queryContainsOrderBy).toEqual(true);
    });

    it('should return false when order by is not used', () => {
        const queryContainsOrderBy = doesQueryContainOrderBy('select a from b');

        expect(queryContainsOrderBy).toEqual(false);
    });

    it('should return false when order by is commented out', () => {
        const queryContainsOrderBy = doesQueryContainOrderBy('select a from b -- order by a desc');

        expect(queryContainsOrderBy).toEqual(false);
    });

    it('should return true when order by is used normally, but query contains -- in quotes', () => {
        const queryContainsOrderBy = doesQueryContainOrderBy(
            `select a from b where a like '%--%' order by a`,
        );

        expect(queryContainsOrderBy).toEqual(true);
    });

    it('should return false when order by is used as a string', () => {
        const queryContainsOrderBy = doesQueryContainOrderBy(
            `select a from b where a = 'order by'`,
        );

        expect(queryContainsOrderBy).toEqual(false);
    });
});
