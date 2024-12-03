import type {Config} from '@gravity-ui/dashkit';

import {RELATION_TYPES} from '../constants';
import {addAlias, getNormalizedAliases, getUpdatedRelations} from '../helpers';
import type {RelationType} from '../types';

jest.mock('ui', () => {
    return {
        Utils: {
            isEnabledFeature: () => false,
        },
    };
});

const connections = {
    empty: [],
    onlyInput: [{from: 'b', kind: 'ignore', to: 'w'}] as Config['connections'],
};

const changed = {
    input: {
        w: {
            a: RELATION_TYPES.input as RelationType,
        },
    },
    multi: {
        w: {
            a: RELATION_TYPES.input as RelationType,
            b: RELATION_TYPES.output as RelationType,
        },
    },
    ignores: {
        w: {
            b: RELATION_TYPES.ignore as RelationType,
        },
    },
};

const resultObj = {
    emptyInput: [{from: 'a', kind: 'ignore', to: 'w'}],
    otherInput: [
        {from: 'b', kind: 'ignore', to: 'w'},
        {from: 'a', kind: 'ignore', to: 'w'},
    ],
    multi: [
        {from: 'a', kind: 'ignore', to: 'w'},
        {from: 'w', kind: 'ignore', to: 'b'},
    ],
    emptyIgnore: [
        {from: 'w', kind: 'ignore', to: 'b'},
        {from: 'b', kind: 'ignore', to: 'w'},
    ],
    inputIgnore: [
        {from: 'w', kind: 'ignore', to: 'b'},
        {from: 'b', kind: 'ignore', to: 'w'},
    ],
};

describe('Dash/DialogRelations', () => {
    test(`Check the update of relations after changing: connections=${JSON.stringify(
        connections.empty,
    )}; changed: ${JSON.stringify(changed.input)}`, () => {
        expect(getUpdatedRelations(connections.empty, changed.input)).toEqual(resultObj.emptyInput);
    });

    test(`Check the update of relations after changing: connections=${JSON.stringify(
        connections.onlyInput,
    )}; changed: ${JSON.stringify(changed.input)}`, () => {
        expect(getUpdatedRelations(connections.onlyInput, changed.input)).toEqual(
            resultObj.otherInput,
        );
    });
    test(`Check the update of relations after changing: connections=${JSON.stringify(
        connections.onlyInput,
    )}; changed: ${JSON.stringify(changed.input)}`, () => {
        expect(getUpdatedRelations(connections.onlyInput, changed.multi)).toEqual(resultObj.multi);
    });

    test(`Check the update of relations after changing: connections=${JSON.stringify(
        connections.empty,
    )}; changed: ${JSON.stringify(changed.ignores)}`, () => {
        expect(getUpdatedRelations(connections.empty, changed.ignores)).toEqual(
            resultObj.emptyIgnore,
        );
    });

    test(`Check the update of relations after changing: connections=${JSON.stringify(
        connections.onlyInput,
    )}; changed: ${JSON.stringify(changed.ignores)}`, () => {
        expect(getUpdatedRelations(connections.onlyInput, changed.ignores)).toEqual(
            resultObj.inputIgnore,
        );
    });
});

const testDataNormalize = {
    deep: {
        current: [
            ['AA', 'BB', 'CC', 'DD'],
            ['EE', 'FF', 'GG'],
            ['HH', 'II', 'JJ'],
            ['AA', 'II', 'KK', 'LL'],
            ['MM', 'NN', 'OO', 'PP', 'QQ'],
            ['RR', 'SS'],
            ['TT', 'CC'],
        ],
        result: [
            ['AA', 'BB', 'CC', 'DD', 'HH', 'II', 'JJ', 'KK', 'LL', 'TT'],
            ['EE', 'FF', 'GG'],
            ['MM', 'NN', 'OO', 'PP', 'QQ'],
            ['RR', 'SS'],
        ],
    },
    asIs: {
        current: [
            ['HH', 'II', 'JJ', 'KK', 'LL', 'MM'],
            ['AA', 'BB', 'CC', 'DD'],
        ],
        result: [
            ['HH', 'II', 'JJ', 'KK', 'LL', 'MM'],
            ['AA', 'BB', 'CC', 'DD'],
        ],
    },
    empty: {current: [], result: []},
    emptyOne: {current: [[]], result: []},
    emptyTwo: {current: [[], []], result: []},
    twoByTwo: {
        current: [
            ['AA', 'BB'],
            ['BB', 'CC'],
            ['CC', 'DD'],
            ['DD', 'EE'],
            ['EE', 'FF'],
            ['KK', 'LL'],
        ],
        result: [
            ['AA', 'BB', 'CC', 'DD', 'EE', 'FF'],
            ['KK', 'LL'],
        ],
    },
    reOrder: {
        current: [
            ['AA', 'CC'],
            ['FF', 'EE'],
            ['HH', 'II'],
            ['AA', 'II'],
            ['TT', 'CC'],
            ['GG', 'EE'],
        ],
        result: [
            ['AA', 'CC', 'HH', 'II', 'TT'],
            ['EE', 'FF', 'GG'],
        ],
    },
    allInOne: {
        current: [
            ['AA', 'BB'],
            ['CC', 'BB'],
            ['BB', 'CC'],
        ],
        result: [['AA', 'BB', 'CC']],
    },
};

const testDataAddNewNormalize = {
    empty: {
        current: [],
        new: ['CC', 'FF'],
        result: [['CC', 'FF']],
    },
    notExist: {
        current: [
            ['AA', 'BB', 'CC', 'DD'],
            ['EE', 'FF', 'GG'],
        ],
        new: ['HH', 'MM'],
        result: [
            ['AA', 'BB', 'CC', 'DD'],
            ['EE', 'FF', 'GG'],
            ['HH', 'MM'],
        ],
    },
    singleExist: {
        current: [
            ['AA', 'BB', 'CC', 'DD'],
            ['EE', 'FF', 'GG'],
        ],
        new: ['CC', 'KK'],
        result: [
            ['AA', 'BB', 'CC', 'DD', 'KK'],
            ['EE', 'FF', 'GG'],
        ],
    },
    doubleExist: {
        current: [
            ['AA', 'BB', 'CC', 'DD'],
            ['EE', 'FF', 'GG'],
            ['VV', 'XX', 'ZZ'],
        ],
        new: ['CC', 'GG'],
        result: [
            ['AA', 'BB', 'CC', 'DD', 'EE', 'FF', 'GG'],
            ['VV', 'XX', 'ZZ'],
        ],
    },
};

const testDataAddNewNotNormalize = {
    notExist: {
        current: [
            ['AA', 'BB', 'CC', 'DD'],
            ['EE', 'FF', 'GG'],
            ['DD', 'KK', 'OO'],
            ['FF', 'LL', 'GG'],
        ],
        new: ['XX', 'ZZ'],
        result: [
            // keep all not normalize
            ['AA', 'BB', 'CC', 'DD'],
            ['EE', 'FF', 'GG'],
            ['DD', 'KK', 'OO'],
            ['FF', 'GG', 'LL'],
            // and one new
            ['XX', 'ZZ'],
        ],
    },
    exist: {
        current: [
            ['AA', 'BB', 'CC', 'DD'],
            ['EE', 'FF', 'GG'],
            ['DD', 'KK', 'OO'],
            ['FF', 'LL', 'MM'],
        ],
        new: ['GG', 'DD'],
        result: [
            ['AA', 'BB', 'CC', 'DD', 'EE', 'FF', 'GG', 'KK', 'OO'],
            ['FF', 'LL', 'MM'], // keep not normalize
        ],
    },
};

const equalArrayContains = (actual: Array<Array<string>>, expected: Array<Array<string>>) => {
    return expect([...actual.map((row) => [...row].sort())]).toEqual(expected);
};

describe('Dash/DialogRelations', () => {
    test('Check the addition of a new alias into normalized array', () => {
        for (const testData of Object.values(testDataAddNewNormalize)) {
            equalArrayContains(
                addAlias(testData.new[0], testData.new[1], testData.current),
                testData.result,
            );
        }
    });

    test('Check the addition of a new alias into not normalized array', () => {
        for (const testData of Object.values(testDataAddNewNotNormalize)) {
            equalArrayContains(
                addAlias(testData.new[0], testData.new[1], testData.current),
                testData.result,
            );
        }
    });

    test('Check normalizing of relations aliases', () => {
        for (const testData of Object.values(testDataNormalize)) {
            equalArrayContains(getNormalizedAliases(testData.current), testData.result);
        }
    });
});
