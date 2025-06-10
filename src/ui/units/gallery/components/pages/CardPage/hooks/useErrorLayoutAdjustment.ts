import React from 'react';

import {usePrevious} from 'ui/hooks';

import {block} from '../../../utils';

const b = block('card');
const pcLayoutClass = b('pc-layout-without-min-height');

export function useErrorLayoutAdjustment<T = unknown>(error: T) {
    const prevError = usePrevious(error);

    React.useEffect(() => {
        if (!prevError && !error) {
            return () => {};
        }

        const pcLayoutNode = document.querySelector('.pc-layout');

        if (error) {
            pcLayoutNode?.classList.add(pcLayoutClass);
        } else if (prevError && !error) {
            pcLayoutNode?.classList.remove(pcLayoutClass);
        }

        return () => {
            pcLayoutNode?.classList.remove(pcLayoutClass);
        };
    }, [error, prevError]);
}
