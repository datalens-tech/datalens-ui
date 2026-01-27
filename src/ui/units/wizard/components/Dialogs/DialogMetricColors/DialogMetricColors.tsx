import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {ColorPalette, CommonSharedExtraSettings} from 'shared';
import {getColorByColorSettings} from 'shared/utils/palettes';
import type {DatalensGlobalState} from 'ui';
import {selectColorPalettes} from 'ui/store/selectors/colorPaletteEditor';
import {getPaletteColors} from 'ui/utils';

import DialogManager from '../../../../../components/DialogManager/DialogManager';
import {closeDialog} from '../../../../../store/actions/dialog';
import {selectExtraSettings} from '../../../selectors/widget';
import {MinifiedPalette} from '../../MinifiedPalette/MinifiedPalette';

import './DialogMetricColors.scss';

const i18n = I18n.keyset('wizard');

const b = block('dialog-metric-colors');

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type OwnProps = {
    onApply: (args: {palette: string | undefined; color: string; colorIndex?: number}) => void;
};

interface Props extends StateProps, DispatchProps, OwnProps {}

interface State {
    currentColorHex: string;
    colorIndex?: number;
    palette: string | undefined;
    paletteColors: string[];
    hasErrors: boolean;
}

export const DIALOG_METRIC_COLORS = Symbol('DIALOG_METRIC_COLORS');

export type OpenDialogMetricColorsArgs = {
    id: typeof DIALOG_METRIC_COLORS;
    props: OwnProps;
};

class DialogMetricColors extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        const palette = props.metricFontColorPalette;
        const paletteColors = getPaletteColors(palette, props.colorPalettes);

        // if font settings is empty take index 0 by default
        const defaultIndex = props.metricFontColor ? undefined : 0;

        this.state = {
            currentColorHex: getColorByColorSettings({
                currentColors: paletteColors,
                colorIndex: props.metricFontColorIndex,
                color: props.metricFontColor,
            }),
            palette,
            colorIndex: props.metricFontColorIndex ?? defaultIndex,
            paletteColors,
            hasErrors: false,
        };
    }

    render() {
        const {hasErrors} = this.state;

        return (
            <Dialog
                open={true}
                onClose={this.onClose}
                qa="dialog-metric-colors"
                disableHeightTransition={true}
            >
                <Dialog.Header caption={i18n('label_color-settings')} />
                <Dialog.Body className={b()}>
                    <div className={b('row')}>
                        <div className={b('title')}>{i18n('section_color')}</div>
                        <div className={b('palette')}>{this.renderPalette()}</div>
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonApply={this.onApply}
                    textButtonApply={i18n('button_apply')}
                    propsButtonApply={{disabled: hasErrors}}
                    // propsButtonApply={{qa: 'dialog-metric-colors-apply', disabled: hasErrors}}
                    onClickButtonCancel={this.onCancel}
                    textButtonCancel={i18n('button_cancel')}
                    // propsButtonCancel={{qa: 'dialog-metric-colors-cancel'}}
                />
            </Dialog>
        );
    }

    private renderPalette() {
        return (
            <MinifiedPalette
                onPaletteUpdate={this.handlePaletteUpdate}
                onPaletteItemClick={this.onPaletteItemClick}
                palette={this.state.palette ?? ''}
                currentColorHex={this.state.currentColorHex}
                controlQa="dialog-metric-colors-palette"
                onInputColorUpdate={this.handleInputColorUpdate}
                colorPalettes={this.props.colorPalettes}
                customColorSelected={typeof this.state.colorIndex !== 'number'}
                onValidChange={this.handlePaletteValidChange}
            />
        );
    }

    private handleInputColorUpdate = (colorHex: string) => {
        this.setState({currentColorHex: colorHex, colorIndex: undefined});
    };

    private handlePaletteUpdate = (paletteName: string | undefined) => {
        const {colorPalettes} = this.props;
        const updatedColors = getPaletteColors(paletteName, colorPalettes);
        const newColor = updatedColors[0];
        this.setState({
            palette: paletteName,
            currentColorHex: newColor,
            colorIndex: 0,
            paletteColors: updatedColors,
        });
    };

    private handlePaletteValidChange = (valid: boolean): void => {
        this.setState({hasErrors: !valid});
    };

    private onPaletteItemClick = (value: string) => {
        const colorIndex = this.state.paletteColors.indexOf(value);
        this.setState({
            currentColorHex: value,
            colorIndex,
        });
    };

    private onApply = () => {
        const {currentColorHex, palette, colorIndex} = this.state;
        this.props.onApply({color: currentColorHex, palette, colorIndex});
        this.props.closeDialog();
    };

    private onCancel = () => {
        this.props.closeDialog();
    };

    private onClose = () => {
        this.props.closeDialog();
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    const extraSettings = selectExtraSettings(state) as CommonSharedExtraSettings;

    return {
        metricFontColor: extraSettings.metricFontColor,
        metricFontColorIndex: extraSettings.metricFontColorIndex,
        metricFontColorPalette: extraSettings.metricFontColorPalette,
        colorPalettes: selectColorPalettes(state) as ColorPalette[],
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            closeDialog,
        },
        dispatch,
    );
};

DialogManager.registerDialog(
    DIALOG_METRIC_COLORS,
    connect(mapStateToProps, mapDispatchToProps)(DialogMetricColors),
);
