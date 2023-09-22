import {buildSource} from '../misc-helpers';

const MOCK_ID = 'MOCK_ID';

const mockedBuildSourceArgsSet = {
    id: MOCK_ID,
    connectionType: 'postgres',
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
    id: MOCK_ID,
    connectionType: 'postgres',
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
    id: MOCK_ID,
    connectionType: 'postgres',
    query: 'select built_year, iznos from public.sample where built_year in ({{years}}) limit 10',
    params: {years: '1995'},
    paramsDescription: [
        {type: 'string', name: 'years', defaultValue: ['1990', '1995'], overridenValue: '1995'},
    ],
};

const expectedBuildSourceResultPrewrapped = {
    url: `/_bi_connections/${MOCK_ID}/dashsql`,
    method: 'post',
    data: {
        sql_query:
            "select built_year, iznos from public.sample where built_year in (E'1995') limit 10",
        params: {},
    },
};

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
