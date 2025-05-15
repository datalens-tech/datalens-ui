import React from 'react';

import {useThemeType} from '@gravity-ui/uikit';
import type {Feature as ClusterFeature} from '@yandex/ymaps3-types/packages/clusterer';
import get from 'lodash/get';

import type {YandexMapWidgetData} from '../../../types';
import {getMapConfig} from '../../utils';
import {ClusterMarker} from '../ClusterMarker/ClusterMarker';
import {YandexMapLayer} from '../Layer/Layer';
import {Tooltip} from '../Tooltip/Tooltip';
import {
    YMap,
    YMapClusterer,
    YMapControls,
    YMapDefaultFeaturesLayer,
    YMapDefaultMarker,
    YMapDefaultSchemeLayer,
    YMapFeature,
    YMapFeatureDataSource,
    YMapHint,
    YMapHintContext,
    YMapLayer,
    YMapMarker,
    YMapScaleControl,
    YMapZoomControl,
    clusterByGrid,
} from '../ymaps3';

export type Props = YandexMapWidgetData & {
    onReady?: () => void;
};

const clusterSource = 'clusterer-source';

export const Map = (props: Props) => {
    const {onReady} = props;
    const mapConfig = getMapConfig(props);
    const {
        location,
        layers: [{features = [], clusteredPoints = []}],
    } = mapConfig;
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

    const clusterPoints = React.useMemo(() => {
        return clusteredPoints.map(
            (p, index) =>
                ({
                    id: String(index),
                    geometry: {coordinates: p.coordinates},
                    properties: p.properties,
                }) as ClusterFeature,
        );
    }, [clusteredPoints]);
    const gridSizedMethod = clusterByGrid({gridSize: 64});

    const marker = React.useCallback(
        (feature) => (
            <YMapDefaultMarker
                key={feature.id}
                coordinates={feature.geometry.coordinates}
                source={clusterSource}
            />
        ),
        [],
    );

    const cluster = React.useCallback(
        (coordinates, features) => (
            <YMapMarker
                key={`${features[0].id}-${features.length}`}
                coordinates={coordinates}
                source={clusterSource}
            >
                <ClusterMarker count={features.length} />
            </YMapMarker>
        ),
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
            {features.map((feature, index) => {
                return (
                    <YMapFeature
                        key={index}
                        geometry={feature.geometry}
                        style={feature.style}
                        properties={feature.properties}
                    />
                );
            })}
            {mapConfig.layers.map((layer, index) => (
                <YandexMapLayer key={`layer-${index}`} {...layer} />
            ))}
            <YMapFeatureDataSource id={clusterSource} />
            <YMapLayer source={clusterSource} type="markers" />
            <YMapClusterer
                marker={marker}
                cluster={cluster}
                method={gridSizedMethod}
                features={clusterPoints}
            />
        </YMap>
    );
};

export default Map;
