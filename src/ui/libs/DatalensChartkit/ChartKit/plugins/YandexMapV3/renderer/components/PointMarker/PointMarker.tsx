import React from 'react';

import block from 'bem-cn-lite';

import type {YMapPoint} from '../../types';
import {YMapMarker} from '../ymaps3';

import './PointMarker.scss';

const b = block('ymap-point-marker');

type Props = YMapPoint & {
    color?: string;
    opacity?: number;
    radius?: number;
};

export const PointMarker = (props: Props) => {
    const {coordinates, properties, zIndex, color, opacity, radius = 2} = props;
    const size = radius * 10;

    return (
        <YMapMarker coordinates={coordinates} properties={properties} zIndex={zIndex}>
            <div
                style={{backgroundColor: color, opacity, height: `${size}px`, width: `${size}px`}}
                className={b()}
            ></div>
        </YMapMarker>
    );
};
