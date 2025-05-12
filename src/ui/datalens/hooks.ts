import React from 'react';
import {DATALENS_IFRAME_CLASSNAME} from 'ui/constants';
import {isIframe} from 'ui/utils/embedded';

export const useIframeRender = () => {
    const isIframeRendered = isIframe();

    React.useEffect(() => {
        if (isIframeRendered) {
            document.body.classList?.add(DATALENS_IFRAME_CLASSNAME);
        } else {
            document.body.classList?.remove(DATALENS_IFRAME_CLASSNAME);
        }
    }, [isIframeRendered]);
};
