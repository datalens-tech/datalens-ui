import React from 'react';

import type {SDK} from 'ui';

import type {DatasetTab} from '../../constants';
import {TAB_DATASET, TAB_FILTERS, TAB_PARAMETERS, TAB_SOURCES} from '../../constants';
import DatasetEditor from '../DatasetEditor/DatasetEditor';
import DatasetFilters from '../DatasetFilters/DatasetFilters';
import {DatasetParameters} from '../DatasetParameters/DatasetParameters';
import DatasetSources from '../DatasetSources/DatasetSources';

type Props = {
    tab?: DatasetTab;
    sdk: SDK;
    datasetId?: string;
    forwardedRef?: React.ForwardedRef<React.Component>;
    workbookId?: string | null;
};

function DatasetTabViewer(props: Props) {
    const {tab, sdk, datasetId, forwardedRef, workbookId} = props;

    switch (tab) {
        case TAB_SOURCES:
            return <DatasetSources ref={forwardedRef} sdk={sdk} workbookId={workbookId} />;
        case TAB_FILTERS:
            return <DatasetFilters />;
        case TAB_PARAMETERS:
            return <DatasetParameters />;
        case TAB_DATASET:
        default:
            return <DatasetEditor ref={forwardedRef} sdk={sdk} datasetId={datasetId} />;
    }
}

function ForwardedDatasetTabs(props: Props, ref: React.ForwardedRef<React.Component>) {
    return <DatasetTabViewer {...props} forwardedRef={ref} />;
}

ForwardedDatasetTabs.displayName = 'DatasetTabViewer';

export default React.forwardRef(ForwardedDatasetTabs);
