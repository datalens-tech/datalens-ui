import React from 'react';

import block from 'bem-cn-lite';
import type {RouteComponentProps} from 'react-router-dom';
import {Feature} from 'shared';
import type {SDK} from 'ui';
import {Utils} from 'ui';
import {registry} from 'ui/registry';

import type {AsideHeaderData} from '../../../../store/typings/asideHeader';
import {DATASET_TABS, TAB_DATASET, TAB_SOURCES} from '../../constants';
import {ActionQueryParam, QueryParam, mapYTClusterToConnId} from '../../constants/datasets';
import DatasetUtils from '../../helpers/utils';
import Dataset from '../Dataset/Dataset';

import {createDatasetPageContext} from './createDatasetPageContext';

import './DatasetPage.scss';

interface DatasetPageProps extends RouteComponentProps<Record<string, string>> {
    sdk: SDK;
    asideHeaderData: AsideHeaderData;
    isCreationProcess?: boolean;
}

export const DatasetPageContext = createDatasetPageContext({sdk: {} as SDK, datasetId: ''});
export const DatasetPageProvider = DatasetPageContext.Provider;
export const DatasetPageConsumer = DatasetPageContext.Consumer;

const b = block('dataset-page');

const getDatasetTab = (queryTab?: string, isCreationProcess = false) => {
    const defaultTab = isCreationProcess ? TAB_SOURCES : TAB_DATASET;

    if (!queryTab) {
        return defaultTab;
    }

    if (DATASET_TABS.includes(queryTab)) {
        return queryTab;
    }

    return defaultTab;
};

class DatasetPage extends React.Component<DatasetPageProps> {
    render() {
        const {sdk, isCreationProcess, history, asideHeaderData} = this.props;

        return (
            <div className={b()}>
                <DatasetPageProvider value={this.providerValue}>
                    <Dataset
                        sdk={sdk}
                        datasetId={this.datasetId}
                        connectionId={this.connectionId}
                        tab={getDatasetTab(DatasetUtils.getQueryParam('tab'), isCreationProcess)}
                        history={history}
                        asideHeaderData={asideHeaderData}
                        ytPath={this.ytPath}
                        isCreationProcess={isCreationProcess}
                        isAuto={this.isAuto}
                    />
                </DatasetPageProvider>
            </div>
        );
    }

    get isAuto() {
        if (Utils.isEnabledFeature(Feature.EnableAutocreateDataset) || this.datasetId) {
            return false;
        }

        const action = DatasetUtils.getQueryParam(QueryParam.Action);
        const ytPath = DatasetUtils.getQueryParam(QueryParam.YtPath);

        // CHARTS-3534
        return Boolean(ytPath && action === ActionQueryParam.AutoCreate);
    }

    get connectionId() {
        const connectionId = DatasetUtils.getQueryParam('id');

        if (!connectionId) {
            return '';
        }

        const mappedConnId = mapYTClusterToConnId[connectionId];

        return mappedConnId || connectionId;
    }

    get datasetId() {
        const datasetId = this.getParamFromMatch('datasetId');

        if (!datasetId) {
            return '';
        }

        const {extractEntryId} = registry.common.functions.getAll();

        return extractEntryId(datasetId) || '';
    }

    get ytPath() {
        const ytPath = DatasetUtils.getQueryParam(QueryParam.YtPath);

        return ytPath ? decodeURIComponent(ytPath) : undefined;
    }

    get providerValue() {
        return {
            sdk: this.props.sdk,
            datasetId: this.datasetId,
        };
    }

    private getParamFromMatch(name: string) {
        return this.props.match.params[name];
    }
}

export const useDatasetPageContext = () => React.useContext(DatasetPageContext);

export default DatasetPage;
