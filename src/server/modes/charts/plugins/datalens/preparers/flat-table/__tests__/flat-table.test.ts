import prepareFlatTable from '../index';

const {
    flatTableFormattingIntPrecisionArgs,
    flatTableFormattingFloatPrecisionArgs,
    flatTablePrepareWithTotalsArgs,
} = require('./mocks/flat-table.mock');

describe('prepareFlatTable', () => {
    describe('common', () => {
        test('should not use precision for integer cell', () => {
            const result = prepareFlatTable(flatTableFormattingIntPrecisionArgs) as any;
            const precision = result.head[0]?.formatter?.precision;
            expect(precision).toEqual(undefined);
        });

        test('should use provided precision for float cell', () => {
            const result = prepareFlatTable(flatTableFormattingFloatPrecisionArgs) as any;
            const precision = result.head[0]?.formatter?.precision;
            expect(precision).toEqual(1);
        });

        test('should ignore totals when empty string', () => {
            const result = prepareFlatTable(flatTablePrepareWithTotalsArgs);
            const totals = result.footer;

            const expectedTotals = [
                {
                    cells: [
                        {
                            value: 'Total',
                            css: {
                                'background-color': 'var(--g-color-base-generic)',
                                'font-weight': 500,
                            },
                            type: 'text',
                        },
                        {
                            value: '',
                            css: {
                                'background-color': 'var(--g-color-base-generic)',
                                'font-weight': 500,
                            },
                        },
                        {
                            value: '',
                            css: {
                                'background-color': 'var(--g-color-base-generic)',
                                'font-weight': 500,
                            },
                        },
                        {
                            value: 4500,
                            css: {
                                'background-color': 'var(--g-color-base-generic)',
                                'font-weight': 500,
                            },
                        },
                        {
                            value: 4017.8571428571427,
                            css: {
                                'background-color': 'var(--g-color-base-generic)',
                                'font-weight': 500,
                            },
                        },
                        {
                            value: '',
                            css: {
                                'background-color': 'var(--g-color-base-generic)',
                                'font-weight': 500,
                            },
                        },
                        {
                            value: '',
                            css: {
                                'background-color': 'var(--g-color-base-generic)',
                                'font-weight': 500,
                            },
                        },
                    ],
                },
            ];

            expect(totals).toEqual(expectedTotals);
        });
    });
});
