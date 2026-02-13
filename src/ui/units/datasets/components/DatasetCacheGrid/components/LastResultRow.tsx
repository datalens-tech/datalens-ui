import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {Button, Text, spacing} from '@gravity-ui/uikit';
import {useSelector} from 'react-redux';

import {getEarlyInvalidationCacheMockText} from '../../../helpers/mockTexts';
import {
    datasetCacheLastResultErrorSelector,
    datasetCacheLastResultTimeSelector,
} from '../../../store/selectors';

import {Row} from './Row';

type LastResultRowProps = {
    readonly: boolean;
};

export const LastResultRow = ({readonly}: LastResultRowProps) => {
    const lastResultTimestamp = useSelector(datasetCacheLastResultTimeSelector);
    const error = useSelector(datasetCacheLastResultErrorSelector);

    const onErrorOpen = () => {};

    const onLastResultOpen = () => {};

    if (!lastResultTimestamp) {
        return null;
    }

    if (error) {
        return (
            <Row label={getEarlyInvalidationCacheMockText('last-result-label')}>
                <Text className={spacing({mr: 2})} variant="body-1" color="warning-heavy">
                    {getEarlyInvalidationCacheMockText('last-result-error-text')}
                </Text>
                <Button disabled={readonly} view="outlined" onClick={onErrorOpen}>
                    {getEarlyInvalidationCacheMockText('last-result-error-btn-text')}
                </Button>
            </Row>
        );
    }

    const lastResultDate = dateTime({input: lastResultTimestamp});

    return (
        <Row label={getEarlyInvalidationCacheMockText('last-result-label')}>
            <Button className={spacing({mr: 2})} onClick={onLastResultOpen} disabled={readonly}>
                {getEarlyInvalidationCacheMockText('last-result-btn-text')}
            </Button>
            <Text variant="body-1" color="secondary">
                {getEarlyInvalidationCacheMockText('last-result-text', {
                    date: lastResultDate.format('DD.MM.YYYY'),
                    time: lastResultDate.format('HH:mm'),
                })}
            </Text>
        </Row>
    );
};
