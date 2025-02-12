import {YMapLocationRequest, GenericGeometry, LngLat, DrawingStyle} from '@yandex/ymaps3-types';
import React from 'react';
import ReactDom from 'react-dom';

const [ymaps3React] = await Promise.all([ymaps3.import('@yandex/ymaps3-reactify'), ymaps3.ready]);

export const reactify = ymaps3React.reactify.bindTo(React, ReactDom);
export const {YMap, YMapFeature, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer} = reactify.module(ymaps3);
// const {YMapHint, YMapHintContext} = reactify.module(await ymaps3.import('@yandex/ymaps3-hint@0.0.1'));
// const {YMapDefaultMarker} = reactify.module(await ymaps3.import('@yandex/ymaps3-markers@0.0.1'));
const {YMapDefaultMarker} = reactify.module(await import('@yandex/ymaps3-default-ui-theme'));

import '@yandex/ymaps3-default-ui-theme/dist/esm/index.css';

export type Props = {
    location: YMapLocationRequest;
    features: {
        geometry: GenericGeometry<LngLat>;
        style?: DrawingStyle;
    }[];
    points: any[];
};

export const Map = (props: Props) => {
    const {location, features, points = [{}]} = props;

    console.log('Map:', props);

    return (
        <YMap location={location} copyrights={false} >
			<YMapDefaultSchemeLayer />
			<YMapDefaultFeaturesLayer />
            {
                features.map((feature, index) => {
                    return (<YMapFeature key={index} geometry={feature.geometry} style={feature.style} />);
                })
            }
            {
                points.map((point, index) => {
                    return (
                        <YMapDefaultMarker staticHint={false} key={index} {...point} />
                    );
                })
            }
		</YMap>
    );
};

export default Map;
