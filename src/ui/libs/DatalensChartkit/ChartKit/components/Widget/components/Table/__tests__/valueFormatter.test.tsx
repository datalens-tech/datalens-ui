import React from 'react';

import {cleanup, render} from '@testing-library/react';
import type {DateTableColumn, NumberTableColumn} from 'shared';
import {i18nInstance} from 'shared/modules/format-units/i18n/i18n';

import {MiscQA, valueFormatter} from '../utils/render';

i18nInstance.setLang('en');

afterEach(cleanup);

describe('chartkit/Table/utils/valueFormatter', () => {
    const setup = (args: Parameters<typeof valueFormatter>) => {
        const utils = render(
            <table>
                <tbody>
                    <tr>
                        <td>{valueFormatter(...args)}</td>
                    </tr>
                </tbody>
            </table>,
        );

        return {
            ...utils,
        };
    };

    // The cases are described in the order in which they are in the function

    test('formatted value should be rendered', () => {
        const {getByRole} = setup([
            'text', // or any available type
            {value: 'Raw value', formattedValue: 'Formatted value'},
        ]);
        expect(getByRole('cell')).toHaveTextContent('Formatted value');
    });

    test('markup value', () => {
        const {getByRole} = setup([
            'text',
            {
                value: {
                    type: 'bold',
                    content: {
                        type: 'text',
                        content: 'Markup',
                    },
                },
            },
        ]);
        expect(getByRole('cell')).toHaveTextContent('Markup');
    });

    test('nullable value', () => {
        const {getByRole} = setup(['text', {value: null}]);
        expect(getByRole('cell')).toHaveTextContent('null');
    });

    test('type "text"', () => {
        const {getByRole} = setup(['text', {value: 'Type text'}]);
        expect(getByRole('cell')).toHaveTextContent('Type text');
    });

    test('type "text" with link', () => {
        const {getByRole} = setup([
            'text',
            {value: 'Type text', link: {href: '#', newWindow: false}},
        ]);
        expect(getByRole('link')).toHaveTextContent('Type text');
    });

    test('type "date"', () => {
        const {getByRole} = setup([
            'date',
            {value: 1652994616179},
            {format: 'DD.MM.YYYY'} as DateTableColumn,
        ]);
        expect(getByRole('cell')).toHaveTextContent('19.05.2022');
    });

    test('type "number"', () => {
        const {getByRole} = setup(['number', {value: 2}, {precision: 2} as NumberTableColumn]);
        expect(getByRole('cell')).toHaveTextContent('2,00');
    });

    test('type "diff", positive', () => {
        const {getByRole} = setup(['diff', {value: [2, 1]}]);
        expect(getByRole('cell')).toHaveTextContent('2 ▲1');
    });

    test('type "diff", negative', () => {
        const {getByRole} = setup(['diff', {value: [2, -1]}]);
        expect(getByRole('cell')).toHaveTextContent('2 ▼-1');
    });

    test('type "diff_only", positive', () => {
        const {getByRole} = setup(['diff_only', {value: 2}]);
        expect(getByRole('cell')).toHaveTextContent('▲2');
    });

    test('type "diff_only", negative', () => {
        const {getByRole} = setup(['diff_only', {value: -1}]);
        expect(getByRole('cell')).toHaveTextContent('▼-1');
    });

    test('minus icon should be rendered', () => {
        const {getByTestId} = setup([
            'text',
            {value: 'With treeNodeState:opened', treeNodeState: 'open'},
        ]);
        getByTestId(MiscQA.TREE_NODE_STATE_OPENED);
    });

    test('plus icon should be rendered', () => {
        const {getByTestId} = setup([
            'text',
            {value: 'With treeNodeState:closed', treeNodeState: 'closed'},
        ]);
        getByTestId(MiscQA.TREE_NODE_STATE_CLOSED);
    });
});
