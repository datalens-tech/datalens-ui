import React from 'react';

import block from 'bem-cn-lite';
import {useSelector} from 'react-redux';
import {DATASET_CACHE_MODE} from 'shared';

import {datasetCacheModeSelector} from '../../store/selectors';

import {CacheModeSelector} from './components/CacheModeSelector';
import {FormulaContent} from './components/FormulaContent';
import {SqlContent} from './components/SqlContent';

import './DatasetCacheGrid.scss';

const b = block('dataset-cache-grid');

type DatasetCacheGridProps = {
    readonly: boolean;
};

export const DatasetCacheGrid = ({readonly}: DatasetCacheGridProps) => {
    const cacheMode = useSelector(datasetCacheModeSelector);

    const renderModeContent = () => {
        switch (cacheMode) {
            case DATASET_CACHE_MODE.FORMULA:
                return <FormulaContent readonly={readonly} />;
            case DATASET_CACHE_MODE.SQL:
                return <SqlContent readonly={readonly} />;
            case DATASET_CACHE_MODE.OFF:
            default:
                return null;
        }
    };

    return (
        <div className={b()}>
            <CacheModeSelector readonly={readonly} />
            {renderModeContent()}
        </div>
    );
};
