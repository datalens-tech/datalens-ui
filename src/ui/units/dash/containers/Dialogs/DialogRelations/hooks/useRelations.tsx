import React from 'react';

import type {DashKit} from '@gravity-ui/dashkit';
import isEmpty from 'lodash/isEmpty';
import {DashTabItem} from 'shared';

import {GetEntriesDatasetsFieldsResponse} from '../../../../../../../shared/schema';
import {getSdk} from '../../../../../../libs/schematic-sdk';
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
}: {
    dashKitRef: React.RefObject<DashKit>;
    widget: DashTabItem;
}) => {
    const [isInited, setIsInited] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [relations, setRelations] = React.useState<Array<DashkitMetaDataItem>>([]);
    const [currentWidgetMeta, setCurrentWidgetMeta] = React.useState<DashkitMetaDataItem | null>(
        null,
    );
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
            const {aliases, connections} = dashKitRef.current.props.config;

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

            const currentMeta = getCurrentWidgetMeta({
                metaData: dashWidgetsMetaData,
                dashkitData: dashKitRef.current,
                widget,
            });

            const currentRelations = getRelationsData({
                metaData: dashWidgetsMetaData,
                widgetMeta: currentMeta,
                aliases,
                connections: connections as ConnectionsData,
                datasets: datasetsList,
            });

            setIsInited(true);
            setCurrentWidgetMeta(currentMeta);
            setRelations(currentRelations);
            setIsLoading(false);
            setDatasets(datasetsList);
        };

        if (!isInited) {
            if (!dashKitRef?.current) {
                return;
            }
            getMetaData();
        }
    }, [isInited]);

    return {isLoading, relations, currentWidgetMeta, datasets};
};
