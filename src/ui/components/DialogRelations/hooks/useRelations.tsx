import React from 'react';

import type {DashKit} from '@gravity-ui/dashkit';
import isEmpty from 'lodash/isEmpty';
import type {DashTabItem, WorkbookId} from 'shared';
import {DashTabItemType} from 'shared';

import type {GetEntriesDatasetsFieldsResponse} from '../../../../shared/schema';
import {getSdk} from '../../../libs/schematic-sdk';
import type {LoadHiddenWidgetsMetaType} from '../../../units/dash/contexts/WidgetMetaContext';
import {useWidgetContext} from '../../../units/dash/contexts/WidgetMetaContext';
import {getRowTitle} from '../components/Content/helpers';
import {DEFAULT_ALIAS_NAMESPACE} from '../constants';
import type {
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
    workbookId,
    selectedSubItemId,
    widgetsCurrentTab,
    loadHiddenWidgetsMeta,
}: {
    dashKitRef: React.RefObject<DashKit>;
    widget: DashTabItem | null;
    dialogAliases: Record<string, string[][]>;
    workbookId: WorkbookId;
    selectedSubItemId: string | null;
    widgetsCurrentTab: Record<string, string>;
    loadHiddenWidgetsMeta?: LoadHiddenWidgetsMetaType;
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

    const [prevSelectedSubItemId, setPrevSelectedSubItemId] = React.useState(selectedSubItemId);
    const [prevWidgetId, setPrevWidgetId] = React.useState(widget?.id ?? null);

    const getCurrentWidgetInfo = React.useCallback(
        (
            dashWidgetsMetaData: Omit<DashkitMetaDataItem, 'relations'>[],
            datasetsList: DatasetsListData,
        ) => {
            if (!dashKitRef?.current || !widget) {
                return;
            }

            const {connections} = dashKitRef.current.props.config;

            const widgetCurrentTabId = widgetsCurrentTab[widget.id];

            const currentMeta = getCurrentWidgetMeta({
                metaData: dashWidgetsMetaData,
                dashkitData: dashKitRef.current,
                widget,
                selectedSubItemId,
                tabId: widgetCurrentTabId,
            });

            const currentRelations = getRelationsData({
                metaData: dashWidgetsMetaData,
                widgetMeta: currentMeta,
                aliases: dialogAliases,
                connections: connections as ConnectionsData,
                datasets: datasetsList,
            });

            setCurrentWidgetMeta(currentMeta);
            setRelations(currentRelations);
        },
        [dashKitRef, dialogAliases, selectedSubItemId, widget, widgetsCurrentTab],
    );

    // the current item is changed in the modal
    if (
        isInited &&
        (selectedSubItemId !== prevSelectedSubItemId || widget?.id !== prevWidgetId) &&
        dashWidgetsMeta &&
        datasets
    ) {
        getCurrentWidgetInfo(dashWidgetsMeta, datasets);
        setPrevWidgetId(widget?.id ?? null);
        setPrevSelectedSubItemId(selectedSubItemId);
    }

    React.useEffect(() => {
        const getMetaData = async () => {
            if (!dashKitRef?.current || !widget) {
                return;
            }

            setIsLoading(true);

            // Collect metadata from all dashboard widgets
            const data = (await Promise.all(dashKitRef.current.getItemsMeta())) as DashkitMetaData;
            // Transform raw metadata into structured format with namespaces and extract datasets/entries lists
            // The dataset IDs are collected from loaded widgets (loadedData).
            // If widget is not loaded (inactive tabs), getEntriesDatasetsFields will be able to pull up the dataset by entryId in the case of wizard charts and editor with defined datasets on Shared tab.
            const {metaData, datasetsList, entriesList, controlsList} = getPreparedMetaData(
                data,
                dashKitRef.current,
            );

            let entriesDatasetsFields: GetEntriesDatasetsFieldsResponse = [];
            if (!isEmpty(entriesList) && (!isEmpty(datasetsList) || !isEmpty(controlsList))) {
                // TODO does not return the dataType of the field (to study whether it is needed in the links)
                entriesDatasetsFields = await getSdk().sdk.mix.getEntriesDatasetsFields({
                    entriesIds: entriesList,
                    datasetsIds: Object.keys(datasetsList),
                    workbookId,
                });
            }
            // Merge server-fetched dataset fields info into metadata if available
            // Add/update fields 'datasets' | 'type' | 'enableFiltering' | 'visualizationType' | 'usedParams'
            let dashWidgetsMetaData;
            const preventFetchIds = [];
            if (entriesDatasetsFields.length) {
                const {updatedMetaData, fetchedWidgetsIds} = getMetaDataWithDatasetInfo({
                    metaData,
                    entriesDatasetsFields,
                    datasetsList,
                });
                dashWidgetsMetaData = updatedMetaData;
                preventFetchIds.push(...fetchedWidgetsIds);
            } else {
                dashWidgetsMetaData = metaData;
            }

            // Sort widgets alphabetically by display title (combines label and title with separator)
            dashWidgetsMetaData.sort((prevItem, item) => {
                const prevItemTitle = getRowTitle(prevItem.title, prevItem.label);
                const itemTitle = getRowTitle(item.title, item.label);
                return prevItemTitle.localeCompare(itemTitle);
            });

            // Extract only dataset entries from server response
            const fetchedDatasets =
                entriesDatasetsFields?.filter((item) => item.type === 'dataset') || [];

            // Update local dataset info ('datasetsList') with names and fields from server
            if (fetchedDatasets?.length) {
                fetchedDatasets.forEach((datasetItem) => {
                    if (datasetItem.datasetId && datasetItem.datasetId in datasetsList) {
                        const datasetListItem = datasetsList[datasetItem.datasetId];
                        if (!datasetListItem.name && datasetItem.datasetName) {
                            datasetListItem.name = datasetItem.datasetName;
                        }
                        if (!datasetListItem.fields && datasetItem.datasetFields) {
                            datasetListItem.fields = datasetItem.datasetFields;
                        }
                    }
                });
            }

            const allUsedParams = dashWidgetsMetaData.reduce<Set<string>>((result, item) => {
                (item.usedParams || []).forEach(result.add, result);
                Object.keys(item.widgetParams || {}).forEach(result.add, result);

                return result;
            }, new Set());

            // Find alias parameters that don't exist in any widget
            const invalidAliasesData: string[] = [];
            if (DEFAULT_ALIAS_NAMESPACE in dialogAliases) {
                dialogAliases[DEFAULT_ALIAS_NAMESPACE].forEach((aliasRow) => {
                    aliasRow.forEach((item) => {
                        if (!allUsedParams.has(item)) {
                            invalidAliasesData.push(item);
                        }
                    });
                });
            }

            // // Collect IDs of charts with multiple tabs before main metadata collection
            // const multiTabChartIds: string[] = [];
            // if (dashKitRef.current.props.config.items) {
            //     dashKitRef.current.props.config.items.forEach((item) => {
            //         if (
            //             item.type === DashTabItemType.Widget &&
            //             item.data?.tabs &&
            //             item.data.tabs.length > 1
            //         ) {
            //             multiTabChartIds.push(item.id);
            //         }
            //     });
            // }

            // // Start loading metadata from inactive tabs in parallel (don't wait for it)
            // if (multiTabChartIds.length > 0 && loadHiddenWidgetsMeta) {
            //     console.log(multiTabChartIds, 'multiTabChartIds');
            //     loadHiddenWidgetsMeta({widgetIds: multiTabChartIds, preventFetchIds})
            //         .catch((error: any) => {
            //             console.warn('Failed to load metadata from inactive tabs:', error);
            //         })
            //         .then((hiddenWidgetsMeta) => {
            //             if (hiddenWidgetsMeta) {
            //                 console.log(hiddenWidgetsMeta, 'hiddenWidgetsMeta');
            //                 console.log(dashWidgetsMetaData, 'dashWidgetsMetaData');
            //                 const extendedWidgetsMetaData = dashWidgetsMetaData?.map((item) => {
            //                     return {
            //                         ...item,
            //                         ...hiddenWidgetsMeta[item.widgetId],
            //                     };
            //                 });
            //                 console.log(extendedWidgetsMetaData, 'extendedWidgetsMetaData');
            //                 getCurrentWidgetInfo(extendedWidgetsMetaData, datasetsList);
            //                 setDashWidgetsMeta(extendedWidgetsMetaData);
            //             }
            //         });
            // }

            // Calculate relations for current widget and update component state
            getCurrentWidgetInfo(dashWidgetsMetaData, datasetsList);

            setIsInited(true);
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
    }, [
        dashKitRef,
        isInited,
        widget,
        dialogAliases,
        workbookId,
        selectedSubItemId,
        datasets,
        dashWidgetsMeta,
        prevSelectedSubItemId,
        getCurrentWidgetInfo,
    ]);

    const updateWidgetMeta = (widgetId: string, meta: DashkitMetaDataItem) => {
        setDashWidgetsMeta((prevState) => {
            if (prevState) {
                return prevState.map((item) => {
                    if (item.widgetId === widgetId) {
                        return {...item, ...meta};
                    }
                    return item;
                });
            }
            return [{...meta}];
        });
    };

    return {
        isLoading,
        relations,
        currentWidgetMeta,
        datasets,
        dashWidgetsMeta,
        invalidAliases,
        updateWidgetMeta,
    };
};
