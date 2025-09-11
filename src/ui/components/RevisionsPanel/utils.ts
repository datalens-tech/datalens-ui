import DatasetUtils from 'ui/units/datasets/helpers/utils';

import {EntryScope, Feature} from '../../../shared';

/**
 * Which sections should be allowed to show a new panel with versions
 */
export function getEntryScopesWithRevisionsList(): EntryScope[] {
    const arr = [EntryScope.Dash, EntryScope.Widget, EntryScope.Connection];
    if (DatasetUtils.isEnabledFeature(Feature.EnableDatasetRevisions)) {
        arr.push(EntryScope.Dataset);
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
