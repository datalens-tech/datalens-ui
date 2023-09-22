// the method from here - https://stackoverflow.com/a/9851769/5806646
// @ts-ignore
export const isSafari =
    // @ts-ignore
    /constructor/i.test(window.HTMLElement) ||
    (function (p) {
        return p.toString() === '[object SafariRemoteNotification]';
    })(
        // @ts-ignore
        !window['safari'] ||
            // @ts-ignore
            (typeof safari !== 'undefined' && safari.pushNotification), // eslint-disable-line no-undef
    );
