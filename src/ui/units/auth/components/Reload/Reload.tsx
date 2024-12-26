import React from 'react';

import {Flex, Loader} from '@gravity-ui/uikit';

import {RELOADED_URL_QUERY} from '../../../../../shared/components/auth/constants/url';
import {useEffectOnce} from '../../../../hooks/useEffectOnce';

const SET_COOKIE_ON_ANOTHER_BROWSER_TAB_WAIT_TIME = 1000;

export const Reload = () => {
    useEffectOnce(() => {
        const timerId = window.setTimeout(() => {
            const url = new URL(window.location.href);
            url.searchParams.delete(RELOADED_URL_QUERY);
            url.searchParams.set(RELOADED_URL_QUERY, 'true');
            window.location.href = url.toString();
        }, SET_COOKIE_ON_ANOTHER_BROWSER_TAB_WAIT_TIME);

        return () => {
            window.clearTimeout(timerId);
        };
    });

    return (
        <Flex justifyContent="center" alignItems="center" height="100%">
            <Loader size="l" />
        </Flex>
    );
};
