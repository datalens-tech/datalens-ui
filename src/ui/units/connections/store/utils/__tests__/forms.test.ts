import type {FormApiSchemaItem} from 'shared/schema/types';

import {getResultFormData, getResultSchemaKeys} from '../forms';

const EMPTY: FormApiSchemaItem = {items: []};
const WITHOUT_CONDITIONS: FormApiSchemaItem = {
    items: [
        {
            name: 'host',
            defaultAction: 'include',
        },
        {
            name: 'port',
            defaultAction: 'skip',
        },
        {
            name: 'username',
            defaultAction: 'include',
        },
    ],
};
const WITH_CONDITIONS: FormApiSchemaItem = {
    items: [
        {
            name: 'host',
            defaultAction: 'include',
        },
        {
            name: 'port',
            defaultAction: 'include',
        },
        {
            name: 'username',
            defaultAction: 'include',
        },
    ],
    conditions: [
        {
            when: {name: 'without_host'},
            equals: true,
            then: [{selector: {name: 'host'}, action: 'skip'}],
        },
    ],
};

describe('connections/store/utils/forms', () => {
    test.each([
        [{apiSchemaItem: EMPTY}, []],
        [{apiSchemaItem: WITHOUT_CONDITIONS}, ['host', 'username']],
        [{apiSchemaItem: WITH_CONDITIONS, form: {without_host: true}}, ['port', 'username']],
        [
            {apiSchemaItem: WITH_CONDITIONS, form: {without_host: false}},
            ['host', 'port', 'username'],
        ],
        [{apiSchemaItem: WITH_CONDITIONS, innerForm: {without_host: true}}, ['port', 'username']],
        [
            {apiSchemaItem: WITH_CONDITIONS, innerForm: {without_host: false}},
            ['host', 'port', 'username'],
        ],
    ])('getResultSchemaKeys (args: %j)', (args, expected) => {
        const result = getResultSchemaKeys(args as Parameters<typeof getResultSchemaKeys>[0]);
        expect(result).toEqual(expected);
    });

    test.each([
        [{apiSchemaItem: EMPTY}, {}],
        [
            {
                apiSchemaItem: WITHOUT_CONDITIONS,
                form: {host: 'some.host', port: 5678, username: 'Some Name'},
            },
            {host: 'some.host', username: 'Some Name'},
        ],
        [
            {
                apiSchemaItem: WITH_CONDITIONS,
                form: {without_host: true, host: 'some.host', port: 5678, username: 'Some Name'},
            },
            {port: 5678, username: 'Some Name'},
        ],
        [
            {
                apiSchemaItem: WITH_CONDITIONS,
                form: {without_host: false, host: 'some.host', port: 5678, username: 'Some Name'},
            },
            {host: 'some.host', port: 5678, username: 'Some Name'},
        ],
        [
            {
                apiSchemaItem: WITH_CONDITIONS,
                form: {host: 'some.host', port: 5678, username: 'Some Name'},
                innerForm: {without_host: true},
            },
            {port: 5678, username: 'Some Name'},
        ],
        [
            {
                apiSchemaItem: WITH_CONDITIONS,
                form: {host: 'some.host', port: 5678, username: 'Some Name'},
                innerForm: {without_host: false},
            },
            {host: 'some.host', port: 5678, username: 'Some Name'},
        ],
    ])('getResultFormData (args: %j)', (args, expected) => {
        const result = getResultFormData(args as Parameters<typeof getResultFormData>[0]);
        expect(result).toEqual(expected);
    });
});
