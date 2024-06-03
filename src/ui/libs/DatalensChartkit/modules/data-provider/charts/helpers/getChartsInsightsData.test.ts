import type {ChartsInsightsItem} from '../../../../../../../shared';

import {
    filterItemsByLocators,
    filterLocatorsByDate,
    getChartsInsightsData,
    getCorrectItems,
} from './getChartsInsightsData';

describe('getChartsInsightsData', () => {
    beforeEach(() => {
        // 16.12.2021
        jest.spyOn(Date, 'now').mockImplementation(() => 1639642810331);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getCorrectItems', () => {
        it('returns ChartsInsightsItem with correct values of all fields', () => {
            const ChartsInsightsItems = [
                {
                    title: 'title',
                    message: 'message',
                    locator: '1',
                },
                {
                    level: 111,
                    title: 'title',
                    message: 'message',
                    locator: '2',
                },
                {
                    level: 'info',
                    message: 'message',
                    locator: '3',
                },
                {
                    level: 'info',
                    title: 'title',
                    locator: '4',
                },
                {
                    level: 'info',
                    title: 'title',
                    message: 'message',
                },
                {
                    level: 'info',
                    title: '',
                    message: 'message',
                    locator: '5',
                },
                {
                    level: 'info',
                    title: 'title',
                    message: '',
                    locator: '6',
                },
                {
                    level: 'info',
                    title: 'title',
                    message: 'message',
                    locator: '',
                },
                {
                    level: 'info',
                    title: 'title',
                    message: 'message',
                    locator: '7',
                },
                {
                    level: 'warning',
                    title: 'title',
                    message: 'message',
                    locator: '8',
                },
                {
                    level: 'critical',
                    title: 'title',
                    message: 'message',
                    locator: '9',
                },
            ];

            // @ts-ignore
            const result = getCorrectItems(ChartsInsightsItems);
            expect(result).toEqual([
                {
                    level: 'info',
                    title: 'title',
                    message: 'message',
                    locator: '7',
                },
                {
                    level: 'warning',
                    title: 'title',
                    message: 'message',
                    locator: '8',
                },
                {
                    level: 'critical',
                    title: 'title',
                    message: 'message',
                    locator: '9',
                },
            ]);
        });
    });

    describe('filterItemsByLocators', () => {
        it('returns ChartsInsightsItem for which no locator', () => {
            const ChartsInsightsItems: ChartsInsightsItem[] = [
                {
                    level: 'info',
                    title: 'title',
                    message: 'message',
                    locator: '7',
                },
            ];

            const result = filterItemsByLocators(ChartsInsightsItems, {'111': '10.12.2021'});
            expect(result).toEqual([
                {
                    level: 'info',
                    title: 'title',
                    message: 'message',
                    locator: '7',
                },
            ]);
        });

        it('returns an empty array', () => {
            const ChartsInsightsItems: ChartsInsightsItem[] = [
                {
                    level: 'info',
                    title: 'title',
                    message: 'message',
                    locator: '7',
                },
            ];

            const result = filterItemsByLocators(ChartsInsightsItems, {'7': '10.12.2021'});
            expect(result).toEqual([]);
        });

        it('returns ChartsInsightsItem for which locators are older than 14 days', () => {
            // today 16.12.2021
            const ChartsInsightsItems: ChartsInsightsItem[] = [
                {
                    level: 'info',
                    title: 'title',
                    message: 'message',
                    locator: '7',
                },
            ];

            const result = filterItemsByLocators(ChartsInsightsItems, {'7': '02.12.2021'});
            expect(result).toEqual([
                {
                    level: 'info',
                    title: 'title',
                    message: 'message',
                    locator: '7',
                },
            ]);
        });
    });

    describe('filterLocatorsByDate', () => {
        it('returns an empty object since the date of all locators is older than 14 days', () => {
            // today 16.12.2021
            const locators = {
                a: '16.10.2021',
                b: '10.11.2021',
                c: '02.12.2021',
            };

            const result = filterLocatorsByDate(locators);
            expect(result).toEqual({});
        });
    });

    describe('filterLocatorsByDate', () => {
        it('return locators whose dates are less than 14 days', () => {
            // today 16.12.2021
            const locators = {
                a: '16.10.2021',
                b: '10.11.2021',
                c: '02.12.2021',
                d: '03.12.2021',
                e: '16.12.2021',
            };

            const result = filterLocatorsByDate(locators);
            expect(result).toEqual({
                d: '03.12.2021',
                e: '16.12.2021',
            });
        });
    });

    describe('getChartsInsightsData', () => {
        it('return ChartsInsightsData', () => {
            const ChartsInsightsItems: ChartsInsightsItem[] = [
                {
                    level: 'info',
                    title: 'title',
                    message: 'message 1',
                    locator: '1',
                },
                {
                    level: 'info',
                    title: 'title',
                    message: 'message 2',
                    locator: '2',
                },
                {
                    level: 'info',
                    title: 'title',
                    message: 'message 3',
                    locator: '3',
                },
                {
                    level: 'info',
                    title: 'title',
                    message: 'message 4',
                    locator: '4',
                },
                {
                    level: 'info',
                    title: 'title',
                    message: 'message 5',
                    locator: '5',
                },
            ];

            const locators = {
                '1': '01.12.2021',
                '2': '01.12.2021',
                '3': '01.12.2021',
                '4': '10.12.2021',
                '5': '16.12.2021',
            };

            const result = getChartsInsightsData(ChartsInsightsItems, locators);
            expect(result).toEqual({
                items: [
                    {
                        level: 'info',
                        title: 'title',
                        message: 'message 1',
                        locator: '1',
                    },
                    {
                        level: 'info',
                        title: 'title',
                        message: 'message 2',
                        locator: '2',
                    },
                    {
                        level: 'info',
                        title: 'title',
                        message: 'message 3',
                        locator: '3',
                    },
                ],
                messagesByLocator: {
                    1: 'message 1',
                    2: 'message 2',
                    3: 'message 3',
                },
                locators: {
                    '4': '10.12.2021',
                    '5': '16.12.2021',
                },
            });
        });
    });
});
