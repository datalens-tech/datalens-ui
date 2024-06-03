import {has, isEmpty, pickBy} from 'lodash';
import moment from 'moment';

import type {ChartsInsightsItem} from '../../../../../../../shared';
import type {ChartsInsightsData, ChartsInsightsLocators} from '../../../../types/widget';

const MAX_DAYS_TO_HIDDEN = 14;

/**
 * Returns ChartsInsightsItem with correct values of all fields
 */

export const getCorrectItems = (items: ChartsInsightsItem[]) => {
    return items.filter((insight) => {
        const hasCorrectLevel = ['info', 'warning', 'critical'].includes(insight.level);
        const hasLocator = Boolean(insight.locator);
        const hasContent = Boolean(insight.title) && Boolean(insight.message);

        return hasCorrectLevel && hasLocator && hasContent;
    });
};

/**
 * Return such items for which there is no locator or the locator date is older than 14 days
 */

export const filterItemsByLocators = (
    items: ChartsInsightsItem[],
    locators: ChartsInsightsLocators,
): ChartsInsightsItem[] => {
    const today = moment().format('DD.MM.YYYY');

    return items.filter((item) => {
        if (!has(locators, item.locator)) {
            return true;
        }

        const date = locators[item.locator];
        const startDate = moment(date, 'DD.MM.YYYY');
        const endDate = moment(today, 'DD.MM.YYYY');
        const diff = endDate.diff(startDate, 'days');

        return diff >= MAX_DAYS_TO_HIDDEN;
    });
};

/**
 * Return locators whose date is less than 14 days, because they need to be save when recording new ones
 */

export const filterLocatorsByDate = (locators: Record<string, string>) => {
    const today = moment().format('DD.MM.YYYY');

    return pickBy(locators, (date) => {
        const startDate = moment(date, 'DD.MM.YYYY');
        const endDate = moment(today, 'DD.MM.YYYY');
        const diff = endDate.diff(startDate, 'days');

        return diff < MAX_DAYS_TO_HIDDEN;
    });
};

const getMessagesByLocator = (items: ChartsInsightsItem[]) => {
    return items.reduce((acc: Record<string, string>, {locator, message}) => {
        acc[locator] = message;
        return acc;
    }, {});
};

export const getChartsInsightsData = (
    items: ChartsInsightsItem[],
    locators: Record<string, string>,
): ChartsInsightsData | undefined => {
    if (isEmpty(items)) {
        return undefined;
    }

    const correctItems = getCorrectItems(items);

    if (isEmpty(correctItems)) {
        return undefined;
    }

    if (isEmpty(locators)) {
        return {
            items: correctItems,
            messagesByLocator: getMessagesByLocator(correctItems),
            locators: {},
        };
    }

    const itemsFilteredByLocators = filterItemsByLocators(correctItems, locators);

    const locatorsFilteredByDate = filterLocatorsByDate(locators);

    return {
        items: itemsFilteredByLocators,
        messagesByLocator: getMessagesByLocator(itemsFilteredByLocators),
        locators: locatorsFilteredByDate,
    };
};
