import React from 'react';

import block from 'bem-cn-lite';

import {GEO_OBJECT_TYPE} from '../../../../modules/yandex-map/yandex-map';

import Layer from './Layer/Layer';

import './Legend.scss';

const b = block('chartkit-ymap-legend');

interface LegendProps {
    map: unknown | null;
    geoObjects: any[];
    onSetVisibility: (geoObjectId: string, visibility: boolean) => void;
}

const Legend: React.FC<LegendProps> = ({geoObjects, onSetVisibility}) => {
    const filteredGeoObjects = geoObjects.filter((geoObject) => {
        return (
            [
                GEO_OBJECT_TYPE.POLYGONMAP,
                GEO_OBJECT_TYPE.GRIDMAP,
                GEO_OBJECT_TYPE.GEOCOLLECTION,
                GEO_OBJECT_TYPE.HEATMAP,
            ].includes(geoObject.options.get('geoObjectType')) &&
            geoObject.options.get('showCustomLegend')
        );
    });

    if (filteredGeoObjects.length === 0) {
        return null;
    }

    const singleLayerMode = filteredGeoObjects.length === 1;

    return (
        <div className={b()}>
            {filteredGeoObjects.map((geoObject, index) => (
                <Layer
                    geoObject={geoObject}
                    onSetVisibility={onSetVisibility}
                    key={index}
                    singleLayerMode={singleLayerMode}
                />
            ))}
        </div>
    );
};

export default Legend;
