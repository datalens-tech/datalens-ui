import React from 'react';

import type {YMapLayerConfig} from '../../types';
import {ClusterMarker} from '../ClusterMarker/ClusterMarker';
import {PointMarker} from '../PointMarker/PointMarker';
import {YMapClusterer, YMapFeatureDataSource, YMapLayer, clusterByGrid} from '../ymaps3';

type Props = YMapLayerConfig & {};

export const YandexMapLayer = (props: Props) => {
    const {id: layerId, points, opacity, clusteredPoints} = props;
    const clusterSource = `${layerId}_clusterer-source`;
    const gridSizedMethod = clusterByGrid({gridSize: 64});

    const marker = React.useCallback(
        (feature) => {
            return (
                <PointMarker
                    coordinates={feature.geometry.coordinates}
                    source={clusterSource}
                    properties={feature.properties}
                    color={feature.properties.color}
                    zIndex={feature.properties.zIndex}
                    radius={feature.properties.radius}
                    opacity={opacity}
                />
            );
        },
        [clusterSource, opacity],
    );

    const cluster = React.useCallback(
        (coordinates, features) => {
            const {id: pointId} = features[0];
            return (
                <ClusterMarker
                    key={`${pointId}-${features.length}`}
                    coordinates={coordinates}
                    source={clusterSource}
                    points={features}
                />
            );
        },
        [clusterSource],
    );

    return (
        <React.Fragment>
            {points.map((point, index) => {
                return <PointMarker key={`point-${index}`} {...point} opacity={opacity} />;
            })}
            <YMapFeatureDataSource id={clusterSource} />
            <YMapLayer source={clusterSource} type="markers" />
            <YMapClusterer
                marker={marker}
                cluster={cluster}
                method={gridSizedMethod}
                features={clusteredPoints}
            />
        </React.Fragment>
    );
};
