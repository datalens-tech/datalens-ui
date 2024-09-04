import React from 'react';

import debounce from 'lodash/debounce';

const DEBOUNCE_RENDER_TIMEOUT = 200;
export const useBeforeLoad = (onBeforeLoad: () => () => void) => {
    const onUpdate = React.useRef<() => void | null>();

    if (!onUpdate.current && onBeforeLoad) {
        onUpdate.current = debounce(onBeforeLoad(), DEBOUNCE_RENDER_TIMEOUT);
    }

    return onUpdate.current;
};
