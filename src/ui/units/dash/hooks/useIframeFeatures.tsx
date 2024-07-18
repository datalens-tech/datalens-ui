import React from 'react';

import block from 'bem-cn-lite';
import throttle from 'lodash/throttle';
import {EMBEDDED_DASH_MESSAGE_NAME} from 'ui/constants';
import {isIframe, isNoScrollMode} from 'ui/utils/embedded';
import Utils from 'ui/utils/utils';

import {sendEmbedDashHeight} from '../modules/helpers';

const dashBlock = block('dl-dash');

export type PageTitleExtraSettings = {
    subtitle?: string | null;
};

export const useIframeFeatures = ({
    wrapRef,
    skipNoScroll,
}: {
    wrapRef: React.RefObject<HTMLDivElement>;
    skipNoScroll?: boolean;
}) => {
    const [isObserverEnabled, setIsObserverEnabled] = React.useState<boolean>();

    const isIframeView = isIframe();

    React.useEffect(() => {
        if (skipNoScroll || !isIframeView) {
            return;
        }

        const dashClasses = dashBlock({'no-scroll': isNoScrollMode()}).split(' ');

        Utils.addBodyClass(...dashClasses);

        return () => {
            Utils.removeBodyClass(...dashClasses);
        };
    }, [skipNoScroll, isIframeView]);

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
            resizeObserver.disconnect();
        };
    }, [isIframeView, isObserverEnabled, wrapRef]);
};
