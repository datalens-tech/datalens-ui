import React from 'react';

import {Button, Icon, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {
    Placeholder,
    VisualizationLayerShared,
    VisualizationLayerType,
    VisualizationWithLayersShared,
} from 'shared';
import {isVisualizationWithLayers} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {registry} from 'ui/registry';
import {setSelectedLayerId} from 'units/wizard/actions';
import {updatePreviewAndClientChartsConfig} from 'units/wizard/actions/preview';
import {updateLayers} from 'units/wizard/actions/visualization';
import {VISUALIZATION_IDS} from 'units/wizard/constants';
import {getChangedPlaceholderSettings} from 'units/wizard/reducers/utils/getPlaceholdersWithMergedSettings';
import {selectHighchartsWidget} from 'units/wizard/selectors/preview';
import {selectSort, selectVisualization} from 'units/wizard/selectors/visualization';
import {createVisualizationLayer} from 'units/wizard/utils/wizard';

import type {LoadedWidget} from '../../../../../../libs/DatalensChartkit/types';
import logger from '../../../../../../libs/logger';
import GeolayersSelect from '../../../../components/GeolayersSelect/GeolayersSelect';

import {CombinedChartLayerTypeSwitcher} from './CombinedChartLayerTypeSwitcher';

import iconPlus from 'ui/assets/icons/plus.svg';

const {RangeInputPicker} = registry.common.components.getAll();

import './VisualizationLayersControl.scss';

const b = block('visualization-layers-control');

const MAX_LAYERS_COUNT = 5;

type StateProps = ReturnType<typeof mapStateToProps>;

type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface Props extends StateProps, DispatchProps {}

class VisualizationLayersControl extends React.Component<Props> {
    render() {
        const {visualization} = this.props;
        const selectedGeolayerId = this.getSelectedGeolayerId();
        const geolayers = this.getGeolayers();
        const isLayersOverflowing = geolayers.length >= MAX_LAYERS_COUNT;

        const geolayersNamesDict = geolayers.reduce((acc: Record<string, boolean>, item) => {
            acc[item.name] = true;
            return acc;
        }, {});

        const buttonPlus = (
            <Button
                className={b('button-plus')}
                qa="add-layer"
                view="outlined"
                size="m"
                disabled={isLayersOverflowing}
                onClick={() => {
                    const layerType =
                        visualization.id === 'combined-chart'
                            ? (VISUALIZATION_IDS.LINE as VisualizationLayerType)
                            : VISUALIZATION_IDS.GEOPOINT;
                    const layer = createVisualizationLayer(
                        layerType,
                        geolayersNamesDict,
                    ) as VisualizationLayerShared['visualization'];

                    if (visualization.id === 'combined-chart') {
                        let xPlaceholder: Placeholder | undefined;
                        let yPlaceholder: Placeholder | undefined;
                        let y2Placeholder: Placeholder | undefined;

                        this.props.visualization.layers.some((layer) => {
                            return layer.placeholders.some((placeholder) => {
                                if (placeholder.id === 'x' && placeholder.items.length > 0) {
                                    xPlaceholder = placeholder;
                                }

                                if (placeholder.id === 'y') {
                                    yPlaceholder = placeholder;
                                }

                                if (placeholder.id === 'y2') {
                                    y2Placeholder = placeholder;
                                }

                                return xPlaceholder && yPlaceholder && y2Placeholder;
                            });
                        });

                        [xPlaceholder, yPlaceholder, y2Placeholder]
                            .filter((placeholder): placeholder is Placeholder =>
                                Boolean(placeholder),
                            )
                            .forEach((placeholder: Placeholder) => {
                                const newPlaceholder = layer.placeholders.find(
                                    (item) => item.id === placeholder.id,
                                );

                                if (newPlaceholder) {
                                    if (newPlaceholder.id === 'x') {
                                        newPlaceholder.items = [...placeholder.items];
                                    }

                                    const changedSettingsKey = getChangedPlaceholderSettings({
                                        presetSettings: placeholder.settings || {},
                                        oldSettings: newPlaceholder.settings || {},
                                    });

                                    if (!changedSettingsKey.length) {
                                        return;
                                    }

                                    newPlaceholder.settings = changedSettingsKey.reduce(
                                        (acc, key) => {
                                            acc[key] = (
                                                placeholder as Record<string, any>
                                            ).settings[key];

                                            return acc;
                                        },
                                        {...newPlaceholder.settings},
                                    );
                                }
                            });
                    }

                    layer.commonPlaceholders = {
                        ...layer.commonPlaceholders,
                        sort: this.props.sort,
                    };

                    const layers = [...this.props.visualization.layers, layer];

                    this.props.updateLayers({layers});
                    this.props.setSelectedLayerId({
                        layerId: layer.layerSettings.id,
                        needUpdatePreview: false,
                    });
                }}
            >
                <Icon data={iconPlus} size={15} />
            </Button>
        );

        return (
            <div className={b()}>
                <div className={b('row')}>
                    <GeolayersSelect
                        visualizationId={visualization.id}
                        controlClassName={b('select')}
                        layers={geolayers}
                        selectedLayerId={selectedGeolayerId!}
                        onLayersChange={(newGeolayers) => {
                            const {visualization} = this.props;

                            const layers = newGeolayers.map((layerSettings) => {
                                const newLayer = visualization.layers.find(
                                    ({layerSettings: {id}}) => id === layerSettings.id,
                                )!;
                                newLayer.layerSettings = layerSettings;
                                return newLayer;
                            });
                            const selectedLayerIndex = newGeolayers.findIndex(
                                ({id}) => id === selectedGeolayerId,
                            );

                            let layerId;
                            let needUpdateCommonPlaceholders = false;

                            if (selectedLayerIndex === -1) {
                                // If you have deleted the selected layer
                                layerId = newGeolayers[0].id;
                                needUpdateCommonPlaceholders = true;
                            } else {
                                layerId = newGeolayers[selectedLayerIndex].id;
                            }

                            this.props.updateLayers({layers});
                            this.props.setSelectedLayerId({layerId, needUpdateCommonPlaceholders});
                        }}
                        onChange={(newLayerId) => {
                            this.props.setSelectedLayerId({
                                layerId: newLayerId,
                                withoutRerender: true,
                            });
                        }}
                    />
                    {isLayersOverflowing ? (
                        <Popover content={i18n('wizard', 'label_layers-overflow')}>
                            {buttonPlus}
                        </Popover>
                    ) : (
                        buttonPlus
                    )}
                </div>
                {this.renderLayerAlphaInput()}
                {this.renderCombinedChartLayerType()}
            </div>
        );
    }

    private renderLayerAlphaInput() {
        const {visualization} = this.props;
        const selectedGeolayerId = this.getSelectedGeolayerId();
        const geolayers = this.getGeolayers();

        if (visualization.id !== 'geolayer') {
            return null;
        }

        const layerAlpha = (geolayers.find(({id}) => id === selectedGeolayerId) || {}).alpha;

        return (
            <div className={b('row')}>
                <RangeInputPicker
                    className={b('range')}
                    size="m"
                    value={layerAlpha}
                    minValue={0}
                    maxValue={100}
                    onUpdate={(alpha) => {
                        const layers = [...this.props.visualization.layers];
                        const selectedLayerIndex = layers.findIndex(
                            ({layerSettings: {id}}) => id === selectedGeolayerId,
                        );

                        if (selectedLayerIndex === -1) {
                            return;
                        }

                        const layer = {...layers[selectedLayerIndex]};
                        layer.layerSettings.alpha = alpha;
                        layers[selectedLayerIndex] = layer;

                        // TODO: tear off the try/catch when the chartkit supports changes dangerous for chips points
                        try {
                            const widgetData = this.props.highchartsWidget as LoadedWidget & {
                                setOpacity: (args1: unknown, args2: unknown) => void;
                            };

                            widgetData?.setOpacity(selectedGeolayerId!, alpha / 100);
                        } catch (error) {
                            logger.logError(
                                'VisualizationLayersControl: highchartsWidget.setOpacity failed',
                                error,
                            );
                            console.error('highchartsWidget.setOpacity failed');
                        }

                        this.props.updateLayers({layers});
                        this.props.updatePreviewAndClientChartsConfig({withoutRerender: true});
                    }}
                />
            </div>
        );
    }

    private renderCombinedChartLayerType() {
        if (this.props.visualization.id !== 'combined-chart') {
            return null;
        }

        return (
            <div className={b('row')}>
                <CombinedChartLayerTypeSwitcher />
            </div>
        );
    }

    private getSelectedGeolayerId() {
        if (!this.props.visualization) {
            return null;
        }

        const {
            /* @ts-ignore */
            visualization: {selectedLayerId},
        } = this.props;
        const geolayers = this.getGeolayers();

        if (selectedLayerId) {
            return selectedLayerId;
        }

        if (geolayers.length) {
            return geolayers[0].id;
        }

        return null;
    }

    private getGeolayers() {
        const {visualization} = this.props;

        if (!visualization) {
            return [];
        }

        if (!isVisualizationWithLayers(visualization)) {
            return [];
        }

        return visualization.layers.map(({layerSettings}) => layerSettings);
    }
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        highchartsWidget: selectHighchartsWidget(state),
        visualization: selectVisualization(state) as VisualizationWithLayersShared['visualization'],
        sort: selectSort(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            updateLayers,
            updatePreviewAndClientChartsConfig,
            setSelectedLayerId,
        },
        dispatch,
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(VisualizationLayersControl);
