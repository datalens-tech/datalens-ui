import React from 'react';
import ReactDom from 'react-dom';

const [ymaps3React] = await Promise.all([ymaps3.import('@yandex/ymaps3-reactify'), ymaps3.ready]);

export const reactify = ymaps3React.reactify.bindTo(React, ReactDom);
export const {YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer} = reactify.module(ymaps3);

type Props = {};

export const Map = (_props: Props) => {
    const location = {
        center: [25.229762, 55.289311],
        zoom: 10
    };

    return (
        <YMap location={location} copyrights={false}>
			<YMapDefaultSchemeLayer />
			<YMapDefaultFeaturesLayer />
		</YMap>
    );
};

export default Map;
