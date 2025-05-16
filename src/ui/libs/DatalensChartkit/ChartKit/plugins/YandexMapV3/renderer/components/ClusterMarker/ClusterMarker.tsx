import React from 'react';

import type {LngLat} from '@yandex/ymaps3-types';
import block from 'bem-cn-lite';
import {groupBy} from 'lodash';

import type {ClusterFeature} from '../ymaps3';
import {YMapMarker} from '../ymaps3';

import './ClusterMarker.scss';

const b = block('ymap-cluster-marker');

type Props = {
    coordinates: LngLat;
    properties?: Record<string, unknown>;
    source: string;
    opacity?: number;
    radius?: number;
    points: ClusterFeature[];
};

export const ClusterMarker = (props: Props) => {
    const {coordinates, properties, source, opacity, radius = 2, points} = props;
    const {properties: {color, zIndex} = {}} = points[0];
    const size = radius * 20;

    const backgroundImage = React.useMemo(() => {
        const segments = Object.entries(groupBy(points, (p) => p.properties?.color)).map(
            ([pointColor, items]) => {
                return {
                    color: pointColor,
                    angle: (360 * items.length) / points.length,
                };
            },
        );

        return `conic-gradient(${segments
            .map((s, index) => {
                const startAngle = index === 0 ? 0 : segments[index - 1].angle;
                return `${s.color} ${startAngle}deg ${s.angle}deg`;
            })
            .join(', ')})`;
    }, [points]);

    return (
        <YMapMarker
            properties={properties}
            coordinates={coordinates}
            source={source}
            zIndex={Number(zIndex)}
        >
            <div
                className={b()}
                style={{
                    borderColor: color as string,
                    opacity,
                    height: `${size}px`,
                    width: `${size}px`,
                    backgroundImage,
                }}
            >
                <div className={b('content')}>
                    <span className={b('text')}>{points.length}</span>
                </div>
            </div>
        </YMapMarker>
    );
};
