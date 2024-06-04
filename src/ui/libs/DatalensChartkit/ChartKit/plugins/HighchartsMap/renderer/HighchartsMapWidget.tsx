import React from 'react';

import type {ChartKitWidgetRef} from '@gravity-ui/chartkit';

import type {HighchartsMapWidgetProps} from '../types';

import {HighchartsMapComponent} from './HighchartsMapComponent';

const HighchartsMapWidget = React.forwardRef<
    ChartKitWidgetRef | undefined,
    HighchartsMapWidgetProps
>(
    // _ref needs to avoid this React warning:
    // "forwardRef render functions accept exactly two parameters: props and ref"
    function HighchartsMapWidgetInner(props, _ref) {
        return <HighchartsMapComponent {...props} />;
    },
);

export default HighchartsMapWidget;
