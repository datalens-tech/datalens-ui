import React from 'react';

import type {ChartKitWidgetRef} from '@gravity-ui/chartkit';

import type {YandexMapWidgetProps} from '../types';

import {YandexMapComponent} from './YandexMapComponent';

const YandexMapWidget = React.forwardRef<ChartKitWidgetRef | undefined, YandexMapWidgetProps>(
    // _ref needs to avoid this React warning:
    // "forwardRef render functions accept exactly two parameters: props and ref"
    function YandexMapWidgetInner(props, _ref) {
        return <YandexMapComponent {...props} />;
    },
);

export default YandexMapWidget;
