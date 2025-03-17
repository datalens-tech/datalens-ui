import React from 'react';

import debounce from 'lodash/debounce';
import {DEBOUNCE_RENDER_TIMEOUT} from 'ui/components/DashKit/constants';

export const useBeforeLoad = (onBeforeLoad: () => () => void) => {
    const onUpdate = React.useRef<() => void | null>();

    if (!onUpdate.current && onBeforeLoad) {
        onUpdate.current = debounce(onBeforeLoad(), DEBOUNCE_RENDER_TIMEOUT);
    }

    return onUpdate.current;
};
