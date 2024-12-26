import React from 'react';

import {Box, Button, Flex, Loader} from '@gravity-ui/uikit';
import {useDispatch} from 'react-redux';
import {useHistory, useLocation} from 'react-router-dom';

import {RELOADED_URL_QUERY} from '../../../../../shared/components/auth/constants/url';
import {PlaceholderIllustration} from '../../../../components/PlaceholderIllustration/PlaceholderIllustration';
import {useEffectOnce} from '../../../../hooks/useEffectOnce';
import type {AppDispatch} from '../../../../store';
import {logout} from '../../store/actions/logout';

export const Logout = () => {
    const dispatch = useDispatch<AppDispatch>();
    const history = useHistory();
    const {search} = useLocation();

    const [view, setView] = React.useState<'loader' | 'error'>('loader');

    useEffectOnce(() => {
        const queryParams = new URLSearchParams(search);

        if (queryParams.has(RELOADED_URL_QUERY)) {
            queryParams.delete(RELOADED_URL_QUERY);
            history.replace({
                search: queryParams.toString(),
            });
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
                            <Button size="l" view="action" onClick={() => window.location.reload()}>
                                Reload
                            </Button>
                        </Box>
                    )}
                />
            )}
        </Flex>
    );
};
