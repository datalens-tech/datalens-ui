import {SCR_USER_AGENT_HEADER_VALUE} from 'shared';

export const dispatchDashLoadedEvent = (): void => {
    if (navigator.userAgent === SCR_USER_AGENT_HEADER_VALUE) {
        const customEvent = new CustomEvent('dash.done', {bubbles: true});
        document.body.dispatchEvent(customEvent);
    }
};
