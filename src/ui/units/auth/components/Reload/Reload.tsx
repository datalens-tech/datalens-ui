import React from 'react';

import {Box, Button, Flex, Loader} from '@gravity-ui/uikit';
import {useSelector} from 'react-redux';

import {RELOADED_URL_QUERY} from '../../../../../shared/components/auth/constants/url';
import {PlaceholderIllustration} from '../../../../components/PlaceholderIllustration/PlaceholderIllustration';
import {AUTH_ROUTE} from '../../constants/routes';
import {selectRethPath} from '../../store/selectors/common';

const SET_COOKIE_ON_ANOTHER_BROWSER_TAB_WAIT_TIME = 2000;

export const Reload = () => {
    const rethPath = useSelector(selectRethPath);
    const autoReload = !rethPath?.includes(AUTH_ROUTE.RELOAD);

    const reloadPage = React.useCallback(() => {
        const baseUrl = autoReload ? rethPath || window.location.origin : window.location.origin;
        const redirectUrl = new URL(baseUrl);
        redirectUrl.searchParams.delete(RELOADED_URL_QUERY);
        redirectUrl.searchParams.set(RELOADED_URL_QUERY, 'true');
        window.location.href = redirectUrl.toString();
    }, [rethPath, autoReload]);

    React.useEffect(() => {
        const timerId = window.setTimeout(() => {
            if (autoReload) {
                reloadPage();
            }
        }, SET_COOKIE_ON_ANOTHER_BROWSER_TAB_WAIT_TIME);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [reloadPage, autoReload]);

    return (
        <Flex justifyContent="center" alignItems="center" height="100%">
            {autoReload ? (
                <Loader size="l" />
            ) : (
                <PlaceholderIllustration
                    name="error"
                    title="Something went wrong"
                    description="Try to reload the page"
                    direction="column"
                    size="l"
                    renderAction={() => (
                        <Box spacing={{mt: 4}}>
                            <Button size="l" view="action" onClick={reloadPage}>
                                Reload
                            </Button>
                        </Box>
                    )}
                />
            )}
        </Flex>
    );
};
