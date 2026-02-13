import React from 'react';

import {Alert, spacing} from '@gravity-ui/uikit';

import {getEarlyInvalidationCacheMockText} from '../../../helpers/mockTexts';

export const CacheWarning = () => {
    return (
        <Alert
            className={spacing({mt: 5})}
            theme="warning"
            title={getEarlyInvalidationCacheMockText('cache-check-not-work')}
            message={getEarlyInvalidationCacheMockText('cache-check-not-work-message')}
            layout="horizontal"
            actions={
                <Alert.Actions>
                    <Alert.Action>
                        {getEarlyInvalidationCacheMockText('cache-check-not-work-btn')}
                    </Alert.Action>
                </Alert.Actions>
            }
        />
    );
};
