import type {DashData} from 'shared';

import {isOrderChanged, mapItemsByOrderToArray, mapItemsByOrderToObject} from '../helpers';

jest.mock('ui', () => {
    return {
        Utils: {
            isEnabledFeature: () => false,
        },
    };
});

const tabs = [
    {
        id: 'A',
        items: [
            {
                id: 'AA',
                orderId: 10,
            },
            {
                id: 'BB',
                orderId: 14,
            },
            {
                id: 'CC',
                orderId: 23,
            },
        ],
    },
    {
        id: 'B',
        items: [
            {
                id: 'DD',
                orderId: 40,
            },
            {
                id: 'EE',
                orderId: 41,
            },
            {
                id: 'FF',
                orderId: 32,
            },
        ],
    },
    {
        id: 'C',
        items: [
            {
                id: 'GG',
                orderId: 0,
            },
            {
                id: 'AA',
                orderId: 2,
            },
            {
                id: 'II',
                orderId: 1,
            },
        ],
    },
];

const resultObj = {
    'A-AA': 10,
    'A-BB': 14,
    'A-CC': 23,
    'B-DD': 40,
    'B-EE': 41,
    'B-FF': 32,
    'C-GG': 0,
    'C-AA': 2,
    'C-II': 1,
};

const resultObjEqual = {
    'A-AA': 10,
    'A-BB': 14,
    'A-CC': 23,
    'B-DD': 40,
    'B-EE': 41,
    'B-FF': 32,
};

const resultObjChanged = {
    'A-AA': 40,
    'A-BB': 14,
    'A-CC': 23,
    'B-DD': 40,
    'B-EE': 41,
    'B-FF': 32,
    'C-GG': 0,
    'C-AA': 2,
    'C-II': 1,
};

const resultArr = [
    {
        id: 'AA',
        orderId: 10,
        tabId: 'A',
    },
    {
        id: 'BB',
        orderId: 14,
        tabId: 'A',
    },
    {
        id: 'CC',
        orderId: 23,
        tabId: 'A',
    },
    {
        id: 'DD',
        orderId: 40,
        tabId: 'B',
    },
    {
        id: 'EE',
        orderId: 41,
        tabId: 'B',
    },
    {
        id: 'FF',
        orderId: 32,
        tabId: 'B',
    },
    {
        id: 'GG',
        orderId: 0,
        tabId: 'C',
    },
    {
        id: 'AA',
        orderId: 2,
        tabId: 'C',
    },
    {
        id: 'II',
        orderId: 1,
        tabId: 'C',
    },
];

describe('Dash/PopupWidgetsOrder', () => {
    test('Check of the data mapping to object', () => {
        expect(mapItemsByOrderToObject(tabs as DashData['tabs'])).toEqual(resultObj);
    });

    test('Check of the data mapping to flat array', () => {
        expect(mapItemsByOrderToArray(tabs as DashData['tabs'])).toEqual(resultArr);
    });

    test('Checking the status of the changed orderId', () => {
        expect(isOrderChanged(resultArr, resultObj)).toEqual(false);
        expect(isOrderChanged(resultArr, resultObjEqual)).toEqual(false);
        expect(isOrderChanged(resultArr, resultObjChanged)).toEqual(true);
    });
});
