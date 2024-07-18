import React from 'react';

import block from 'bem-cn-lite';
import LocationChange from 'components/LocationChange/LocationChange';
import {usePrevious} from 'hooks/usePrevious';
import {useDispatch, useSelector} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {setCurrentPageEntry} from 'store/actions/asideHeader';
import {selectAsideHeaderData} from 'store/selectors/asideHeader';
import {useMountedState} from 'ui/hooks/useMountedState';
import {registry} from 'ui/registry';
import Utils from 'ui/utils/utils';

import {Feature} from '../../../../../shared/types/feature';
import {getIsAsideHeaderEnabled} from '../../../../components/AsideHeaderAdapter';
import type {CurrentPageEntry} from '../../../../components/Navigation/types';
import {DL, URL_QUERY} from '../../../../constants/common';
import {isEmbeddedMode} from '../../../../utils/embedded';
import {useIframeFeatures} from '../../hooks/useIframeFeatures';
import {dispatchResize} from '../../modules/helpers';
import {PostMessage, PostMessageCode} from '../../modules/postMessage';
import {setTabHashState} from '../../store/actions/dashTyped';
import {
    selectDashEntry,
    selectEntryId,
    selectIsFullscreenMode,
    selectStateHashId,
    selectTabs,
} from '../../store/selectors/dashTypedSelectors';
import {DashWrapper} from '../Dash/Dash';

import './App.scss';

const b = block('app');

export function App({...routeProps}: RouteComponentProps) {
    const asideHeaderData = useSelector(selectAsideHeaderData);
    const entryId = useSelector(selectEntryId);
    const tabs = useSelector(selectTabs);
    const entry = useSelector(selectDashEntry);
    const stateHashId = useSelector(selectStateHashId);
    const isFullscreenMode = useSelector(selectIsFullscreenMode);

    const wrapRef = React.useRef<HTMLDivElement>(null);

    const isMounted = useMountedState([]);
    useIframeFeatures({wrapRef});

    const dispatch = useDispatch();

    const isEmbedded = isEmbeddedMode();

    const isAsideHeaderEnabled = getIsAsideHeaderEnabled();

    const prevAsideHeaderSize = usePrevious(asideHeaderData.size);

    const showAsideHeader = !isEmbedded && !isFullscreenMode && isAsideHeaderEnabled;
    const showMobileHeader = !isFullscreenMode && DL.IS_MOBILE;

    React.useEffect(() => {
        if (!isMounted && (showAsideHeader || showMobileHeader)) {
            dispatch(setCurrentPageEntry(null));
        }
    }, [dispatch, isMounted, showAsideHeader, showMobileHeader]);

    React.useEffect(() => {
        if (showAsideHeader || showMobileHeader) {
            dispatch(setCurrentPageEntry(entry as unknown as CurrentPageEntry));
        }
    }, [entry, showAsideHeader, dispatch, showMobileHeader]);

    const locationChangeHandler = React.useCallback(
        async (data) => {
            const {pathname, search} = data;
            PostMessage.send({code: PostMessageCode.UrlChanged, data: {pathname, search}});

            const searchParams = new URLSearchParams(search);
            const newTabId = searchParams.get(URL_QUERY.TAB_ID) || (tabs && tabs[0].id) || '';
            const newStateHashId = searchParams.get('state') || '';

            // update hashStates only when state is not equal (i.e. switched back or between tabs
            if (newStateHashId === stateHashId) {
                return;
            }

            dispatch(setTabHashState({tabId: newTabId, stateHashId: newStateHashId, entryId}));
        },
        [entryId, tabs, stateHashId, dispatch],
    );

    if (showAsideHeader && prevAsideHeaderSize !== asideHeaderData.size) {
        dispatchResize();
    }

    const {Footer} = registry.common.components.getAll();
    const showFooter = Utils.isEnabledFeature(Feature.EnableFooter) && !isEmbedded;

    return (
        <div className={b({mobile: DL.IS_MOBILE, embedded: isEmbedded})} ref={wrapRef}>
            <LocationChange onLocationChanged={locationChangeHandler} />
            <div className={b('content')}>
                <DashWrapper {...routeProps} />
            </div>
            {showFooter && <Footer />}
        </div>
    );
}
