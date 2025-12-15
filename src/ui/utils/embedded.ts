import {DL, EMBEDDED_MODE, URL_OPTIONS} from 'ui/constants';
import {getLocation} from 'ui/navigation';

export const isIframe = () => {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
};

export const isEmbeddedMode = () => {
    const params = getLocation().params();

    return (
        isIframe() ||
        params.get('mode') === EMBEDDED_MODE.EMBEDDED ||
        params.get(URL_OPTIONS.EMBEDDED) === '1'
    );
};

export const isTvMode = () => getLocation().params().get('mode') === EMBEDDED_MODE.TV;

export const isNoScrollMode = () => {
    return isEmbeddedMode() && getLocation().params().get(URL_OPTIONS.NO_SCROLL) === '1';
};

export const isEmbeddedEntry = () => Boolean(DL.EMBED);
