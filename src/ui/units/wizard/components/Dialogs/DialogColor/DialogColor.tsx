import React from 'react';

import {BucketPaint} from '@gravity-ui/icons';
import {Button, Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DialogManager from 'components/DialogManager/DialogManager';
import {i18n} from 'i18n';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {ColorsConfig, Field} from 'shared';
import {ColorMode, getFieldUISettings, isMeasureValue} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {
    ALLOWED_FOR_NULL_MODE_VISUALIZATIONS,
    DEFAULT_PALETTE_STATE,
} from 'ui/units/wizard/constants/dialogColor';
import {setDialogColorPaletteState} from 'units/wizard/actions/dialogColor';
import {selectDataset, selectParameters} from 'units/wizard/selectors/dataset';
import {selectUpdates} from 'units/wizard/selectors/preview';
import {
    selectDashboardParameters,
    selectFilters,
    selectVisualization,
} from 'units/wizard/selectors/visualization';

import {
    isGradientDialog,
    selectDialogColorGradientState,
    selectDialogColorPaletteState,
} from '../../../selectors/dialogColor';

import ColorSettingsContainer from './ColorSettingsContainer/ColorSettingsContainer';

import './DialogColor.scss';

const b = block('dialog-color');

export const DIALOG_COLOR = Symbol('DIALOG_COLOR');

export interface ExtraSettings {
    polygonBorders?: boolean;
    numericDimensionByGradient?: boolean;
    extraDistinctsForDiscreteMode?: string[];
}

interface OwnProps {
    item: Field;
    items?: Field[];
    // this prop is used only when multiple colors supported in colors section; otherwise it will be undefined;
    colorSectionFields?: Field[] | undefined;
    onApply: (colorsConfig: ColorsConfig) => void;
    onCancel: () => void;
    colorsConfig: ColorsConfig;
    extra?: ExtraSettings;
    isColorModeChangeAvailable: boolean;
    canSetNullMode?: boolean;
}

type StateProps = ReturnType<typeof mapStateToProps>;

type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface Props extends OwnProps, StateProps, DispatchProps {}

export type OpenDialogColorArgs = {
    id: typeof DIALOG_COLOR;
    props: OwnProps;
};

interface State {
    colorMode: ColorMode;
}

class DialogColorComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        const colorMode = props.colorsConfig?.colorMode;

        if (colorMode && props.isColorModeChangeAvailable) {
            this.state = {
                colorMode,
            };
        } else {
            const isGradient = isGradientDialog({
                item: props.item,
                items: props.items,
                extra: props.extra,
            });

            this.state = {
                colorMode: isGradient ? ColorMode.GRADIENT : ColorMode.PALETTE,
            };
        }
    }

    render() {
        const {
            item,
            items,
            dataset,
            isColorModeChangeAvailable,
            colorSectionFields,
            visualization,
        } = this.props;
        const {validationStatus} = this.props.gradientState;
        const {colorMode} = this.state;

        if (!item || !dataset || !visualization) {
            return null;
        }

        const canSetNullMode =
            this.props.canSetNullMode &&
            (ALLOWED_FOR_NULL_MODE_VISUALIZATIONS as string[]).includes(visualization.id);

        const deafultPaletteState = this.getDefaultPaletteState();
        const hasPaletteColorSettings = !isEqual(
            deafultPaletteState,
            pick(this.props.paletteState, ...Object.keys(deafultPaletteState)),
        );

        return (
            <Dialog open={true} onClose={this.onClose}>
                <div className={b({[`${colorMode}-mode`]: true})}>
                    <Dialog.Header
                        insertBefore={
                            <div className={b('title-icon')}>
                                <Icon data={BucketPaint} size={18} />
                            </div>
                        }
                        caption={i18n('wizard', 'label_colors-settings')}
                    />
                    <Dialog.Body className={b('body')}>
                        <ColorSettingsContainer
                            colorsConfig={this.props.colorsConfig}
                            item={item}
                            items={items}
                            colorSectionFields={colorSectionFields}
                            extra={this.props.extra}
                            colorMode={this.state.colorMode}
                            isColorModeChangeAvailable={isColorModeChangeAvailable}
                            onColorModeChange={this.onColorModeChange}
                            canSetNullMode={canSetNullMode}
                        />
                    </Dialog.Body>
                    <Dialog.Footer
                        preset="default"
                        onClickButtonCancel={this.onCancelButtonClick}
                        onClickButtonApply={this.onApplyButtonClick}
                        textButtonApply={i18n('wizard', 'button_apply')}
                        textButtonCancel={i18n('wizard', 'button_cancel')}
                        propsButtonApply={{
                            disabled: Boolean(validationStatus),
                            qa: 'color-dialog-apply-button',
                        }}
                    >
                        {item.type !== 'MEASURE' && !isMeasureValue(item) && (
                            <Button
                                view="outlined"
                                size="l"
                                disabled={!hasPaletteColorSettings}
                                onClick={this.onResetButtonClick}
                            >
                                {i18n('wizard', 'button_reset')}
                            </Button>
                        )}
                    </Dialog.Footer>
                </div>
            </Dialog>
        );
    }

    onColorModeChange = (colorMode: ColorMode) => {
        this.setState({colorMode});
    };

    getDefaultPaletteState = () => {
        const {item: field} = this.props;
        const fieldUISettings = field ? getFieldUISettings({field}) : {};

        return {
            palette: fieldUISettings?.palette || DEFAULT_PALETTE_STATE.palette,
            mountedColors: fieldUISettings?.colors || DEFAULT_PALETTE_STATE.mountedColors,
        };
    };

    onResetButtonClick = () => {
        const defaultPaletteState = {
            ...this.props.paletteState,
            ...this.getDefaultPaletteState(),
        };

        this.props.actions.setDialogColorPaletteState(defaultPaletteState);
    };

    onCancelButtonClick = () => {
        this.onClose();
    };

    onApplyButtonClick = () => {
        this.props.onApply(this.getColorsConfig());
        this.onClose();
    };

    getColorsConfig = () => {
        const {item, items} = this.props;

        const {colorMode} = this.state;

        let config: ColorsConfig;

        if (colorMode === ColorMode.GRADIENT) {
            const {
                gradientMode,
                gradientPalette,
                polygonBorders,
                reversed,
                thresholdsMode,
                leftThreshold,
                middleThreshold,
                rightThreshold,
                nullMode,
            } = this.props.gradientState;

            config = {
                gradientMode,
                gradientPalette,
                polygonBorders,
                reversed,
                thresholdsMode,
                leftThreshold,
                middleThreshold,
                rightThreshold,
                colorMode,
                nullMode,
            };

            return config;
        } else {
            const {mountedColors, polygonBorders, palette} = this.props.paletteState;

            config = {
                polygonBorders,
                palette,
                mountedColors,
                fieldGuid: item.guid,
                coloredByMeasure: Boolean((items || []).length),
                colorMode,
            };
        }

        return config;
    };

    onClose = () => {
        this.props.onCancel();
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        parameters: selectParameters(state),
        updates: selectUpdates(state),
        filters: selectFilters(state),
        dashboardParameters: selectDashboardParameters(state),
        dataset: selectDataset(state),
        gradientState: selectDialogColorGradientState(state),
        paletteState: selectDialogColorPaletteState(state),
        visualization: selectVisualization(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        actions: bindActionCreators(
            {
                setDialogColorPaletteState,
            },
            dispatch,
        ),
    };
};

export const DialogColorContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(DialogColorComponent);

DialogManager.registerDialog(DIALOG_COLOR, DialogColorContainer);
