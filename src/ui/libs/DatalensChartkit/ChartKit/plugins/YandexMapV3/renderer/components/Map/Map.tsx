import {YMapLocationRequest, GenericGeometry, LngLat, DrawingStyle} from '@yandex/ymaps3-types';
import React from 'react';
import ReactDom from 'react-dom';

import {ClusterMarker} from '../ClusterMarker/ClusterMarker';

const [ymaps3React] = await Promise.all([ymaps3.import('@yandex/ymaps3-reactify'), ymaps3.ready]);

export const reactify = ymaps3React.reactify.bindTo(React, ReactDom);
export const {YMap, YMapFeatureDataSource, YMapLayer, YMapFeature, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker} = reactify.module(ymaps3);
const {YMapHint, YMapHintContext} = reactify.module(await ymaps3.import('@yandex/ymaps3-hint@0.0.1'));
// const {YMapDefaultMarker} = reactify.module(await ymaps3.import('@yandex/ymaps3-markers@0.0.1'));
const {YMapDefaultMarker} = reactify.module(await import('@yandex/ymaps3-default-ui-theme'));

const {clusterByGrid} = await ymaps3.import('@yandex/ymaps3-clusterer@0.0.1');
const {YMapClusterer} = reactify.module(
    await ymaps3.import('@yandex/ymaps3-clusterer@0.0.1')
);

import '@yandex/ymaps3-default-ui-theme/dist/esm/index.css';
import {Tooltip} from '../Tooltip/Tooltip';

export type Props = {
    location: YMapLocationRequest;
    features: {
        geometry: GenericGeometry<LngLat>;
        style?: DrawingStyle;
    }[];
    points: any[];
    clusteredPoints: any[];
};

const clusterSource = 'clusterer-source';

// Create a custom control component for a hint window
function HintWindow() {
  const hintContext = React.useContext(YMapHintContext) as {
      hint: {
        title: string;
      };
  };

  console.log(hintContext);

  // Use dangerouslySetInnerHTML because the hint message has <b> and <br> tags
  return (
      hintContext && (
        <Tooltip title={hintContext.hint.title} />
      )
  );
}

export const Map = (props: Props) => {
    const {location, features = [], points = [], clusteredPoints = []} = props;

    console.log('Map:', props);

    const clusterPoints: YMapClusterer[''] = React.useMemo(() => {
      return clusteredPoints.map((p, index) => ({
        id: index,
        geometry: {coordinates: p.coordinates},
        properties: p.properties
      }));
    }, [clusteredPoints]);
    const gridSizedMethod = clusterByGrid({gridSize: 64});

    const marker = React.useCallback(
        (feature) => (
          <YMapDefaultMarker key={feature.id} coordinates={feature.geometry.coordinates} source={clusterSource}>
            {/* <img src="./pin.svg" className="pin" /> */}
          </YMapDefaultMarker>
        ),
        []
      );

      const cluster = React.useCallback(
        (coordinates, features) => (
          <YMapMarker key={`${features[0].id}-${features.length}`} coordinates={coordinates} source={clusterSource}>
            <ClusterMarker count={features.length} />
          </YMapMarker>
        ),
        []
      );

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
            <YMapFeatureDataSource id={clusterSource} />
            <YMapLayer source={clusterSource} type="markers" />
            <YMapClusterer marker={marker} cluster={cluster} method={gridSizedMethod} features={clusterPoints} />
		</YMap>
    );
  };

export default Map;
