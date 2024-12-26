import {useDispatch} from 'react-redux';
import {useHistory, useLocation} from 'react-router-dom';

import {DL} from '../../../../constants/common';
import {useEffectOnce} from '../../../../hooks/useEffectOnce';
import {setAuthPageInited} from '../../store/actions/common';

export const useAuthPageInit = () => {
    const {pathname} = useLocation();
    const history = useHistory();
    const dispatch = useDispatch();

    useEffectOnce(() => {
        function pageInit() {
            let redirectPath = '';
            let rethPath: string | null = null;
            if (DL.IS_AUTH_PAGE) {
                if (!pathname.includes('/auth')) {
                    rethPath = window.location.toString();
                }
                const page = DL.AUTH_PAGE_SETTINGS?.page;
                switch (page) {
                    case 'reload': {
                        const path = '/auth/reload';
                        redirectPath = pathname === path ? '' : path;
                        break;
                    }
                    case 'signin': {
                        const path = '/auth/signin';
                        redirectPath = pathname === path ? '' : path;
                        break;
                    }
                    case 'logout': {
                        const path = '/auth/logout';
                        redirectPath = pathname === path ? '' : path;
                        break;
                    }
                }
            }

            if (redirectPath) {
                history.replace(redirectPath);
            }

            dispatch(setAuthPageInited({authPageInited: true, rethPath}));
        }
        pageInit();
    });
};
