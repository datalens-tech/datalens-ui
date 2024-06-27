/**
 * Checks Macintosh hardware is used.
 *
 * Note: there is no better way to get this information as using depricated property `navigator.platform`.
 *
 * More details [here](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/platform#examples).
 */
export const isMacintosh = () => {
    return typeof navigator === 'undefined' ? false : /Mac|iP(hone|[oa]d)/.test(navigator.platform);
};

/**
 * Returns expected key to use as modifier in current operating system.
 *
 * Note: ctrl for windows and meta for mac os
 */
export const getMetaKey = () => {
    return isMacintosh() ? 'meta' : 'ctrl';
};
