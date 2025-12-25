import React from 'react';

import type {CollectionId} from 'shared';
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
    collectionId?: CollectionId;
    readonly: boolean;
};

function DatasetTabViewer(props: Props) {
    const {tab, sdk, datasetId, forwardedRef, workbookId, collectionId, readonly} = props;

    switch (tab) {
        case TAB_SOURCES:
            return (
                <DatasetSources
                    ref={forwardedRef}
                    sdk={sdk}
                    workbookId={workbookId}
                    collectionId={collectionId}
                    readonly={readonly}
                />
            );
        case TAB_FILTERS:
            return <DatasetFilters readonly={readonly} />;
        case TAB_PARAMETERS:
            return <DatasetParameters readonly={readonly} />;
        case TAB_DATASET:
        default:
            return (
                <DatasetEditor
                    ref={forwardedRef}
                    sdk={sdk}
                    datasetId={datasetId}
                    readonly={readonly}
                />
            );
    }
}

function ForwardedDatasetTabs(props: Props, ref: React.ForwardedRef<React.Component>) {
    return <DatasetTabViewer {...props} forwardedRef={ref} />;
}

ForwardedDatasetTabs.displayName = 'DatasetTabViewer';

export default React.forwardRef(ForwardedDatasetTabs);
