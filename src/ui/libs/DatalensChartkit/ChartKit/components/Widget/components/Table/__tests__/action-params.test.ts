import type {StringParams, TableHead} from 'shared';

import {mergeStringParams} from '../utils/action-params';

const HEAD_1 = {id: 'p1'} as TableHead;

describe('chartkit/Table/utils/action-params', () => {
    test.each<[Parameters<typeof mergeStringParams>[0], StringParams]>([
        [{current: {p1: ['1']}, row: {p1: ['2']}}, {p1: ['2']}],
        [{current: {p1: ['1']}, row: {p1: ['1']}}, {p1: ['']}],

        [{current: {p1: ['1']}, row: {p1: ['1']}, metaKey: true}, {p1: ['']}],
        [{current: {p1: ['1']}, row: {p1: ['2']}, metaKey: true}, {p1: ['1', '2']}],
        [{current: {p1: ['1', '2']}, row: {p1: ['1']}, metaKey: true}, {p1: ['2']}],
        [
            {current: {p1: ['1'], p2: ['1']}, row: {p1: ['1']}, metaKey: true},
            {p1: [''], p2: ['1']},
        ],
        [{current: {p1: '1'}, row: {p1: '2'}, metaKey: true}, {p1: ['1', '2']}],
        [{current: {p1: '1'}, row: {p1: ['2']}, metaKey: true}, {p1: ['1', '2']}],
        [{current: {p1: ['1']}, row: {p1: '2'}, metaKey: true}, {p1: ['1', '2']}],
        [{current: {p1: '1'}, row: {p1: '1'}, metaKey: true}, {p1: ['']}],
        [{current: {p1: '1'}, row: {p1: ['1']}, metaKey: true}, {p1: ['']}],
        [{current: {p1: ['1']}, row: {p1: '1'}, metaKey: true}, {p1: ['']}],

        [
            {
                current: {p1: ['1']},
                row: {p1: ['1']},
                metaKey: true,
                selectedRows: [{cells: [{value: '1'}]}],
                head: [HEAD_1],
            },
            {p1: ['']},
        ],
        [
            {
                current: {p1: ['1']},
                row: {p1: ['1']},
                metaKey: true,
                selectedRows: [{cells: [{value: '1'}]}, {cells: [{value: '1'}]}],
                head: [HEAD_1],
            },
            {p1: ['']},
        ],
        [
            {
                current: {p1: '1'},
                row: {p1: ['1']},
                metaKey: true,
                selectedRows: [{cells: [{value: '1'}]}, {cells: [{value: '1'}]}],
                head: [HEAD_1],
            },
            {p1: ['']},
        ],
        [
            {
                current: {p1: '1'},
                row: {p1: '1'},
                metaKey: true,
                selectedRows: [{cells: [{value: '1'}]}, {cells: [{value: '1'}]}],
                head: [HEAD_1],
            },
            {p1: ['']},
        ],
        [
            {
                current: {p1: ['1']},
                row: {p1: '1'},
                metaKey: true,
                selectedRows: [{cells: [{value: '1'}]}, {cells: [{value: '1'}]}],
                head: [HEAD_1],
            },
            {p1: ['']},
        ],

        [
            {
                current: {p1: ['1p']},
                row: {p1: ['1p']},
                metaKey: true,
                selectedRows: [{cells: [{value: '1', custom: {actionParams: {p1: ['1p']}}}]}],
                head: [HEAD_1],
            },
            {p1: ['']},
        ],
        [
            {
                current: {p1: ['1p']},
                row: {p1: ['1p']},
                metaKey: true,
                selectedRows: [
                    {cells: [{value: '1', custom: {actionParams: {p1: ['1p']}}}]},
                    {cells: [{value: '1', custom: {actionParams: {p1: ['1p']}}}]},
                ],
                head: [HEAD_1],
            },
            {p1: ['']},
        ],
    ])('mergeStringParams (argIndex: %#)', (args, expected) => {
        const result = mergeStringParams(args);
        expect(result).toEqual(expected);
    });
});
