import {EMBEDDED_MODE} from '../constants';

export const isIframe = () => {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
};

export const isEmbeddedMode = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isEmbeddedPreview = urlParams.get('_embedded') === '1';
    const isEmbedded = urlParams.get('mode') === EMBEDDED_MODE.EMBEDDED;
    return isIframe() || isEmbedded || isEmbeddedPreview;
};

export const isTvMode = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isTv = urlParams.get('mode') === EMBEDDED_MODE.TV;
    return isTv;
};
