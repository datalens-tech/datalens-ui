/* eslint complexity: 0 */

import React from 'react';

import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {formatNumber} from 'shared/modules/format-units/formatUnit';

import {i18n} from '../../../../../modules/i18n/i18n';
import {GEO_OBJECT_TYPE} from '../../../../../modules/yandex-map/yandex-map';
import EyeSlashIcon from '../Icons/EyeSlashIcon';
import SizeIcon from '../Icons/SizeIcon';

import './Layer.scss';

const b = block('chartkit-ymap-legend-layer');

interface LayerProps {
    geoObject: any;
    onSetVisibility: (geoObjectId: string, visibility: boolean) => void;
    singleLayerMode: boolean;
}

interface LayerState {
    layerVisibility: boolean;
    categoriesVisibility: boolean;
}

function wrappedFormatNumber(value: number) {
    return formatNumber(value, {precision: 'auto', unit: 'auto'});
}

class Layer extends React.PureComponent<LayerProps, LayerState> {
    state = {
        layerVisibility:
            typeof this.props.geoObject.options.get('visible') === 'boolean'
                ? this.props.geoObject.options.get('visible')
                : true,
        categoriesVisibility: false,
    };

    componentDidUpdate = (prevProps: LayerProps) => {
        if (prevProps !== this.props) {
            this.setState({
                layerVisibility:
                    typeof this.props.geoObject.options.get('visible') === 'boolean'
                        ? this.props.geoObject.options.get('visible')
                        : true,
                categoriesVisibility: false,
            });
        }
    };

    render() {
        const {geoObject, singleLayerMode} = this.props;

        const {layerVisibility, categoriesVisibility} = this.state;

        const layerTitle = geoObject.options.get('layerTitle');
        const geoObjectId = geoObject.options.get('geoObjectId');
        const geoObjectType = geoObject.options.get('geoObjectType');
        const mode = geoObject.options.get('mode');
        const sizeTitle = geoObject.options.get('sizeTitle');
        const sizeMinValue = geoObject.options.get('sizeMinValue');
        const sizeMaxValue = geoObject.options.get('sizeMaxValue');
        let colorTitle = geoObject.options.get('colorTitle');

        const gradient = geoObject.options.get('gradient');
        const isCustomPalette = geoObject.options.get('isCustomPalette');
        const gradientData: {
            colors: {
                red: number;
                green: number;
                blue: number;
            }[];
        } = geoObject.options.get('gradientData');

        const colorDictionary = geoObject.options.get('colorDictionary');

        let colorDictionaryKeys: string[] = [];
        let customColorDictionaryKeys: string[] = [];
        if (colorDictionary) {
            colorDictionaryKeys = Object.keys(colorDictionary);

            if (colorDictionaryKeys.length > 10) {
                customColorDictionaryKeys = colorDictionaryKeys.slice(0, 10);
            }
        }

        const colorMinValue = geoObject.options.get('colorMinValue');
        const colorMaxValue = geoObject.options.get('colorMaxValue');
        const colorMidValue = geoObject.options.get('colorMidValue');

        let previewStyle;

        if (mode === 'gradient') {
            previewStyle = {
                background: `linear-gradient(90deg, ${gradientData.colors
                    .map((stage) => `rgb(${Object.values(stage).join(',')})`)
                    .join(', ')})`,
            };
        } else if (geoObjectType === GEO_OBJECT_TYPE.HEATMAP) {
            previewStyle = {
                background: `linear-gradient(90deg, ${Object.keys(gradient)
                    .sort()
                    .map((stage) => gradient[stage])
                    .join(',')}`,
            };

            colorTitle = colorTitle || i18n('chartkit-ymap-legend', 'label-heatmap');
        }

        // When there is only one layer, and there is no legend that could be displayed -> do not show the legend at all
        if (singleLayerMode && !colorTitle && !sizeTitle) {
            return null;
        }

        return (
            <div className={b({hidden: !layerVisibility})} key={geoObjectId}>
                {/* When there is one layer, there is a legend -> the layer title does not need to be displayed, but the legend needs to be displayed */}
                {!singleLayerMode && (
                    <div className={b('header')}>
                        <span className={b('layer-title')} title={layerTitle}>
                            {layerTitle}
                        </span>
                        <Button
                            className={b('visibility-button')}
                            view="flat"
                            onClick={this.onClickShowToggle}
                        >
                            <Icon data={EyeSlashIcon} />
                        </Button>
                    </div>
                )}

                {colorTitle && (
                    <div className={b('color-title')} title={colorTitle}>
                        {colorTitle}
                    </div>
                )}

                {mode === 'gradient' && (
                    <React.Fragment>
                        <div className={b('color-preview')} style={previewStyle} />
                        <div className={b('preview-legend')}>
                            <span>{wrappedFormatNumber(colorMinValue)}</span>
                            {typeof colorMidValue === 'number' && (
                                <span>{wrappedFormatNumber(colorMidValue)}</span>
                            )}
                            <span>{wrappedFormatNumber(colorMaxValue)}</span>
                        </div>
                    </React.Fragment>
                )}

                {geoObjectType === GEO_OBJECT_TYPE.HEATMAP && (
                    <React.Fragment>
                        {/*
                            Because in common dark theme heatmap colors is inverted.
                            The heatmap modifier is needed to invert the colors of the legend using common
                        */}

                        <div
                            className={b('color-preview', {'default-heatmap': !isCustomPalette})}
                            style={previewStyle}
                        />
                        <div className={b('preview-legend')}>
                            <span>min</span>
                            <span>max</span>
                        </div>
                    </React.Fragment>
                )}

                {mode === 'dictionary' && colorDictionary && (
                    <div className={b('list')}>
                        {customColorDictionaryKeys.length > 0 && (
                            <React.Fragment>
                                {(categoriesVisibility
                                    ? colorDictionaryKeys
                                    : customColorDictionaryKeys
                                ).map((key) => (
                                    <div className={b('row')} key={key}>
                                        <span
                                            className={b('color')}
                                            style={{background: colorDictionary[key]}}
                                        />
                                        <span className={b('value')}>{key}</span>
                                    </div>
                                ))}
                                <div
                                    className={b('row', {action: true})}
                                    key="others"
                                    onClick={this.onClickCollapseToggle}
                                >
                                    <span className={b('value')}>
                                        {categoriesVisibility
                                            ? i18n('chartkit-ymap-legend', 'label-hide')
                                            : i18n('chartkit-ymap-legend', 'label-more', {
                                                  count: colorDictionaryKeys.length - 10,
                                              })}
                                    </span>
                                </div>
                            </React.Fragment>
                        )}
                        {customColorDictionaryKeys.length === 0 &&
                            colorDictionaryKeys &&
                            colorDictionaryKeys.map((key) => (
                                <div className={b('row')} key={key}>
                                    <span
                                        className={b('color')}
                                        style={{background: colorDictionary[key]}}
                                    />
                                    <span className={b('value')}>{key}</span>
                                </div>
                            ))}
                    </div>
                )}

                {typeof sizeTitle === 'string' && (
                    <React.Fragment>
                        <div className={b('size-title')} title={sizeTitle}>
                            {sizeTitle}
                        </div>
                        <div className={b('size-preview')}>
                            <SizeIcon />
                        </div>
                        <div className={b('preview-legend')}>
                            <span>{wrappedFormatNumber(sizeMinValue)}</span>
                            <span>{wrappedFormatNumber(sizeMaxValue)}</span>
                        </div>
                    </React.Fragment>
                )}
            </div>
        );
    }

    private onClickShowToggle = () => {
        const newVisibilityValue = !this.state.layerVisibility;

        this.setState({
            layerVisibility: newVisibilityValue,
        });

        this.props.onSetVisibility(
            this.props.geoObject.options.get('geoObjectId'),
            newVisibilityValue,
        );
    };

    private onClickCollapseToggle = () => {
        const newVisibilityValue = !this.state.categoriesVisibility;

        this.setState({
            categoriesVisibility: newVisibilityValue,
        });
    };
}

export default Layer;
