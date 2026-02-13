import React from 'react';

import type {CollectionId} from 'shared';
import {DATASET_TAB, Feature} from 'shared';
import type {SDK} from 'ui';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {DatasetTab} from '../../constants';
import {DatasetCache} from '../DatasetCache/DatasetCache';
import DatasetEditor from '../DatasetEditor/DatasetEditor';
import DatasetFilters from '../DatasetFilters/DatasetFilters';
import {DatasetParameters} from '../DatasetParameters/DatasetParameters';
import type {DatasetSources as DS} from '../DatasetSources/DatasetSources';
import DatasetSources from '../DatasetSources/DatasetSources';

type Props = {
    tab?: DatasetTab;
    sdk: SDK;
    datasetId?: string;
    forwardedRef?: React.ForwardedRef<React.Component>;
    workbookId: string | null;
    collectionId: CollectionId;
    readonly: boolean;
    bindedWorkbookId?: string | null;
};

function DatasetTabViewer(props: Props) {
    const {
        tab,
        sdk,
        datasetId,
        forwardedRef,
        workbookId,
        collectionId,
        readonly,
        bindedWorkbookId,
    } = props;

    switch (tab) {
        case DATASET_TAB.SOURCES:
            return (
                <DatasetSources
                    ref={forwardedRef as React.LegacyRef<DS>}
                    sdk={sdk}
                    workbookId={workbookId}
                    collectionId={collectionId}
                    readonly={readonly}
                    bindedWorkbookId={bindedWorkbookId}
                />
            );
        case DATASET_TAB.FILTERS:
            return <DatasetFilters readonly={readonly} />;
        case DATASET_TAB.PARAMETERS:
            return <DatasetParameters readonly={readonly} />;
        case DATASET_TAB.CACHE:
            if (isEnabledFeature(Feature.EnableDatasetEarlyInvalidationCache)) {
                return <DatasetCache readonly={readonly} />;
            }
            return null;
        case DATASET_TAB.DATASET:
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
