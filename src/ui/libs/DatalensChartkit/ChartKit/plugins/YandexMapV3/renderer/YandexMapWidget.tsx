import React from 'react';

import {CHARTKIT_ERROR_CODE, ChartKitError, ChartKitWidgetRef} from '@gravity-ui/chartkit';
import block from 'bem-cn-lite';
import type {PolygonGeometry, LngLat} from '@yandex/ymaps3-types';

import Performance from '../../../../modules/perfomance';
import {getRandomCKId} from '../../../helpers/getRandomCKId';
import type {YandexMapWidgetProps} from '../types';
import {isYmapsReady} from './yamap';
import {Loader} from '@gravity-ui/uikit';
import * as turf from "@turf/circle";

import './YandexMapWidget.scss';

const Map = React.lazy(() => import('./components/Map/Map'));

const b = block('chartkit-ymap-widget');

function reverseCoordinates(data: unknown): unknown {
    if (Array.isArray(data)) {
        if (Array.isArray(data[0])) {
            return data.map(reverseCoordinates);
        }

        return [...data].reverse();
    }

    return data as LngLat;
}

function getCircleGeoJSON(center: LngLat, radiusMeters: number): PolygonGeometry {
    const {geometry} = turf.circle(center as number[], radiusMeters, {units: 'meters'});
    return geometry as PolygonGeometry;
};

export const YandexMapWidget = React.forwardRef<ChartKitWidgetRef | undefined, YandexMapWidgetProps>(
    (props, forwardedRef) => {
    const {
        id,
        // onLoad,
        data: {data: originalData, config, libraryConfig},
        // _splitTooltip,
    } = props;

    console.log('YandexMapWidget:', {originalData, config, libraryConfig});

    const [isLoading, setLoading] = React.useState(true);

    const generatedId = React.useMemo(() => `${id}_${getRandomCKId()}`, [originalData, config, id]);
    Performance.mark(generatedId);

    React.useImperativeHandle(
        forwardedRef,
        () => ({
            reflow() {
                // debuncedHandleResize();
            },
        }),
        [],
    );

    React.useEffect(() => {
        isYmapsReady({
            apiKey: libraryConfig?.apiKey ?? ''
        }).then(() => {
            setLoading(false);
        })
    }, []);

    if (!originalData || (typeof originalData === 'object' && !Object.keys(originalData).length)) {
        throw new ChartKitError({
            code: CHARTKIT_ERROR_CODE.NO_DATA,
        });
    }

    const center = reverseCoordinates(libraryConfig?.state?.center);
    const features = React.useMemo(() => {
        return originalData.reduce((acc, item) => {
            switch (item.feature.geometry.type) {
                case 'Circle': {
                    const center = reverseCoordinates(item.feature.geometry.coordinates);
                    acc.push({
                        geometry: getCircleGeoJSON(center as LngLat, item.feature.geometry.radius),
                        style: {
                            simplificationRate: 0,
                            fill: item.options?.fillColor,
                            fillOpacity: item.options?.opacity,
                        },
                    });
                    break;
                }
                case 'Rectangle': {
                    const [[left, bottom], [right, top]] = item.feature.geometry.coordinates;
                    acc.push({
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[[bottom, left], [top, left], [top, right], [bottom, right]]],
                        },
                        style: {
                            simplificationRate: 0,
                            fill: item.options?.fillColor,
                            fillOpacity: item.options?.opacity,
                        },
                    });
                    break;
                }
                case 'LineString':
                case 'Polygon': {
                    acc.push({
                        geometry: {
                            ...item.feature.geometry,
                            coordinates: reverseCoordinates(item.feature.geometry.coordinates),
                        },
                        style: {
                            stroke: [{
                                width: item.options?.strokeWidth,
                            }],
                        },
                    });
                    break;
                }
                default: {
                    break;
                }
            }
            return acc;
        }, [] as any[]);
    }, [originalData]);

    const points = React.useMemo(() => {
        return originalData.reduce((acc, item) => {
            if (item.feature.geometry.type === 'Point') {
                acc.push({
                    coordinates: reverseCoordinates(item.feature.geometry.coordinates),
                });
            }
            return acc;
        }, [] as any[]);
    }, [originalData]);

    const mapProps: any = {
        location: {
            center,
            zoom: libraryConfig?.state?.zoom ?? 10,
        },
        features,
        points,
    };

    return (
        <div className={b()}>
            {isLoading ? <Loader /> : <Map {...mapProps} />}
        </div>
    );
});

export default YandexMapWidget;
