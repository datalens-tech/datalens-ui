import React from 'react';

import {DashTabConnectionKind} from 'shared';

import {
    DashkitMetaDataItemBase,
    DatasetsFieldsListData,
} from '../../../../../components/DashKit/plugins/types';

import {RELATIONS_CHARTS_ICONS_DICT, RELATION_TYPES} from './constants';

export type DashkitMetaDataItem = DashkitMetaDataItemBase & {
    relations: RelationsData;
    namespace: string;
};

export type RelationType = keyof typeof RELATION_TYPES;

export type RelationsData = {
    byUsedParams: Array<string>;
    byAliases: Array<Array<string>>;
    isIgnoring: boolean;
    isIgnored: boolean;
    type: RelationType;
    available: Array<RelationType>;
    byFields: Array<string> | string;
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

export type AliasClickHandlerData = {
    showDebugInfo: boolean;
    currentRow: DashkitMetaDataItem;
    relationText: React.ReactNode;
    relationType: RelationType;
    widgetIcon: React.ReactNode;
    rowIcon: React.ReactNode;
};

export type AliasClickHandlerArgs = AliasClickHandlerData & {
    relations: DashMetaData;
    currentWidget: DashkitMetaDataItem;
    datasets: DatasetsListData | null;
    updateRelations: (args: string[][]) => void;
    updateAliases: (args: string[][]) => void;
};

export type AliasContextProps = {
    showDebugInfo: boolean;
    datasets: DatasetsListData | null;
    relations: DashMetaData;
    selectedAliasRowIndex: number | null;
    selectedParam: string | null;
};

export type RelationChartType = keyof typeof RELATIONS_CHARTS_ICONS_DICT;
