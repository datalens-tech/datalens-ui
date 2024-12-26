import React from 'react';

import {Box, Button, Flex} from '@gravity-ui/uikit';
import {useHistory, useLocation} from 'react-router-dom';

import {RELOADED_URL_QUERY} from '../../../../../shared/components/auth/constants/url';
import {PlaceholderIllustration} from '../../../../components/PlaceholderIllustration/PlaceholderIllustration';
import {useEffectOnce} from '../../../../hooks/useEffectOnce';

export const Logout = () => {
    const history = useHistory();
    const {search} = useLocation();

    useEffectOnce(() => {
        const queryParams = new URLSearchParams(search);

        if (queryParams.has(RELOADED_URL_QUERY)) {
            queryParams.delete(RELOADED_URL_QUERY);
            history.replace({
                search: queryParams.toString(),
            });
        }
    });

    return (
        <Flex justifyContent="center" alignItems="center" height="100%">
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
            {/* <Loader size="l" /> */}
        </Flex>
    );
};
