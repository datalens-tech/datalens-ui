import React from 'react';

import type {DashKit} from '@gravity-ui/dashkit';
import isEmpty from 'lodash/isEmpty';
import {useSelector} from 'react-redux';
import type {DashTabItem, WorkbookId} from 'shared';
import {selectWidgetsCurrentTab} from 'ui/units/dash/store/selectors/dashTypedSelectors';

import type {GetEntriesDatasetsFieldsResponse} from '../../../../../../../shared/schema';
import {getSdk} from '../../../../../../libs/schematic-sdk';
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
    itemId,
}: {
    dashKitRef: React.RefObject<DashKit>;
    widget: DashTabItem;
    dialogAliases: Record<string, string[][]>;
    workbookId: WorkbookId;
    itemId: string | null;
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

    const [prevItemId, setPrevItemId] = React.useState(itemId);
    const [prevWidgetId, setPrevWidgetId] = React.useState(widget.id);

    const widgetsCurrentTab = useSelector(selectWidgetsCurrentTab);

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
                itemId,
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
        [dashKitRef, dialogAliases, itemId, widget, widgetsCurrentTab],
    );

    // the current item is changed in the modal
    if (
        isInited &&
        (itemId !== prevItemId || widget.id !== prevWidgetId) &&
        dashWidgetsMeta &&
        datasets
    ) {
        getCurrentWidgetInfo(dashWidgetsMeta, datasets);
        setPrevWidgetId(widget.id);
        setPrevItemId(itemId);
    }

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

            let entriesDatasetsFields: GetEntriesDatasetsFieldsResponse = [];
            if (!isEmpty(entriesList) && (!isEmpty(datasetsList) || !isEmpty(controlsList))) {
                // TODO does not return the dataType of the field (to study whether it is needed in the links)
                entriesDatasetsFields = await getSdk().mix.getEntriesDatasetsFields({
                    entriesIds: entriesList,
                    datasetsIds: Object.keys(datasetsList),
                    workbookId,
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
                            datasetListItem.fields = datasetItem.datasetFields;
                        }
                    }
                });
            }

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
        itemId,
        datasets,
        dashWidgetsMeta,
        prevItemId,
        getCurrentWidgetInfo,
    ]);

    return {isLoading, relations, currentWidgetMeta, datasets, dashWidgetsMeta, invalidAliases};
};
