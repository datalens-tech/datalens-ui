import React from 'react';

import {SegmentedRadioGroup as RadioButton} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {DATASET_CACHE_MODE} from 'shared';

import type {DatasetCacheMode} from '../../../constants';
import {getEarlyInvalidationCacheMockText} from '../../../helpers/mockTexts';
import {setDatasetCacheMode} from '../../../store/actions/creators';
import {datasetCacheModeSelector} from '../../../store/selectors';

import {Row} from './Row';

const tabs = [
    {
        value: DATASET_CACHE_MODE.OFF,
        label: getEarlyInvalidationCacheMockText('cache-value-disabled'),
    },
    {
        value: DATASET_CACHE_MODE.FORMULA,
        label: getEarlyInvalidationCacheMockText('cache-value-formula'),
    },
    {
        value: DATASET_CACHE_MODE.SQL,
        label: getEarlyInvalidationCacheMockText('cache-value-sql'),
    },
];

type CacheModeSelectorProps = {
    readonly: boolean;
};

export const CacheModeSelector = ({readonly}: CacheModeSelectorProps) => {
    const dispatch = useDispatch();
    const cacheMode = useSelector(datasetCacheModeSelector);

    const onChangeMode = React.useCallback(
        (mode: DatasetCacheMode) => {
            dispatch(setDatasetCacheMode(mode));
        },
        [dispatch],
    );

    return (
        <Row label={getEarlyInvalidationCacheMockText('cache-value-row-label')}>
            <RadioButton
                size="m"
                value={cacheMode}
                onUpdate={onChangeMode}
                //TODO disabled on connection level (maybe in getEntry connection request)
                disabled={readonly}
            >
                {tabs.map(({value, label}) => (
                    <RadioButton.Option
                        key={value}
                        content={label}
                        value={value}
                        // TODO add disable for connections with disabled sql
                    />
                ))}
            </RadioButton>
        </Row>
    );
};
