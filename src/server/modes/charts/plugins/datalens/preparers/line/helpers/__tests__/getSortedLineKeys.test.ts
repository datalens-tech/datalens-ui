import type {LinesRecord} from '../../types';
import {sortLineKeysByFirstValues} from '../getSortedLineKeys';

describe('sortLineKeysByFirstValues', () => {
    const initialLines = [
        {
            Technology: {
                data: {
                    0: {value: 120},
                    1: {value: -150},
                    2: {value: 230},
                },
            },
            'Office Supplies': {
                data: {
                    0: {value: 320},
                    1: {value: 500},
                    2: {value: 120},
                },
            },
            Furniture: {
                data: {
                    0: {value: -120},
                    1: {value: 12150},
                    2: {value: 4},
                },
            },
        },
    ] as unknown as LinesRecord[];
    const categories = [0, 1, 2];

    let lineKeys: string[][];

    beforeEach(() => {
        lineKeys = initialLines.map((line) => Object.keys(line));
    });

    it('Should sort line keys by first value in each series in ASC order', () => {
        lineKeys.forEach((lk, index) => {
            sortLineKeysByFirstValues(lk, index, {
                lines: initialLines,
                categories,
                sortItemDirection: 'ASC',
            });
        });

        expect(lineKeys).toEqual([['Furniture', 'Technology', 'Office Supplies']]);
    });

    it('Should sort line keys by first value in each series in DESC order', () => {
        lineKeys.forEach((lk, index) => {
            sortLineKeysByFirstValues(lk, index, {
                lines: initialLines,
                categories,
                sortItemDirection: 'DESC',
            });
        });

        expect(lineKeys).toEqual([['Office Supplies', 'Technology', 'Furniture']]);
    });
});
