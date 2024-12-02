import type React from 'react';

import type {DashTabConnectionKind} from 'shared';

import type {DashkitMetaDataItemBase, DatasetsFieldsListData} from '../DashKit/plugins/types';

import type {RELATIONS_CHARTS_ICONS_DICT, RELATION_TYPES} from './constants';

export type DashkitMetaDataItem = DashkitMetaDataItemBase & {
    relations: RelationsData;
    namespace: string;
};

export type RelationType = keyof typeof RELATION_TYPES;

export type RelationsData = {
    byUsedParams: Array<string>;
    byAliases: Array<Array<string>>;
    indirectAliases: Array<Array<string>>;
    isIgnoring: boolean;
    isIgnored: boolean;
    type: RelationType;
    available: Array<RelationType>;
    byFields: Array<string> | string;
    hasDataset: boolean;
    forceAddAlias: boolean;
};

export type DatasetsListData = Record<
    string,
    {
        fields: Array<DatasetsFieldsListData>;
        name?: string;
    }
>;

export type DatasetsFlatListData = Record<string, Record<string, string>>;

export type Datasets = DatasetsListData | null;

export type DashkitMetaData = Array<DashkitMetaDataItem | Array<DashkitMetaDataItem>>;

export type DashMetaData = Array<DashkitMetaDataItem>;

export type DashkitMetaDataItemNoRelations = Omit<DashkitMetaDataItem, 'relations'>;

export type DashMetaDataNoRelations = Array<DashkitMetaDataItemNoRelations>;

export type AliasesData = Record<string, Array<Array<string>>>;

export type ConnectionsData = Array<{
    from: string;
    to: string;
    kind: DashTabConnectionKind;
}>;

export type ClickCallbackArgs = {
    reset?: boolean;
    changedWidgetsData?: WidgetsTypes;
    changedWidgetId?: string;
    aliases?: string[][];
};

export type WidgetsTypes = Record<string, Record<string, RelationType>>;

export type AliasBase = {
    onCloseCallback?: (args?: ClickCallbackArgs) => void;
    forceAddAlias?: boolean;
    relationText: React.ReactNode;
    relationType: RelationType;
    changedWidgetsData?: WidgetsTypes;
    changedWidgetId?: string;
    changedItemId?: string;
};

export type AliasClickHandlerData = AliasBase & {
    showDebugInfo: boolean;
    currentRow: DashkitMetaDataItem;
    widgetIcon: React.ReactNode;
    rowIcon: React.ReactNode;
};

export type AliasClickHandlerArgs = AliasClickHandlerData &
    AliasBase & {
        relations: DashMetaData;
        currentWidget: DashkitMetaDataItem;
        datasets: DatasetsListData | null;
        updateAliases: (args: string[][]) => void;
        invalidAliases: string[];
        dialogAliases: Record<string, string[][]>;
    };

export type AliasContextProps = {
    showDebugInfo: boolean;
    datasets: DatasetsListData | null;
    relations: DashMetaData;
    selectedAliasRowIndex: number | null;
    selectedParam: string | null;
    invalidAliases: string[];
};

export type RelationChartType = keyof typeof RELATIONS_CHARTS_ICONS_DICT;

export type RelationTypeChangeProps = {
    type: RelationType;
    widgetId: DashkitMetaDataItem['widgetId'];
    itemId: DashkitMetaDataItem['itemId'];
} & AliasClickHandlerData;
