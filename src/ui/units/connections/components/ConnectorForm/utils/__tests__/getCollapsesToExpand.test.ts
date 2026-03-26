import type {Row} from 'shared/schema/types';

import type {FormDict} from '../../../../typings';
import {getCollapsesToExpand} from '../index';

const COLLAPSE_ROW: Row = {
    type: 'collapse',
    name: 'advanced',
    text: 'Advanced',
    inner: true,
};

const SECOND_COLLAPSE_ROW: Row = {
    type: 'collapse',
    name: 'extra',
    text: 'Extra',
    inner: true,
};

const ROW_WITH_CONDITIONS: Row = {
    items: [
        {
            id: 'input',
            name: 'host',
            displayConditions: {advanced: true},
        },
    ],
};

const ROW_WITHOUT_CONDITIONS: Row = {
    items: [
        {
            id: 'input',
            name: 'port',
        },
    ],
};

const ROW_WITH_MULTIPLE_ITEMS: Row = {
    items: [
        {
            id: 'input',
            name: 'db_name',
            displayConditions: {advanced: true},
        },
        {
            id: 'input',
            name: 'timeout',
            displayConditions: {extra: true},
        },
        {
            id: 'input',
            name: 'username',
        },
    ],
};

const ROW_WITH_NON_COLLAPSE_CONDITION: Row = {
    items: [
        {
            id: 'input',
            name: 'ssl_cert',
            displayConditions: {use_ssl: true},
        },
    ],
};

const CACHE_TTL_ROW: Row = {
    type: 'cache_ttl_sec',
    name: 'cache_ttl',
};

describe('connections/components/ConnectorForm/utils/getCollapsesToExpand', () => {
    test.each<[Row[], string[], FormDict]>([
        // No rows — empty result
        [[], ['host'], {}],
        // No error names — empty result
        [[COLLAPSE_ROW, ROW_WITH_CONDITIONS], [], {}],
        // Error field inside collapse — returns collapse to expand
        [[COLLAPSE_ROW, ROW_WITH_CONDITIONS], ['host'], {advanced: true}],
        // Error field without displayConditions — not linked to collapse
        [[COLLAPSE_ROW, ROW_WITHOUT_CONDITIONS], ['port'], {}],
        // Error field has displayConditions but not matching a collapse
        [[COLLAPSE_ROW, ROW_WITH_NON_COLLAPSE_CONDITION], ['ssl_cert'], {}],
        // Multiple items, multiple collapses — expands only relevant ones
        [[COLLAPSE_ROW, SECOND_COLLAPSE_ROW, ROW_WITH_MULTIPLE_ITEMS], ['timeout'], {extra: true}],
        // Multiple error fields in different collapses
        [
            [COLLAPSE_ROW, SECOND_COLLAPSE_ROW, ROW_WITH_MULTIPLE_ITEMS],
            ['db_name', 'timeout'],
            {advanced: true, extra: true},
        ],
        // Error field with no displayConditions among others — only matched are expanded
        [
            [COLLAPSE_ROW, SECOND_COLLAPSE_ROW, ROW_WITH_MULTIPLE_ITEMS],
            ['db_name', 'username'],
            {advanced: true},
        ],
        // Non-collapse prepared row (cache_ttl) is ignored
        [[CACHE_TTL_ROW, ROW_WITH_CONDITIONS], ['host'], {}],
        // Error name not present in any row items — empty result
        [[COLLAPSE_ROW, ROW_WITH_CONDITIONS], ['unknown_field'], {}],
    ])('getCollapsesToExpand (rows: %j, errorNames: %j)', (rows, errorNames, expected) => {
        const result = getCollapsesToExpand(rows, errorNames);
        expect(result).toEqual(expected);
    });
});
