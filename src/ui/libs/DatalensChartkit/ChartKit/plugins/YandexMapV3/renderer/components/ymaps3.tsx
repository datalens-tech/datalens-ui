import React from 'react';

import ReactDom from 'react-dom';

const [ymaps3React] = await Promise.all([ymaps3.import('@yandex/ymaps3-reactify'), ymaps3.ready]);
const reactify = ymaps3React.reactify.bindTo(React, ReactDom);
export const {
    YMap,
    YMapFeatureDataSource,
    YMapLayer,
    YMapContainer,
    YMapFeature,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapMarker,
    YMapControls,
    YMapScaleControl,
} = reactify.module(ymaps3);
export const {YMapHint, YMapHintContext} = reactify.module(
    await ymaps3.import('@yandex/ymaps3-hint@0.0.1'),
);
export const {YMapDefaultMarker, YMapZoomControl} = reactify.module(
    await import('@yandex/ymaps3-default-ui-theme'),
);

const clustererModule = await ymaps3.import('@yandex/ymaps3-clusterer@0.0.1');
export const {clusterByGrid} = clustererModule;
export const {YMapClusterer} = reactify.module(clustererModule);

import '@yandex/ymaps3-default-ui-theme/dist/esm/index.css';
