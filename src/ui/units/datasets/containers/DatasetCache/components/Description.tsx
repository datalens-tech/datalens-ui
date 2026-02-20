import React from 'react';

import {Link, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {getEarlyInvalidationCacheMockText} from '../../../helpers/mockTexts';
import {BaseClass} from '../constants';

const b = block(BaseClass);

export const Description = () => {
    return (
        <div className={b('description')}>
            <Text variant="body-1">
                {getEarlyInvalidationCacheMockText('dataset-cache-tab-description')}
                {' '}
                <Link
                    // TODO doc link
                    href="/"
                    target="_blank"
                >
                    {getEarlyInvalidationCacheMockText('dataset-cache-tab-doc-link')}
                    {'.'}
                </Link>
            </Text>
            <Text variant="body-1">
                {getEarlyInvalidationCacheMockText('dataset-cache-tab-description-ps')}
                {'.'}
            </Text>
        </div>
    );
};
