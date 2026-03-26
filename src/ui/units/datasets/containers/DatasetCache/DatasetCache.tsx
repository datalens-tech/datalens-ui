import React from 'react';

import block from 'bem-cn-lite';
import {useSelector} from 'react-redux';
import {CacheWarning} from 'ui/units/datasets/containers/DatasetCache/components/CacheWarning';

import {DatasetCacheGrid} from '../../components/DatasetCacheGrid/DatasetCacheGrid';
import {DatasetTabSection} from '../../components/DatasetTabSection/DatasetTabSection';
import {getEarlyInvalidationCacheMockText} from '../../helpers/mockTexts';
import {datasetCacheErrorSelector, datasetCacheFieldSelector} from '../../store/selectors';

import {Description} from './components/Description';
import {BaseClass} from './constants';

import './DatasetCache.scss';

type DatasetCacheProps = {
    readonly: boolean;
};
const b = block(BaseClass);
export const DatasetCache = ({readonly}: DatasetCacheProps) => {
    const formula = useSelector(datasetCacheFieldSelector);
    const error = useSelector(datasetCacheErrorSelector);

    return (
        <DatasetTabSection
            sectionNotice={error && <CacheWarning />}
            title={getEarlyInvalidationCacheMockText('dataset-cache-tab-title')}
            description={<Description />}
            confirmButtonText={getEarlyInvalidationCacheMockText('dataset-cache-tab-confirm-btn')}
            isLoading={false}
            confirmBtnSize="l"
            confirmBtnDisabled={!formula}
            confirmBtnClassName={b('confirm-btn')}
        >
            <DatasetCacheGrid readonly={readonly} />
        </DatasetTabSection>
    );
};
