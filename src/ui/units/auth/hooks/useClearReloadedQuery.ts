import {useSelector} from 'react-redux';
import {useHistory, useLocation} from 'react-router-dom';

import {RELOADED_URL_QUERY} from '../../../../shared/components/auth/constants/url';
import {DL} from '../../../constants/common';
import {useEffectOnce} from '../../../hooks/useEffectOnce';
import {selectIsLanding} from '../../../store/selectors/landing';

export const useClearReloadedQuery = () => {
    const isLanding = useSelector(selectIsLanding);

    const {search} = useLocation();
    const history = useHistory();

    useEffectOnce(() => {
        function clearQuery() {
            const searchParams = new URLSearchParams(search);
            if (searchParams.has(RELOADED_URL_QUERY)) {
                searchParams.delete(RELOADED_URL_QUERY);
                // pathname: location.pathname
                history.replace({search: searchParams.toString()});
            }
        }

        if (DL.AUTH_ENABLED && !isLanding && !DL.IS_AUTH_PAGE) {
            clearQuery();
        }
    });
};
