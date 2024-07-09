import {getSafeChartWarnings} from '../utils';

describe('getSafeChartWarnings', () => {
    describe('function', () => {
        const fn = function () {
            return 'something';
        };
        test('has function at config -> should show warning', () => {
            const actual = getSafeChartWarnings('graph_node', {
                libraryConfig: {
                    title: fn,
                },
            });

            expect(actual).toEqual('has functions at `title`');
        });

        test("has wrapped function at config -> shouldn't show warning", () => {
            const actual = getSafeChartWarnings('graph_node', {
                libraryConfig: {
                    title: {
                        __wrappedFn__: {
                            fn,
                        },
                    },
                },
            });

            expect(actual).toEqual(undefined);
        });
    });

    describe('HTML', () => {
        test("simple Highcharts template string -> shouldn't show warning", () => {
            const actual = getSafeChartWarnings('graph_node', {
                libraryConfig: {
                    title: '{value} gr',
                },
            });

            expect(actual).toEqual(undefined);
        });

        test("plain string with '>' or '<' -> shouldn't show warning", () => {
            const actual = getSafeChartWarnings('graph_node', {
                libraryConfig: {
                    title: '1 > 2',
                },
                config: {
                    a: '1 < 2',
                },
            });

            expect(actual).toEqual(undefined);
        });

        test('unescaped html string -> should show warning', () => {
            const actual = getSafeChartWarnings('graph_node', {
                libraryConfig: {
                    title: '<br />',
                },
            });

            expect(actual).toEqual('has HTML string at `title`');
        });
    });
});
