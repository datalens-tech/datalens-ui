import {EntryScope} from '../../../shared';

/**
 * Which sections should be allowed to show a new panel with versions
 */
export function getEntryScopesWithRevisionsList(): EntryScope[] {
    return [EntryScope.Dash, EntryScope.Widget, EntryScope.Dataset, EntryScope.Connection];
}

/**
 * Which sections should be allowed to show the draft warning panel
 * it differs from the general scope, because there is no separate switch to editing mode in the charts
 */
export function getDraftWarningAvailableScopes() {
    return [EntryScope.Widget];
}
