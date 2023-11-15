import React from 'react';

import block from 'bem-cn-lite';
import LocationChange from 'components/LocationChange/LocationChange';
import {usePrevious} from 'hooks/usePrevious';
import throttle from 'lodash/throttle';
import {useDispatch, useSelector} from 'react-redux';
import {RouteComponentProps} from 'react-router-dom';
import ResizeObserver from 'resize-observer-polyfill';
import {Feature} from 'shared';
import {setCurrentPageEntry} from 'store/actions/asideHeader';
import {selectAsideHeaderData} from 'store/selectors/asideHeader';
import {URL_QUERY, Utils} from 'ui';
import {MobileHeader} from 'ui/components/MobileHeader/MobileHeader';

import {getIsAsideHeaderEnabled} from '../../../../components/AsideHeaderAdapter';
import {CurrentPageEntry} from '../../../../components/Navigation/types';
import {DL, EMBEDDED_DASH_MESSAGE_NAME} from '../../../../constants/common';
import {isEmbeddedMode, isIframe} from '../../../../utils/embedded';
import {dispatchResize, sendEmbedDashHeight} from '../../modules/helpers';
import PostMessage, {PostMessageCode} from '../../modules/postMessage';
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
    const [isObserverEnabled, setIsObserverEnabled] = React.useState<boolean>();
    const dispatch = useDispatch();

    const isIframeView = isIframe();
    const isEmbedded = isEmbeddedMode();

    const isAsideHeaderEnabled = getIsAsideHeaderEnabled();

    const prevAsideHeaderSize = usePrevious(asideHeaderData.size);

    const showAsideHeader = !isEmbedded && !isFullscreenMode && isAsideHeaderEnabled;

    React.useEffect(() => {
        Utils.addBodyClass('dl-dash');

        return () => {
            Utils.removeBodyClass('dl-dash');

            if (showAsideHeader) {
                dispatch(setCurrentPageEntry(null));
            }
        };
    }, [dispatch]);

    React.useEffect(() => {
        if (showAsideHeader) {
            dispatch(setCurrentPageEntry(entry as unknown as CurrentPageEntry));
        }
    }, [entry, showAsideHeader, dispatch]);

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

    React.useEffect(() => {
        if (!isIframeView || !wrapRef.current || !window.name) {
            return;
        }

        function handleMessageSend(event: MessageEvent) {
            if (event.data === EMBEDDED_DASH_MESSAGE_NAME) {
                setIsObserverEnabled(true);
            }
        }

        window.addEventListener('message', handleMessageSend);

        return () => {
            window.removeEventListener('message', handleMessageSend);
        };
    }, [isIframeView, wrapRef]);

    React.useEffect(() => {
        if (!isIframeView || !wrapRef.current || !isObserverEnabled) {
            return;
        }

        function handleResize() {
            sendEmbedDashHeight(wrapRef);
        }

        const throttledHandleResize = throttle(handleResize, 350);
        const resizeObserver = new ResizeObserver(throttledHandleResize);
        resizeObserver.observe(wrapRef.current);

        return () => {
            if (wrapRef.current) {
                resizeObserver.unobserve(wrapRef.current);
            }
        };
    }, [isIframeView, isObserverEnabled, wrapRef]);

    if (showAsideHeader && prevAsideHeaderSize !== asideHeaderData.size) {
        dispatchResize();
    }

    const isMobileEnabled = DL.IS_MOBILE && Utils.isEnabledFeature(Feature.EnableMobileHeader);
    const showHeader = !isFullscreenMode && !isAsideHeaderEnabled && !isEmbedded && isMobileEnabled;

    return (
        <div className={b({mobile: DL.IS_MOBILE})} ref={wrapRef}>
            <LocationChange onLocationChanged={locationChangeHandler} />
            {showHeader && <MobileHeader />}
            <div className={b('content')}>
                <DashWrapper {...routeProps} />
            </div>
        </div>
    );
}
