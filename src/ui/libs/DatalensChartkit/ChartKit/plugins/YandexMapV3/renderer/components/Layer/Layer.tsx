import React from 'react';

import type {YMapLayerConfig} from '../../types';
import {PointMarker} from '../PointMarker/PointMarker';

type Props = YMapLayerConfig & {};

export const YandexMapLayer = (props: Props) => {
    const {points, opacity} = props;

    return (
        <React.Fragment>
            {points.map((point, index) => {
                return <PointMarker key={`point-${index}`} {...point} opacity={opacity} />;
            })}
        </React.Fragment>
    );
};
