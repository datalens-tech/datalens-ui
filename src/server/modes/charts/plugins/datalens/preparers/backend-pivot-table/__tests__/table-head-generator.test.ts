import {mapColumnsToHeadCellData} from '../table-head-generator';
import type {PivotDataColumn} from '../types';

jest.mock('../../../../../../../registry', () => ({
    registry: {
        getApp() {
            return {};
        },
    },
}));

const input1: PivotDataColumn[] = [
    [[['Furniture', 90, 90]]],
    [[['Office Supplies', 90, 90]]],
    [[['Technology', 90, 90]]],
];

const expectedOutput1 = [
    {
        item: [['Furniture', 90, 90]],
        parents: {},
    },
    {
        item: [['Office Supplies', 90, 90]],
        parents: {},
    },
    {
        item: [['Technology', 90, 90]],
        parents: {},
    },
];

const input2: PivotDataColumn[] = [
    [[['Furniture', 24, 24]], [['Bookcases', 25, 25]]],
    [[['Furniture', 24, 24]], [['Chairs', 25, 25]]],
    [[['Office Supplies', 24, 24]], [['Envelopes', 25, 25]]],
    [[['Office Supplies', 24, 24]], [['Paper', 25, 25]]],
    [[['Technology', 24, 24]], [['Machines', 25, 25]]],
    [[['Technology', 24, 24]], [['Phones', 25, 25]]],
];

const expectedOutput2 = [
    {
        item: [['Furniture', 24, 24]],
        sub: [
            {
                item: [['Bookcases', 25, 25]],
                parents: {Furniture: true},
            },
            {
                item: [['Chairs', 25, 25]],
                parents: {Furniture: true},
            },
        ],
        parents: {},
    },
    {
        item: [['Office Supplies', 24, 24]],
        parents: {},
        sub: [
            {
                item: [['Envelopes', 25, 25]],
                parents: {'Office Supplies': true},
            },
            {
                item: [['Paper', 25, 25]],
                parents: {'Office Supplies': true},
            },
        ],
    },
    {
        item: [['Technology', 24, 24]],
        parents: {},
        sub: [
            {
                item: [['Machines', 25, 25]],
                parents: {Technology: true},
            },
            {
                item: [['Phones', 25, 25]],
                parents: {Technology: true},
            },
        ],
    },
];

const input3: PivotDataColumn[] = [
    [[['10', 0, 0]]],
    [[['1', 0, 0]]],
    [[['6', 0, 0]]],
    [[['3', 0, 0]]],
];

const expectedOutput3 = [
    {
        item: [['10', 0, 0]],
        parents: {},
    },
    {
        item: [['1', 0, 0]],
        parents: {},
    },
    {
        item: [['6', 0, 0]],
        parents: {},
    },
    {
        item: [['3', 0, 0]],
        parents: {},
    },
];

const input4: PivotDataColumn[] = [
    [[['Furniture', 24, 24]], [['Bookcases', 25, 25]]],
    [[['Office Supplies', 24, 24]], [['Envelopes', 25, 25]]],
    [[['Furniture', 24, 24]], [['Chairs', 25, 25]]],
    [[['Furniture', 24, 24]], [['Tables', 25, 25]]],
    [[['Technology', 24, 24]], [['Machines', 25, 25]]],
    [[['Technology', 24, 24]], [['Phones', 25, 25]]],
];

const expectedOutput4 = [
    {
        item: [['Furniture', 24, 24]],
        sub: [
            {
                item: [['Bookcases', 25, 25]],
                parents: {Furniture: true},
            },
        ],
        parents: {},
    },
    {
        item: [['Office Supplies', 24, 24]],
        parents: {},
        sub: [
            {
                item: [['Envelopes', 25, 25]],
                parents: {'Office Supplies': true},
            },
        ],
    },
    {
        item: [['Furniture', 24, 24]],
        parents: {},
        sub: [
            {
                item: [['Chairs', 25, 25]],
                parents: {Furniture: true},
            },
            {
                item: [['Tables', 25, 25]],
                parents: {Furniture: true},
            },
        ],
    },
    {
        item: [['Technology', 24, 24]],
        parents: {},
        sub: [
            {
                item: [['Machines', 25, 25]],
                parents: {Technology: true},
            },
            {
                item: [['Phones', 25, 25]],
                parents: {Technology: true},
            },
        ],
    },
];

describe('mapColumnsToHeadCellData function', () => {
    test('should map head cell data to correct flat structure', () => {
        const output = mapColumnsToHeadCellData(input1, {});
        expect(expectedOutput1).toEqual(output);
    });

    test('should map head cell data to correct nested structure', () => {
        const output = mapColumnsToHeadCellData(input2, {});
        expect(expectedOutput2).toEqual(output);
    });

    test('should save order when map columns to head cell data', () => {
        const output = mapColumnsToHeadCellData(input3, {});
        expect(expectedOutput3).toEqual(output);
    });

    test('should only group columns when they follow each other', () => {
        const result = mapColumnsToHeadCellData(input4, {});

        expect(result).toEqual(expectedOutput4);
    });
});
