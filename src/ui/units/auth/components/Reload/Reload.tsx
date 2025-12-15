import React from 'react';

import {Box, Button, Flex, Loader} from '@gravity-ui/uikit';
import {useSelector} from 'react-redux';
import {useLocation} from 'react-router-dom';
import {RELOADED_URL_QUERY} from 'shared/components/auth/constants/url';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import {useRouter} from 'ui/navigation';
import {selectRethPath} from 'ui/units/auth/store/selectors/common';

const SET_COOKIE_ON_ANOTHER_BROWSER_TAB_WAIT_TIME = 2000;

export const Reload = () => {
    const router = useRouter();
    const location = useLocation();
    const rethPath = useSelector(selectRethPath);
    const rethUrl = React.useMemo(() => (rethPath ? new URL(rethPath) : null), [rethPath]);

    const reloadValue = React.useMemo(() => {
        const url = rethUrl ?? router.createUrl(location);

        return Number(url.searchParams.get(RELOADED_URL_QUERY) || '0');
    }, [router, rethUrl, location]);

    const reloadPage = React.useCallback(() => {
        const redirectUrl = new URL(rethUrl ?? router.createUrl({pathname: '/'}));
        redirectUrl.searchParams.delete(RELOADED_URL_QUERY);
        redirectUrl.searchParams.set(RELOADED_URL_QUERY, String(reloadValue + 1));

        router.open(String(redirectUrl));
    }, [router, rethUrl, reloadValue]);

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
