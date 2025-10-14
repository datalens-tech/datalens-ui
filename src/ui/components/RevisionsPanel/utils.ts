import {EntryScope, Feature} from '../../../shared';
import {isEnabledFeature} from '../../utils/isEnabledFeature';

/**
 * Which sections should be allowed to show a new panel with versions
 */
export function getEntryScopesWithRevisionsList(): EntryScope[] {
    const arr = [EntryScope.Dash, EntryScope.Widget, EntryScope.Dataset];
    if (isEnabledFeature(Feature.EnableConnectionRevisions)) {
        arr.push(EntryScope.Connection);
    }
    return arr;
}

/**
 * Which sections should be allowed to show the draft warning panel
 * it differs from the general scope, because there is no separate switch to editing mode in the charts
 */
export function getDraftWarningAvailableScopes() {
    return [EntryScope.Widget];
}
