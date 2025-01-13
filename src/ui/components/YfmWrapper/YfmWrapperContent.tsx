import React, {Suspense} from 'react';

import type {YfmWrapperProps} from './types';

import './YfmWrapperContent.scss';

const YfmWrapperComponent = React.lazy(() => import('./YfmWrapperComponent'));

export const YfmWrapperContent = React.forwardRef<HTMLDivElement, YfmWrapperProps>((props, ref) => {
    return (
        <Suspense fallback={null}>
            <YfmWrapperComponent {...props} ref={ref} />
        </Suspense>
    );
});

YfmWrapperContent.displayName = 'YfmWrapperContent';
