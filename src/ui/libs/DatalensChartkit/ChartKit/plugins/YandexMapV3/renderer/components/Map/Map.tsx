import React from 'react';

import {useThemeType} from '@gravity-ui/uikit';
import type {Feature as ClusterFeature} from '@yandex/ymaps3-types/packages/clusterer';
import get from 'lodash/get';
import ReactDom from 'react-dom';

import type {YandexMapWidgetData} from '../../../types';
import {getMapConfig} from '../../utils';
import {ClusterMarker} from '../ClusterMarker/ClusterMarker';
import {Tooltip} from '../Tooltip/Tooltip';

const [ymaps3React] = await Promise.all([ymaps3.import('@yandex/ymaps3-reactify'), ymaps3.ready]);

export const reactify = ymaps3React.reactify.bindTo(React, ReactDom);
export const {
    YMap,
    YMapFeatureDataSource,
    YMapLayer,
    YMapFeature,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapMarker,
    YMapControls,
    YMapScaleControl,
} = reactify.module(ymaps3);
const {YMapHint, YMapHintContext} = reactify.module(
    await ymaps3.import('@yandex/ymaps3-hint@0.0.1'),
);
const {YMapDefaultMarker, YMapZoomControl} = reactify.module(
    await import('@yandex/ymaps3-default-ui-theme'),
);

const clustererModule = await ymaps3.import('@yandex/ymaps3-clusterer@0.0.1');
const {clusterByGrid} = clustererModule;
const {YMapClusterer} = reactify.module(clustererModule);

import '@yandex/ymaps3-default-ui-theme/dist/esm/index.css';

export type Props = YandexMapWidgetData & {
    onReady?: () => void;
};

const clusterSource = 'clusterer-source';

export const Map = (props: Props) => {
    const {onReady} = props;
    const mapConfig = getMapConfig(props);
    const {location, features = [], points = [], clusteredPoints = []} = mapConfig;

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

    const controls = new Set(mapConfig.controls ?? []);

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
            {points.map((point, index) => {
                return (
                    <YMapDefaultMarker
                        staticHint={false}
                        key={index}
                        coordinates={point.coordinates}
                        properties={point.properties}
                        color={point.color}
                        zIndex={point.zIndex}
                    />
                );
            })}
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
