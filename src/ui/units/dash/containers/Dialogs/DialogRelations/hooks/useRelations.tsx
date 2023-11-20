import React from 'react';

import type {DashKit} from '@gravity-ui/dashkit';
import isEmpty from 'lodash/isEmpty';
import {DashTabItem} from 'shared';

import {
    GetEntriesDatasetsFieldsListItem,
    GetEntriesDatasetsFieldsResponse,
} from '../../../../../../../shared/schema';
import {getSdk} from '../../../../../../libs/schematic-sdk';
import {getRowTitle} from '../components/Content/helpers';
import {DEFAULT_ALIAS_NAMESPACE} from '../constants';
import {
    AliasContextProps,
    ConnectionsData,
    DashkitMetaData,
    DashkitMetaDataItem,
    DatasetsListData,
} from '../types';

import {
    getCurrentWidgetMeta,
    getMetaDataWithDatasetInfo,
    getPreparedMetaData,
    getRelationsData,
} from './helpers';

export const AliasesContext = React.createContext<AliasContextProps>({} as AliasContextProps);

export const useRelations = ({
    dashKitRef,
    widget,
    dialogAliases,
}: {
    dashKitRef: React.RefObject<DashKit>;
    widget: DashTabItem;
    dialogAliases: Record<string, string[][]>;
}) => {
    const [isInited, setIsInited] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [relations, setRelations] = React.useState<Array<DashkitMetaDataItem>>([]);
    const [currentWidgetMeta, setCurrentWidgetMeta] = React.useState<DashkitMetaDataItem | null>(
        null,
    );
    const [invalidAliases, setInvalidAliases] = React.useState<string[]>([]);

    const [dashWidgetsMeta, setDashWidgetsMeta] = React.useState<
        Omit<DashkitMetaDataItem, 'relations'>[] | null
    >(null);
    const [datasets, setDatasets] = React.useState<DatasetsListData | null>(null);

    React.useEffect(() => {
        const getMetaData = async () => {
            if (!dashKitRef?.current || !widget) {
                return;
            }

            setIsLoading(true);
            const data = (await Promise.all(dashKitRef.current.getItemsMeta())) as DashkitMetaData;
            const {metaData, datasetsList, entriesList, controlsList} = getPreparedMetaData(
                data,
                dashKitRef.current,
            );
            const {connections} = dashKitRef.current.props.config;

            let entriesDatasetsFields: GetEntriesDatasetsFieldsResponse = [];
            if (!isEmpty(entriesList) && (!isEmpty(datasetsList) || !isEmpty(controlsList))) {
                // TODO does not return the dataType of the field (to study whether it is needed in the links)
                entriesDatasetsFields = await getSdk().mix.getEntriesDatasetsFields({
                    entriesIds: entriesList,
                    datasetsIds: Object.keys(datasetsList),
                });
            }
            const dashWidgetsMetaData = entriesDatasetsFields.length
                ? getMetaDataWithDatasetInfo({
                      metaData,
                      entriesDatasetsFields,
                      datasetsList,
                  })
                : metaData;

            dashWidgetsMetaData.sort((prevItem, item) => {
                const prevItemTitle = getRowTitle(prevItem.title, prevItem.label);
                const itemTitle = getRowTitle(item.title, item.label);
                return prevItemTitle.localeCompare(itemTitle);
            });

            const currentMeta = getCurrentWidgetMeta({
                metaData: dashWidgetsMetaData,
                dashkitData: dashKitRef.current,
                widget,
            });

            const fetchedDatasets =
                entriesDatasetsFields?.filter((item) => item.type === 'dataset') || [];

            if (fetchedDatasets?.length) {
                fetchedDatasets.forEach((datasetItem) => {
                    if (datasetItem.datasetId && datasetItem.datasetId in datasetsList) {
                        const datasetListItem = datasetsList[datasetItem.datasetId];
                        if (!datasetListItem.name && datasetItem.datasetName) {
                            datasetListItem.name = datasetItem.datasetName;
                        }
                        if (!datasetListItem.fields && datasetItem.datasetFields) {
                            datasetListItem.fields =
                                datasetItem.datasetFields as GetEntriesDatasetsFieldsListItem[];
                        }
                    }
                });
            }

            const currentRelations = getRelationsData({
                metaData: dashWidgetsMetaData,
                widgetMeta: currentMeta,
                aliases: dialogAliases,
                connections: connections as ConnectionsData,
                datasets: datasetsList,
            });

            const allUsedParams = dashWidgetsMetaData.reduce((result: string[], item) => {
                const usedParams = item.usedParams || [];
                return [...result, ...usedParams];
            }, []);

            const invalidAliasesData: string[] = [];
            if (DEFAULT_ALIAS_NAMESPACE in dialogAliases) {
                dialogAliases[DEFAULT_ALIAS_NAMESPACE].forEach((aliasRow) => {
                    aliasRow.forEach((item) => {
                        if (!allUsedParams.includes(item)) {
                            invalidAliasesData.push(item);
                        }
                    });
                });
            }

            setIsInited(true);
            setCurrentWidgetMeta(currentMeta);
            setRelations(currentRelations);
            setIsLoading(false);
            setDatasets(datasetsList);
            setDashWidgetsMeta(dashWidgetsMetaData);
            setInvalidAliases(invalidAliasesData);
        };

        if (!isInited) {
            if (!dashKitRef?.current) {
                return;
            }
            getMetaData();
        }
    }, [dashKitRef, isInited, widget, dialogAliases]);

    return {isLoading, relations, currentWidgetMeta, datasets, dashWidgetsMeta, invalidAliases};
};
