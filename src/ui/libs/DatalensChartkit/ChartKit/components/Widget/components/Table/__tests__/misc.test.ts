import type {SortedDataItem} from '@gravity-ui/react-data-table';
import type {DataTableData} from 'ui/libs/DatalensChartkit/types';

import {getCellWidth, getTreeSetColumnSortAscending, prepareLinkHref} from '../utils/misc';

describe('chartkit/Table/utils/misc', () => {
    test.each<
        [
            number | string,
            number | undefined,
            number | undefined,
        ] /* [userWidth, tableWidth, expected] */
    >([
        [0, undefined, 0],
        [10, undefined, 10],
        [-10, undefined, undefined],
        ['10%', 150, 15],
        ['10%', undefined, undefined],
        ['-10%', 150, undefined],
        ['10', 150, undefined],
        ['101%', 150, undefined],
        ['150px', 150, 150],
        ['150px', undefined, 150],
        ['-150px', undefined, undefined],
    ])(
        'getCellWidth (args: {userWidth: %p, tableWidth: %p})',
        (userWidth, tableWidth, expected) => {
            const result = getCellWidth(userWidth, tableWidth);
            expect(result).toEqual(expected);
        },
    );

    test.each<[string, string] /* [href, expected] */>([
        [
            'https://some.example.site.com/issues/?_q=Queue: Alice and Resolved: >= "2022-08-01 00:00:00"',
            'https://some.example.site.com/issues/?_q=Queue%3A+Alice+and+Resolved%3A+%3E%3D+%222022-08-01+00%3A00%3A00%22',
        ],
        [
            'https://example.com/search/?text=stackoverflow ?%= js&lr=10',
            'https://example.com/search/?text=stackoverflow+%3F%25%3D+js&lr=10',
        ],
        ['https://example.com', 'https://example.com/'],
        ['#', '#'],
        ['https://example.com/hey?foo=bar#anchor', 'https://example.com/hey?foo=bar#anchor'],
        [
            'https://example.com/hey?foo=bar?%/=#anchor?%=/',
            'https://example.com/hey?foo=bar%3F%25%2F%3D#anchor?%=/',
        ],
    ])('handle Link href (%p)', (href, expected) => {
        const result = prepareLinkHref(href);
        expect(result).toEqual(expected);
    });

    describe('getTreeSetColumnSortAscending', () => {
        const product1 = {
            Products: {
                fieldId: 'Products',
                value: 'Washing products',
                treeNode: JSON.stringify(['Washing products']),
            },
            Sales: {fieldId: 'Sales', value: 4197813},
        };
        const subProduct1 = {
            Products: {
                fieldId: 'Products',
                value: 'BioHome',
                treeNode: JSON.stringify(['Washing products', 'BioHome']),
            },
            Sales: {fieldId: 'Sales', value: 277977},
        };
        const subProduct2 = {
            Products: {
                fieldId: 'Products',
                value: 'Best washer',
                treeNode: JSON.stringify(['Washing products', 'Best washer']),
            },
            Sales: {fieldId: 'Sales', value: 696117},
        };
        const subProduct3 = {
            Products: {
                fieldId: 'Products',
                value: 'Clean home',
                treeNode: JSON.stringify(['Washing products', 'Clean home']),
            },
            Sales: {fieldId: 'Sales', value: 3223719},
        };
        const product2 = {
            Products: {
                fieldId: 'Products',
                value: 'Cleaning products',
                treeNode: JSON.stringify(['Cleaning products']),
            },
            Sales: {fieldId: 'Sales', value: 3349940},
        };

        function sortData(
            data: SortedDataItem<DataTableData>[],
            columnName: string,
            order: 'asc' | 'desc' = 'asc',
        ) {
            const rows = data.map((item) => ({cells: Object.values(item.row)}));
            const sortFn = getTreeSetColumnSortAscending(columnName, rows);
            data.sort((row1, row2) => {
                return (order === 'desc' ? -1 : 1) * sortFn(row1, row2) || row1.index - row2.index;
            });
        }

        test('sort by treeSet column', () => {
            const data: SortedDataItem<DataTableData>[] = [
                {row: product2, index: 0},
                {row: product1, index: 1},
                {row: subProduct2, index: 2},
                {row: subProduct1, index: 3},
            ];

            sortData(data, 'Products');

            const expected: SortedDataItem<DataTableData>[] = [
                {row: product2, index: 0},
                {row: product1, index: 1},
                {row: subProduct2, index: 2},
                {row: subProduct1, index: 3},
            ];
            expect(data).toEqual(expected);
        });

        test('sort by number column with treeSet in row', () => {
            const data: SortedDataItem<DataTableData>[] = [
                {row: product2, index: 0},
                {row: product1, index: 1},
                {row: subProduct1, index: 2},
                {row: subProduct2, index: 3},
                {row: subProduct3, index: 4},
            ];

            sortData(data, 'Sales', 'desc');

            const expected: SortedDataItem<DataTableData>[] = [
                {row: product1, index: 1},
                {row: subProduct3, index: 4},
                {row: subProduct2, index: 3},
                {row: subProduct1, index: 2},
                {row: product2, index: 0},
            ];
            expect(data).toEqual(expected);
        });
    });
});
