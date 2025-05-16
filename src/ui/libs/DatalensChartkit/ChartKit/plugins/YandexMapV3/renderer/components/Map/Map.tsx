import React from 'react';

import {useThemeType} from '@gravity-ui/uikit';
import get from 'lodash/get';

import type {YandexMapWidgetData} from '../../../types';
import {getMapConfig} from '../../utils';
import {YandexMapLayer} from '../Layer/Layer';
import {Tooltip} from '../Tooltip/Tooltip';
import {
    YMap,
    YMapControls,
    YMapDefaultFeaturesLayer,
    YMapDefaultSchemeLayer,
    YMapHint,
    YMapHintContext,
    YMapScaleControl,
    YMapZoomControl,
} from '../ymaps3';

export type Props = YandexMapWidgetData & {
    onReady?: () => void;
};

export const Map = (props: Props) => {
    const {onReady} = props;
    const mapConfig = getMapConfig(props);
    const {location} = mapConfig;
    const controls = new Set(mapConfig.controls ?? []);

    const theme = useThemeType();

    React.useEffect(() => {
        if (onReady) {
            setTimeout(onReady, 0);
        }
    }, [onReady]);

    const getHint = React.useCallback(
        (mapObject: unknown) => get(mapObject, 'properties.hint'),
        [],
    );

    return (
        <YMap location={location} copyrights={false} theme={theme}>
            <YMapDefaultSchemeLayer />
            <YMapDefaultFeaturesLayer />
            <YMapHint hint={getHint}>
                <Tooltip context={YMapHintContext} />
            </YMapHint>
            <YMapControls position="left">
                {controls.has('zoomControl') && <YMapZoomControl />}
            </YMapControls>
            <YMapControls position="bottom right">
                {controls.has('scaleControl') && <YMapScaleControl />}
            </YMapControls>
            {mapConfig.layers.map((layer, index) => (
                <YandexMapLayer key={`layer-${index}`} {...layer} />
            ))}
        </YMap>
    );
};

export default Map;
