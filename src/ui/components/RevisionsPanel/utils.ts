import {EntryScope} from '../../../shared';

const getCurrentPageFirstPathPart = () =>
    window.location.pathname.split('/').filter((item) => item.trim())[0];

const isChartsPage = (part: string) => part !== 'editor';

/**
 * Which sections should be allowed to show a new panel with versions
 */
export function getEntryScopesWithRevisionsList(): EntryScope[] {
    const res = [EntryScope.Dash];
    const currentPathPart = getCurrentPageFirstPathPart();

    // temporary restriction of the new versioning for the editor until we switch to it,
    const showMenuInCharts = isChartsPage(currentPathPart);
    if (showMenuInCharts) {
        res.push(EntryScope.Widget);
    }

    return res;
}

/**
 * Which sections should be allowed to show the draft warning panel
 * it differs from the general scope, because there is no separate switch to editing mode in the charts
 */
export function getDraftWarningAvailableScopes() {
    const res = [];
    const currentPathPart = getCurrentPageFirstPathPart();

    // temporary restriction of the new versioning for the editor until we switch to it
    const showMenuInCharts = isChartsPage(currentPathPart);

    if (showMenuInCharts) {
        res.push(EntryScope.Widget);
    }

    return res;
}
