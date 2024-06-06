import {I18n} from 'i18n';
const trans = I18n.keyset('components.common.YCSelect');

const MULTIPLE_MIN_WIDTH = 150;
const WITH_SEARCH_MIN_WIDTH = 170;
const WITH_SEARCH_MULTIPLE_MIN_WIDTH = 200;

export function checkBrowser() {
    const agent = navigator.userAgent;

    if (
        agent.indexOf('Firefox') !== -1 &&
        parseFloat(agent.substring(agent.indexOf('Firefox') + 8)) >= 3.6
    ) {
        return 'Firefox';
    } else if (
        agent.indexOf('Safari') !== -1 &&
        agent.indexOf('Version') !== -1 &&
        parseFloat(agent.substring(agent.indexOf('Version') + 8).split(' ')[0]) >= 5
    ) {
        return 'Safari';
    }

    return 'Good Browser';
}

export function getEscapedRegExp(string) {
    return new RegExp(string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
}

export function getTitleValue(title) {
    if (title === null) {
        return trans('null');
    }

    if (title === '') {
        return trans('empty_string');
    }

    return title;
}

export function isFalsy(value) {
    return !value && value !== 0;
}

/**
 *
 * @param {object} options
 * @param {boolean} options.withSearch
 * @param {boolean} options.multiple
 *
 * @return {number | undefined}
 */
export function getPossiblePopupMinWidth({withSearch, multiple}) {
    let possibleMinWidth;

    if (withSearch && multiple) {
        possibleMinWidth = WITH_SEARCH_MULTIPLE_MIN_WIDTH;
    } else if (withSearch) {
        possibleMinWidth = WITH_SEARCH_MIN_WIDTH;
    } else if (multiple) {
        possibleMinWidth = MULTIPLE_MIN_WIDTH;
    }

    return possibleMinWidth;
}
