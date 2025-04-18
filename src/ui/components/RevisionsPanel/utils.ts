import {URL_QUERY} from 'ui/constants';
import {getUrlParamFromStr} from 'ui/utils';

import {EntryScope} from '../../../shared';

/**
 * Which sections should be allowed to show a new panel with versions
 */
export function getEntryScopesWithRevisionsList(): EntryScope[] {
    return [EntryScope.Dash, EntryScope.Widget];
}

/**
 * Which sections should be allowed to show the draft warning panel
 * it differs from the general scope, because there is no separate switch to editing mode in the charts
 */
export function getDraftWarningAvailableScopes() {
    return [EntryScope.Widget];
}

/**
 * TODO
 */
export function isUnreleasedQueryParam(search: string) {
    return (
        getUrlParamFromStr(search, URL_QUERY.UNRELEASED) === '1' &&
        !getUrlParamFromStr(search, URL_QUERY.REV_ID)
    );
}
