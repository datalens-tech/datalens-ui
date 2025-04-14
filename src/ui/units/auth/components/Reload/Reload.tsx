import React from 'react';

import {Box, Button, Flex, Loader} from '@gravity-ui/uikit';
import {useSelector} from 'react-redux';

import {RELOADED_URL_QUERY} from '../../../../../shared/components/auth/constants/url';
import {PlaceholderIllustration} from '../../../../components/PlaceholderIllustration/PlaceholderIllustration';
import {selectRethPath} from '../../store/selectors/common';

const SET_COOKIE_ON_ANOTHER_BROWSER_TAB_WAIT_TIME = 2000;

export const Reload = () => {
    const rethPath = useSelector(selectRethPath);

    const reloadValue = React.useMemo(() => {
        const url = new URL(rethPath || window.location.href);
        const currentReloadValue = Number(url.searchParams.get(RELOADED_URL_QUERY) || '0');
        return currentReloadValue;
    }, [rethPath]);

    const reloadPage = React.useCallback(() => {
        const baseUrl = rethPath || window.location.origin;
        const redirectUrl = new URL(baseUrl);
        redirectUrl.searchParams.delete(RELOADED_URL_QUERY);
        redirectUrl.searchParams.set(RELOADED_URL_QUERY, String(reloadValue + 1));
        window.location.href = redirectUrl.toString();
    }, [rethPath, reloadValue]);

    React.useEffect(() => {
        const timerId = window.setTimeout(() => {
            if (reloadValue === 0) {
                reloadPage();
            }
        }, SET_COOKIE_ON_ANOTHER_BROWSER_TAB_WAIT_TIME);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [reloadPage, reloadValue]);

    return (
        <Flex justifyContent="center" alignItems="center" height="100%">
            {reloadValue === 0 ? (
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
