import React from 'react';

import type {DashKit} from '@gravity-ui/dashkit';
import isEmpty from 'lodash/isEmpty';
import type {DashTabItem, WorkbookId} from 'shared';
import {useMountedState} from 'ui/hooks';

import type {GetEntriesDatasetsFieldsResponse} from '../../../../shared/schema';
import {getSdk} from '../../../libs/schematic-sdk';
import type {LoadHiddenWidgetMetaType} from '../../../units/dash/contexts/WidgetMetaContext';
import type {DashkitMetaDataItemBase, DatasetsData} from '../../DashKit/plugins/types';
import type {CurrentRequestState} from '../../Widgets/Chart/types';
import {getRowTitle} from '../components/Content/helpers';
import {DEFAULT_ALIAS_NAMESPACE} from '../constants';
import type {
    AliasContextProps,
    ConnectionsData,
    DashkitMetaData,
    DashkitMetaDataItem,
    DatasetsListData,
    OnLoadMetaType,
} from '../types';

import {
    getChartId,
    getCurrentWidgetMeta,
    getMetaDataWithDatasetInfo,
    getPreparedMetaData,
    getRelationsData,
} from './helpers';

export const AliasesContext = React.createContext<AliasContextProps>({} as AliasContextProps);

export const useRelations = ({
    dashKitRef,
    initialWidget,
    dialogAliases,
    workbookId,
    selectedSubItemId,
    loadHiddenWidgetMeta,
    silentRequestCancellationRef,
}: {
    dashKitRef: React.RefObject<DashKit>;
    initialWidget: DashTabItem | null;
    dialogAliases: Record<string, string[][]>;
    workbookId: WorkbookId;
    selectedSubItemId: string | null;
    loadHiddenWidgetMeta?: LoadHiddenWidgetMetaType;
    silentRequestCancellationRef: React.MutableRefObject<CurrentRequestState>;
}) => {
    const isMounted = useMountedState();
    const [currentWidget, setCurrentWidget] = React.useState<DashTabItem | null>(
        initialWidget ?? null,
    );

    const [isInited, setIsInited] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [silentFetchingWidgets, setSilentFetchingWidgets] = React.useState<Set<string>>(
        new Set(),
    );

    const [relations, setRelations] = React.useState<DashkitMetaDataItem[]>([]);
    const [currentWidgetMeta, setCurrentWidgetMeta] = React.useState<DashkitMetaDataItem | null>(
        null,
    );
    const [invalidAliases, setInvalidAliases] = React.useState<string[]>([]);
    const [_, setAllUsedParams] = React.useState<Set<string>>(new Set());

    const [dashWidgetsMeta, setDashWidgetsMeta] = React.useState<
        Omit<DashkitMetaDataItem, 'relations'>[] | null
    >(null);
    const [datasets, setDatasets] = React.useState<DatasetsListData | null>(null);

    const getCurrentWidgetInfo = React.useCallback(
        ({
            dashWidgetsMetaData,
            datasetsList,
            widget,
            subItemId,
        }: {
            dashWidgetsMetaData: Omit<DashkitMetaDataItem, 'relations'>[] | null;
            datasetsList: DatasetsListData | null;
            widget: DashTabItem | null;
            subItemId: string | null;
        }) => {
            if (!dashKitRef?.current || !dashWidgetsMetaData || !datasetsList || !widget) {
                return;
            }

            const {connections} = dashKitRef.current.props.config;

            const currentMeta = getCurrentWidgetMeta({
                metaData: dashWidgetsMetaData,
                dashkitData: dashKitRef.current,
                widget,
                selectedSubItemId: subItemId,
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
        [dashKitRef, dialogAliases],
    );

    const calculateInvalidAliasesFromParams = React.useCallback(
        (usedParams: Set<string>) => {
            const invalidAliasesData: string[] = [];
            if (DEFAULT_ALIAS_NAMESPACE in dialogAliases) {
                dialogAliases[DEFAULT_ALIAS_NAMESPACE].forEach((aliasRow) => {
                    aliasRow.forEach((item) => {
                        if (!usedParams.has(item)) {
                            invalidAliasesData.push(item);
                        }
                    });
                });
            }

            return invalidAliasesData;
        },
        [dialogAliases],
    );

    const updateMetaAndRelations = React.useCallback(
        ({
            subItemId,
            updatedMeta,
        }: {
            subItemId: string | null;
            updatedMeta: Omit<DashkitMetaDataItemBase, 'defaultParams'> | {widgetId: string};
        }) => {
            if (!subItemId) {
                return {};
            }

            let updatedWidgetsMeta: Omit<DashkitMetaDataItem, 'relations'>[] | null = null;
            let updatedDatasets: DatasetsListData | null = null;

            setDashWidgetsMeta((prevMeta) => {
                if (!prevMeta) {
                    return prevMeta;
                }
                updatedWidgetsMeta = prevMeta.map((item) => {
                    if (item.widgetId === subItemId) {
                        return {
                            ...item,
                            ...updatedMeta,
                            isFetchFinished: true,
                        };
                    }
                    return item;
                });

                return updatedWidgetsMeta;
            });

            setDatasets((prevDatasets) => {
                if (!prevDatasets) {
                    return prevDatasets;
                }
                updatedDatasets = {...prevDatasets};
                if ('datasets' in updatedMeta && updatedMeta.datasets?.length) {
                    updatedMeta.datasets.forEach((datasetItem: DatasetsData) => {
                        if (datasetItem.id) {
                            updatedDatasets![datasetItem.id] = {
                                fields: datasetItem.fieldsList,
                            };
                        }
                    });
                }

                return updatedDatasets;
            });

            setAllUsedParams((prevParams) => {
                const newUsedParams = new Set(prevParams);
                if ('usedParams' in updatedMeta && updatedMeta.usedParams) {
                    updatedMeta.usedParams.forEach((param) => newUsedParams.add(param));
                }
                if ('widgetParams' in updatedMeta && updatedMeta.widgetParams) {
                    Object.keys(updatedMeta.widgetParams).forEach((param) =>
                        newUsedParams.add(param),
                    );
                }

                // Recalculate invalid aliases with updated params
                const newInvalidAliases = calculateInvalidAliasesFromParams(newUsedParams);
                setInvalidAliases(newInvalidAliases);

                return newUsedParams;
            });

            return {updatedWidgetsMeta, updatedDatasets};
        },
        [calculateInvalidAliasesFromParams],
    );

    const onLoadMeta = React.useCallback<OnLoadMetaType>(
        async ({widget, subItemId, needChangeCurrent}) => {
            if (!loadHiddenWidgetMeta) {
                return;
            }

            const currentChartId = getChartId(widget, subItemId);

            if (currentChartId && silentRequestCancellationRef.current[currentChartId]) {
                return;
            }

            const widgetId = needChangeCurrent ? widget.id : widget.layoutId;

            let updatedMeta;

            const itemId = subItemId || widgetId;

            setSilentFetchingWidgets((prevWidgets) => {
                const newSet = new Set(prevWidgets);
                newSet.add(itemId);
                return newSet;
            });

            try {
                updatedMeta = await loadHiddenWidgetMeta({
                    widgetId,
                    subItemId,
                    silentRequestCancellationRef,
                });
            } catch (error) {
                updatedMeta = {widgetId: itemId, loadError: true};
            } finally {
                setSilentFetchingWidgets((prevWidgets) => {
                    const newSet = new Set(prevWidgets);
                    newSet.delete(itemId);
                    return newSet;
                });
            }

            if (currentChartId && silentRequestCancellationRef.current[currentChartId]) {
                delete silentRequestCancellationRef.current[currentChartId];
            }

            if (updatedMeta && isMounted()) {
                const {updatedWidgetsMeta, updatedDatasets} = updateMetaAndRelations({
                    subItemId,
                    updatedMeta,
                });

                if (updatedWidgetsMeta && updatedDatasets) {
                    const targetWidget = needChangeCurrent ? widget : currentWidget;
                    const targetSubItemId = needChangeCurrent ? subItemId : selectedSubItemId;

                    getCurrentWidgetInfo({
                        dashWidgetsMetaData: updatedWidgetsMeta,
                        datasetsList: updatedDatasets,
                        widget: targetWidget,
                        subItemId: targetSubItemId,
                    });
                }
            }
        },
        [
            currentWidget,
            getCurrentWidgetInfo,
            isMounted,
            loadHiddenWidgetMeta,
            selectedSubItemId,
            silentRequestCancellationRef,
            updateMetaAndRelations,
        ],
    );

    React.useEffect(() => {
        const getMetaData = async () => {
            if (!dashKitRef?.current || !currentWidget) {
                return;
            }

            setIsLoading(true);

            // Collect metadata from all dashboard widgets
            const data = (await Promise.all(dashKitRef.current.getItemsMeta())) as DashkitMetaData;
            // Transform raw metadata into structured format with namespaces and extract datasets/entries lists
            // The dataset IDs are collected from loaded widgets (loadedData).
            // If widget is not loaded (inactive tabs), getEntriesDatasetsFields will be able to pull up the dataset by entryId in the case of wizard charts and editor with defined datasets
            //  Shared tab.
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
            let dashWidgetsMetaData: Omit<DashkitMetaDataItem, 'relations'>[];
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

            const allUsedParamsData = dashWidgetsMetaData.reduce<Set<string>>((result, item) => {
                (item.usedParams || []).forEach(result.add, result);
                Object.keys(item.widgetParams || {}).forEach(result.add, result);
                return result;
            }, new Set());

            const invalidAliasesData = calculateInvalidAliasesFromParams(allUsedParamsData);

            getCurrentWidgetInfo({
                dashWidgetsMetaData,
                datasetsList,
                widget: currentWidget,
                subItemId: selectedSubItemId,
            });

            setIsInited(true);
            setIsLoading(false);
            setDatasets(datasetsList);
            setDashWidgetsMeta(dashWidgetsMetaData);
            setAllUsedParams(allUsedParamsData);
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
        currentWidget,
        dialogAliases,
        workbookId,
        selectedSubItemId,
        datasets,
        dashWidgetsMeta,
        getCurrentWidgetInfo,
        calculateInvalidAliasesFromParams,
    ]);

    const onChangeCurrentWidget = React.useCallback(
        ({
            newCurrentWidget,
            newSelectedSubItemId,
        }: {
            newCurrentWidget: DashTabItem;
            newSelectedSubItemId: string | null;
        }) => {
            setCurrentWidget(newCurrentWidget);
            const selectedWidgetMeta = newSelectedSubItemId
                ? dashWidgetsMeta?.find((item) => item.widgetId === newSelectedSubItemId)
                : null;

            if (
                selectedWidgetMeta &&
                !selectedWidgetMeta.loaded &&
                !selectedWidgetMeta.loadError &&
                !selectedWidgetMeta.isFetchFinished
            ) {
                onLoadMeta({
                    widget: newCurrentWidget,
                    subItemId: newSelectedSubItemId,
                    needChangeCurrent: true,
                });
            } else {
                getCurrentWidgetInfo({
                    dashWidgetsMetaData: dashWidgetsMeta,
                    datasetsList: datasets,
                    widget: newCurrentWidget,
                    subItemId: newSelectedSubItemId,
                });
            }
        },
        [dashWidgetsMeta, datasets, getCurrentWidgetInfo, onLoadMeta],
    );

    return {
        isLoading,
        relations,
        currentWidgetMeta,
        datasets,
        dashWidgetsMeta,
        invalidAliases,
        silentFetchingWidgets,
        setRelations,
        onLoadMeta,
        currentWidget,
        onChangeCurrentWidget,
        setInvalidAliases,
    };
};
