import isObject from 'lodash/isObject';

import {
    type DashTab,
    type DashTabItem,
    DashTabItemControlSourceType,
    DashTabItemType,
} from '../../../../shared/types';
import type {ResolveConfigError} from '../components/storage/base';

function isEntryInDataCorrect(widget?: DashTabItem, chartId?: string): boolean {
    if (!widget) {
        return false;
    }

    if (widget.type === DashTabItemType.Widget) {
        return Boolean(widget.data.tabs.find((item) => item.chartId === chartId));
    }

    if (
        widget.type === DashTabItemType.Control &&
        widget.data.sourceType === DashTabItemControlSourceType.External
    ) {
        return Boolean(widget.data.source.chartId === chartId);
    }

    return false;
}

// Helper function to find tab containing specific entry ID
export function findTabByWidgetId(
    tabs: DashTab[],
    widgetId: string,
    chartId?: string,
): DashTab | null {
    let isCorrectWidgetId = true;
    const foundTab = tabs.find((tab) =>
        tab.items.some((item: DashTabItem) => item.id === widgetId),
    );

    if (chartId) {
        const widget = foundTab?.items.find((item: DashTabItem) => item.id === widgetId);
        isCorrectWidgetId = isEntryInDataCorrect(widget, chartId);
    }

    return isCorrectWidgetId && foundTab ? foundTab : null;
}

// Helper function to process aliases and update forbidden params set
export function processTabAliases(tabs: DashTab[], forbiddenParamsSet: Set<string>): void {
    tabs.forEach((entryTab) => {
        if (entryTab.aliases) {
            Object.keys(entryTab.aliases).forEach((namespace) => {
                entryTab.aliases[namespace].forEach((alias: string[]) => {
                    const hasPrivateParam = alias.some((item) => forbiddenParamsSet.has(item));

                    if (hasPrivateParam) {
                        // Add all items in alias to forbidden set
                        alias.forEach((item) => forbiddenParamsSet.add(item));
                    }
                });
            });
        }
    });
}

export function getTypedError(error: unknown): ResolveConfigError {
    return isObject(error) && 'message' in error ? (error as Error) : new Error(error as string);
}
