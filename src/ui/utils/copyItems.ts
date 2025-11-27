import type {ConfigItem, ConfigItemData} from '@gravity-ui/dashkit';
import {
    CustomPaletteBgColors,
    WIDGET_BG_COLORS_PRESET,
    getColorSettingsWithValue,
} from 'shared/constants';
import {getActualOldBackground} from 'shared/modules/dash-scheme-converter';
import type {BackgroundSettings, ColorSettings, OldBackgroundSettings} from 'shared/types';
import {
    DashTabItemType,
    Feature,
    isBackgroundSettings,
    isColorByTheme,
    isOldBackgroundSettings,
} from 'shared/types';
import type {ConnectionsData} from 'ui/components/DialogRelations/types';

import {isEnabledFeature} from './isEnabledFeature';
import {computeColorFromToken} from './widgetColors';

// targetId - item is copied data from localStorage
// id - item is already created via DashKit.setItem
type TargetWidgetId = {id: string} | {targetId?: string};

type WidgetItem = {
    type: ConfigItem['type'];
    data: ConfigItemData;
} & TargetWidgetId;

export const collectWidgetItemIds = (item: WidgetItem): string[] => {
    if (item.type === DashTabItemType.GroupControl && item.data.group) {
        return item.data.group.map((groupItem) => groupItem.id);
    }

    if (item.type === DashTabItemType.Widget && item.data.tabs) {
        return item.data.tabs.map((tabItem) => tabItem.id);
    }

    // old selectors doesn't have tabs or group. widgetId is the only identifier
    const itemId = 'id' in item ? item.id : item.targetId;
    return itemId ? [itemId] : [];
};

type GetUpdatedConnectionsArgs = {
    item: ConfigItem;
    connections: ConnectionsData;
} & (
    | {targetIds: string[]; indexTargetIdMap?: never}
    | {targetIds?: never; indexTargetIdMap: Record<string, string>}
);

const createIdsDictionary = (
    copiedItemIds: string[],
    targetIds?: string[],
    indexTargetIdMap?: Record<string, string>,
) => {
    // <old id from copied item, current id in item>
    const idsDictionary: Record<string, string> = {};

    if (targetIds) {
        for (let i = 0; i < targetIds.length; i++) {
            const copiedId = copiedItemIds[i];
            if (copiedId) {
                idsDictionary[targetIds[i]] = copiedId;
            }
        }
    } else if (indexTargetIdMap) {
        for (const [index, targetId] of Object.entries(indexTargetIdMap)) {
            const currentId = copiedItemIds[Number(index)];
            if (currentId) {
                idsDictionary[targetId] = currentId;
            }
        }
    }

    return idsDictionary;
};

export const getUpdatedConnections = ({
    item,
    connections,
    targetIds,
    indexTargetIdMap,
}: GetUpdatedConnectionsArgs): ConnectionsData => {
    const copiedItemIds = collectWidgetItemIds(item);

    const idsDictionary = createIdsDictionary(copiedItemIds, targetIds, indexTargetIdMap);

    if (Object.keys(idsDictionary).length === 0) {
        return connections;
    }

    const copiedConnections: ConnectionsData = [];

    connections.forEach((connection) => {
        const replacedFromId = idsDictionary[connection.from];
        const replacedToId = idsDictionary[connection.to];

        if (replacedFromId || replacedToId) {
            copiedConnections.push({
                to: replacedToId || connection.to,
                from: replacedFromId || connection.from,
                kind: connection.kind,
            });
        }
    });

    return [...connections, ...copiedConnections];
};

const isDashColorPickersByThemeEnabled = isEnabledFeature(Feature.EnableDashColorPickersByTheme);

export function getUpdatedBackgroundData({
    background,
    backgroundSettings,
    allowCustomValues = false,
    enableSeparateThemeColorSelector = true,
    defaultOldColor,
}: {
    background: unknown;
    backgroundSettings: unknown;
    allowCustomValues: boolean;
    enableSeparateThemeColorSelector: boolean;
    defaultOldColor: string;
}): {
    backgroundSettings: BackgroundSettings | undefined;
    background: OldBackgroundSettings | undefined;
} {
    let oldColor: string | undefined;
    let newColor: ColorSettings | undefined;

    const isOldBackground = isOldBackgroundSettings(background);
    const isBgSettings = isBackgroundSettings(backgroundSettings);

    if (isOldBackground) {
        oldColor = getActualOldBackground(background, defaultOldColor)?.color;

        if (
            !isDashColorPickersByThemeEnabled &&
            !allowCustomValues &&
            oldColor &&
            !WIDGET_BG_COLORS_PRESET.includes(oldColor) &&
            !Object.values<string>(CustomPaletteBgColors).includes(oldColor)
        ) {
            oldColor = defaultOldColor;
        }
    }

    if (isBgSettings) {
        const color = backgroundSettings.color;
        if (
            !color ||
            (isColorByTheme(color) && enableSeparateThemeColorSelector) ||
            (!isColorByTheme(color) && !enableSeparateThemeColorSelector)
        ) {
            newColor = color;
        }
    } else if (isDashColorPickersByThemeEnabled) {
        newColor = getColorSettingsWithValue(
            computeColorFromToken(oldColor ?? defaultOldColor),
            enableSeparateThemeColorSelector,
        );
    }

    return isBgSettings
        ? {
              background: undefined,
              backgroundSettings: {color: newColor},
          }
        : {
              background: oldColor ? {color: oldColor} : undefined,
              backgroundSettings: undefined,
          };
}
