import React from 'react';

import {Box, Button, Flex, Loader} from '@gravity-ui/uikit';
import {useDispatch} from 'react-redux';
import {RELOADED_URL_QUERY} from 'shared/components/auth/constants/url';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import {useEffectOnce} from 'ui/hooks/useEffectOnce';
import {useLocation, useRouter} from 'ui/navigation';
import type {AppDispatch} from 'ui/store';
import {logout} from 'ui/units/auth/store/actions/logout';

export const Logout = () => {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const location = useLocation();

    const [view, setView] = React.useState<'loader' | 'error'>('loader');

    useEffectOnce(() => {
        const search = location.params();
        if (search.has(RELOADED_URL_QUERY)) {
            search.delete(RELOADED_URL_QUERY);
            router.replace({search});
        }

        dispatch(logout()).then(({error}) => {
            if (error) {
                setView('error');
            }
        });
    });

    return (
        <Flex justifyContent="center" alignItems="center" height="100%">
            {view === 'loader' ? (
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
                            <Button size="l" view="action" onClick={() => router.reload()}>
                                Reload
                            </Button>
                        </Box>
                    )}
                />
            )}
        </Flex>
    );
};
