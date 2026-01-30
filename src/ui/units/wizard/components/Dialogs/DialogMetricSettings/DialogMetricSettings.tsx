import React from 'react';

import {Dialog, SegmentedRadioGroup as RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import {getColorByColorSettings} from 'shared/utils/palettes';

import type {CommonSharedExtraSettings} from '../../../../../../shared';
import {DialogMetricSettingsQa} from '../../../../../../shared';
import type {DatalensGlobalState} from '../../../../../../ui';
import DialogManager from '../../../../../components/DialogManager/DialogManager';
import {closeDialog} from '../../../../../store/actions/dialog';
import {selectColorPalettes} from '../../../../../store/selectors/colorPaletteEditor';
import {getPaletteColors} from '../../../../../utils';
import {selectExtraSettings} from '../../../selectors/widget';
import {MinifiedPalette} from '../../MinifiedPalette/MinifiedPalette';

import './DialogMetricSettings.scss';

const i18n = I18n.keyset('container.metric-dialog');

const SIZES = ['s', 'm', 'l', 'xl'];
const DEFAULT_SIZE = 'm';
const RADIO_TEXT = ['XS', 'S', 'M', 'L'];

const b = block('dialog-metric-settings');

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type OwnProps = {
    onSave: (args: {
        palette: string | undefined;
        color: string;
        size: string;
        colorIndex?: number;
    }) => void;
};

interface Props extends StateProps, DispatchProps, OwnProps {}

interface State {
    size: string;
    currentColorHex: string;
    colorIndex?: number;
    palette: string | undefined;
    paletteColors: string[];
    hasErrors: boolean;
}

export const DIALOG_METRIC_SETTINGS = Symbol('DIALOG_METRIC_SETTINGS');

export type OpenDialogMetricSettingsArgs = {
    id: typeof DIALOG_METRIC_SETTINGS;
    props: OwnProps;
};

class DialogMetricSettings extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        const palette = props.palette;
        const paletteColors = getPaletteColors(palette, props.colorPalettes);

        // if font settings is empty take index 0 by default
        const defaultIndex = props.metricFontColor ? undefined : 0;

        this.state = {
            size: props.fontSize || DEFAULT_SIZE,
            // initial state
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
                qa={DialogMetricSettingsQa.Dialog}
                disableHeightTransition={true}
            >
                <Dialog.Header caption={i18n('label_settings')} />
                <Dialog.Body className={b()}>
                    <div className={b('row')} data-qa="metric-settings-dialog-size">
                        <div className={b('title')}>{i18n('label_font-size')}</div>
                        {this.renderSizeSwitcher()}
                    </div>
                    <div className={b('row')} data-qa="metric-settings-dialog-color">
                        <div className={b('title')}>{i18n('label_font-color')}</div>
                        {this.renderPalette()}
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonApply={this.onApply}
                    textButtonApply={i18n('button_apply')}
                    propsButtonApply={{qa: 'metric-settings-dialog-apply', disabled: hasErrors}}
                    onClickButtonCancel={this.onCancel}
                    textButtonCancel={i18n('button_cancel')}
                    propsButtonCancel={{qa: 'metric-settings-dialog-cancel'}}
                />
            </Dialog>
        );
    }

    private renderSizeSwitcher() {
        const {size} = this.state;

        const children = SIZES.map((item, index) => (
            <RadioButton.Option key={item} value={item}>
                {RADIO_TEXT[index]}
            </RadioButton.Option>
        ));

        return (
            <RadioButton value={size} onChange={this.onSizeChange}>
                {children}
            </RadioButton>
        );
    }

    private renderPalette() {
        return (
            <div className={b('palette')}>
                <MinifiedPalette
                    onPaletteUpdate={this.handlePaletteUpdate}
                    onPaletteItemClick={this.onPaletteItemClick}
                    palette={this.state.palette ?? ''}
                    currentColorHex={this.state.currentColorHex}
                    controlQa="dialog-metric-settings-palette"
                    onInputColorUpdate={this.handleInputColorUpdate}
                    colorPalettes={this.props.colorPalettes}
                    customColorSelected={typeof this.state.colorIndex !== 'number'}
                    customColorBtnQa={DialogMetricSettingsQa.CustomColorButton}
                    onValidChange={this.handlePalleteValidChange}
                />
            </div>
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

    private handlePalleteValidChange = (valid: boolean): void => {
        this.setState({hasErrors: !valid});
    };

    private onPaletteItemClick = (value: string) => {
        const colorIndex = this.state.paletteColors.indexOf(value);
        this.setState({
            currentColorHex: value,
            colorIndex,
        });
    };

    private onSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({size: event.target.value});
    };

    private onApply = () => {
        const {size, currentColorHex, palette, colorIndex} = this.state;
        this.props.onSave({color: currentColorHex, size, palette, colorIndex});
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
        fontSize: extraSettings.metricFontSize,
        metricFontColor: extraSettings.metricFontColor,
        metricFontColorIndex: extraSettings.metricFontColorIndex,
        palette: extraSettings.metricFontColorPalette,
        colorPalettes: selectColorPalettes(state),
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
    DIALOG_METRIC_SETTINGS,
    connect(mapStateToProps, mapDispatchToProps)(DialogMetricSettings),
);
