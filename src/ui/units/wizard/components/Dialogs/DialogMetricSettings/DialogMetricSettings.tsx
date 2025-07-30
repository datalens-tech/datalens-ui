import React from 'react';

import {Dialog, SegmentedRadioGroup as RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {CommonSharedExtraSettings} from '../../../../../../shared';
import {DEFAULT_PALETTE, DialogMetricSettingsQa} from '../../../../../../shared';
import type {DatalensGlobalState} from '../../../../../../ui';
import DialogManager from '../../../../../components/DialogManager/DialogManager';
import {closeDialog} from '../../../../../store/actions/dialog';
import {selectColorPalettes} from '../../../../../store/selectors/colorPaletteEditor';
import {getPaletteColors, isValidHexColor} from '../../../../../utils';
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
        palette: string;
        color: string;
        size: string;
        colorIndex: number | null;
    }) => void;
};

interface Props extends StateProps, DispatchProps, OwnProps {}

interface State {
    size: string;
    color: string;
    colorIndex: number | null;
    palette: string;
    colorErrorText?: string;
    paletteColors: string[];
}

export const DIALOG_METRIC_SETTINGS = Symbol('DIALOG_METRIC_SETTINGS');

export type OpenDialogMetricSettingsArgs = {
    id: typeof DIALOG_METRIC_SETTINGS;
    props: OwnProps;
};

class DialogMetricSettings extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        const palette = props.palette || DEFAULT_PALETTE.id;
        const paletteColors = getPaletteColors(palette, props.colorPalettes);
        this.state = {
            size: props.fontSize || DEFAULT_SIZE,
            color: props.metricFontColorIndex
                ? paletteColors[props.metricFontColorIndex]
                : props.metricFontColor || paletteColors[0],
            palette,
            colorIndex: props.metricFontColorIndex || null,
            paletteColors,
        };
    }

    componentDidUpdate(_prevProps: Readonly<Props>, prevState: Readonly<State>) {
        const {color} = this.state;

        if (prevState.color !== color) {
            let colorErrorText = '';

            if (!isValidHexColor(color)) {
                colorErrorText = i18n('label_color-error');
            }

            this.setState({colorErrorText});
        }
    }

    render() {
        const hasErrors = Boolean(this.state.colorErrorText);

        return (
            <Dialog open={true} onClose={this.onClose} qa={DialogMetricSettingsQa.Dialog}>
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
                    palette={this.state.palette}
                    currentColor={this.state.color}
                    errorText={this.state.colorErrorText}
                    controlQa="dialog-metric-settings-palette"
                    onInputColorUpdate={this.handleInputColorUpdate}
                    colorPalettes={this.props.colorPalettes}
                    size="m"
                />
            </div>
        );
    }

    private handleInputColorUpdate = (color: string) => {
        const preparedColor = `#${color}`;
        const paletteColors = getPaletteColors(
            this.props.palette || DEFAULT_PALETTE.id,
            this.props.colorPalettes,
        );
        const colorIndex = paletteColors.includes(preparedColor)
            ? paletteColors.indexOf(preparedColor)
            : null;

        this.setState({color: preparedColor, colorIndex});
    };

    private handlePaletteUpdate = (paletteName: string) => {
        const {colorPalettes} = this.props;
        const updatedColors = getPaletteColors(paletteName, colorPalettes);
        const newColor = updatedColors[0];
        this.setState({palette: paletteName, color: newColor, paletteColors: updatedColors});
    };

    private onPaletteItemClick = (value: string[]) => {
        const colorIndex = this.state.paletteColors.indexOf(value[0]);
        this.setState({
            color: value[0],
            colorIndex,
        });
    };

    private onSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({size: event.target.value});
    };

    private onApply = () => {
        const {size, color, palette, colorIndex} = this.state;
        this.props.onSave({color, size, palette, colorIndex});
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
