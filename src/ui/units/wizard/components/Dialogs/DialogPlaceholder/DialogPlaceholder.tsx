import {AREA_OR_AREA100P} from 'constants/misc';

import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {
    Dialog,
    Icon,
    Popover,
    PopoverInstanceProps,
    RadioButtonOption,
    TextInput,
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DialogManager from 'components/DialogManager/DialogManager';
import {i18n} from 'i18n';
import {
    DialogPlaceholderQa,
    Feature,
    Field,
    Placeholder,
    PlaceholderId,
    PlaceholderSettings,
    ServerPlaceholderSettings,
    WizardVisualizationId,
    getAxisMode,
    isContinuousAxisModeDisabled,
    isFieldHierarchy,
    isNumberField,
    isPercentVisualization,
} from 'shared';
import {Utils, withHiddenUnmount} from 'ui';

import {SETTINGS} from '../../../constants';
import {DialogRadioButtons} from '../components/DialogRadioButtons/DialogRadioButtons';

import {DialogPlaceholderRow} from './components/DialogPlaceholderRow/DialogPlaceholderRow';
import {
    AXIS_FORMAT_MODE_RADIO_BUTTON_OPTIONS,
    AXIS_MODE_RADIO_BUTTONS,
    AXIS_TITLE_RADIO_BUTTON_OPTIONS,
    AXIS_TYPE_RADIO_BUTTON_OPTIONS,
    DEFAULT_NULLS_OPTIONS_RADIO_BUTTON_OPTIONS,
    GRID_RADIO_BUTTON_OPTIONS,
    GRID_STEP_RADIO_BUTTON_OPTIONS,
    HIDE_LABELS_RADIO_BUTTON_OPTIONS,
    HOLIDAYS_RADIO_BUTTON_OPTIONS,
    LABELS_VIEW_RADIO_BUTTON_OPTIONS,
    POLYLINE_POINTS_RADIO_BUTTON_OPTIONS,
    SCALE_RADIO_BUTTON_OPTIONS,
    SCALE_VALUE_RADIO_BUTTON_OPTIONS,
} from './constants/radio-buttons';
import {
    getAxisModeTooltipContent,
    isAxisFormatEnabled,
    isAxisLabelsRotationEnabled,
    isAxisScaleEnabled,
    isAxisTypeEnabled,
    isHolidaysEnabled,
} from './utils';

import './DialogPlaceholder.scss';

const b = block('dialog-placeholder');

export const DIALOG_PLACEHOLDER = Symbol('DIALOG_PLACEHOLDER');

interface Props {
    item: Placeholder;
    visible: boolean;
    onCancel: () => void;
    visualizationId: WizardVisualizationId;
    segments: Field[];
    onApply: (placeholderSettings: PlaceholderSettings) => void;
    sort: Field[];
    drillDownLevel: number;
}

interface State {
    firstField: Field | undefined;
    settings: PlaceholderSettings;
    tooltipContent: React.ReactNode;
    tooltipType: 'type' | 'scaleValue' | undefined;
}

export type OpenDialogPlaceholderArgs = {
    id: typeof DIALOG_PLACEHOLDER;
    props: Props;
};

const Y_OR_Y2_PLACEHOLDER = new Set([PlaceholderId.Y2, PlaceholderId.Y]);

const PLACEHOLDER_DIALOG_DEFAULT_ICON_SIZE = 18;

class DialogPlaceholder extends React.PureComponent<Props, State> {
    tooltipRef = React.createRef<PopoverInstanceProps>();
    tooltipScaleValueAnchorRef = React.createRef<any>();
    tooltipAxisTypeAnchorRef = React.createRef<any>();

    constructor(props: Props) {
        super(props);

        const placeholder = props.item || {};
        const placeholderItems = props.item.items || [];
        const firstField = isFieldHierarchy(placeholderItems[0])
            ? placeholderItems[0].fields[props.drillDownLevel]
            : placeholderItems[0];

        const settings: PlaceholderSettings = {...placeholder.settings};

        const isAxisWithPercent = isPercentVisualization(props.visualizationId);

        const isFirstFieldIsNumeric = isNumberField(placeholderItems[0]);

        if (
            (isAxisWithPercent || !isFirstFieldIsNumeric) &&
            typeof settings.axisFormatMode !== 'undefined'
        ) {
            settings.axisFormatMode = 'auto';
        }
        const axisModeMap = settings.axisModeMap;
        const isAxisModeDiscrete =
            axisModeMap &&
            firstField &&
            axisModeMap[firstField.guid] === SETTINGS.AXIS_MODE.DISCRETE;

        if (
            (isAxisModeDiscrete || !firstField) &&
            settings.gridStep === SETTINGS.GRID_STEP.MANUAL
        ) {
            settings.gridStep = SETTINGS.GRID_STEP.AUTO;
            settings.gridStepValue = undefined;
        }

        this.state = {
            settings,
            tooltipContent: '',
            tooltipType: undefined,
            firstField,
        };
    }

    render() {
        const {item} = this.props;

        return (
            <Dialog qa="dialog-placeholder" open={this.props.visible} onClose={this.props.onCancel}>
                <div className={b()}>
                    {item && (
                        <Dialog.Header
                            insertBefore={
                                <div className={b('title-icon')}>
                                    <Icon
                                        {...item.iconProps}
                                        size={PLACEHOLDER_DIALOG_DEFAULT_ICON_SIZE}
                                    />
                                </div>
                            }
                            caption={i18n('wizard', item.title)}
                        />
                    )}
                    <Dialog.Body>{this.renderModalBody()}</Dialog.Body>
                    <Dialog.Footer
                        preset="default"
                        onClickButtonCancel={() => {
                            this.props.onCancel();
                        }}
                        onClickButtonApply={() => {
                            this.props.onApply(this.state.settings);
                        }}
                        textButtonApply={i18n('wizard', 'button_apply')}
                        textButtonCancel={i18n('wizard', 'button_cancel')}
                    />
                </div>
            </Dialog>
        );
    }

    renderNullsRadioButtons() {
        const {visualizationId, item} = this.props;
        const {settings} = this.state;
        const nulls = item.settings?.nulls;

        if (typeof nulls === 'undefined' || typeof settings.nulls === 'undefined') {
            return null;
        }

        const isAreaChart = AREA_OR_AREA100P.has(visualizationId);
        const shouldHideConnectOption = isAreaChart && nulls !== SETTINGS.NULLS.CONNECT;

        const nullsOptions: RadioButtonOption[] = [...DEFAULT_NULLS_OPTIONS_RADIO_BUTTON_OPTIONS];
        if (!shouldHideConnectOption) {
            const connectOption: RadioButtonOption = {
                value: SETTINGS.NULLS.CONNECT,
                content: i18n('wizard', 'label_connect'),
            };
            nullsOptions.splice(1, 0, connectOption);
        }
        return (
            <DialogPlaceholderRow
                settingCustomWidth="400px"
                title={i18n('wizard', 'label_nulls')}
                setting={
                    <DialogRadioButtons
                        stretched={true}
                        qa="connect-nulls-radio-buttons"
                        items={nullsOptions}
                        value={settings.nulls}
                        onUpdate={this.handleNullsRadioButtonUpdate}
                    />
                }
            />
        );
    }

    renderHolidaysRadioButtons() {
        const {item, visualizationId} = this.props;
        const {settings, firstField} = this.state;
        const holidays = item.settings?.holidays;

        if (
            !Utils.isEnabledFeature(Feature.HolidaysOnChart) ||
            typeof holidays === 'undefined' ||
            typeof settings.holidays === 'undefined' ||
            !isHolidaysEnabled(visualizationId)
        ) {
            return null;
        }

        const xAxisMode = getAxisMode(settings as ServerPlaceholderSettings, firstField?.guid);
        const canSetHolidays = xAxisMode !== SETTINGS.AXIS_MODE.DISCRETE;
        const selectedValue = canSetHolidays ? settings.holidays : SETTINGS.HOLIDAYS.OFF;

        return (
            <DialogPlaceholderRow
                title={i18n('wizard', 'label_holidays')}
                setting={
                    <DialogRadioButtons
                        qa="holidays-radio-buttons"
                        items={HOLIDAYS_RADIO_BUTTON_OPTIONS}
                        value={selectedValue}
                        onUpdate={this.handleHolidaysRadioButtonUpdate}
                        disabled={!canSetHolidays}
                    />
                }
            />
        );
    }

    renderAxisTitleSettings() {
        const {segments, item} = this.props;
        const {title, titleValue} = this.state.settings;

        const placeholderId = item.id as PlaceholderId;

        const shouldDisabledManualButton = Boolean(
            Y_OR_Y2_PLACEHOLDER.has(placeholderId) && segments.length,
        );

        if (typeof title === 'undefined') {
            return null;
        }

        const radioButtonOptions = AXIS_TITLE_RADIO_BUTTON_OPTIONS.map((option) => {
            if (option.value === SETTINGS.TITLE.MANUAL) {
                option.disabled = shouldDisabledManualButton;
            }
            return option;
        });

        return (
            <DialogPlaceholderRow
                title={i18n('wizard', 'label_axis-title')}
                setting={
                    <div className={b('title-setting-container')}>
                        <div className={b('title-radio-buttons')}>
                            <DialogRadioButtons
                                stretched={true}
                                qa="title-radio-buttons"
                                items={radioButtonOptions}
                                value={title}
                                onUpdate={this.handleAxisTitleModeUpdate}
                            />
                        </div>
                        {shouldDisabledManualButton && (
                            <HelpPopover
                                className={b('title-popover')}
                                content={i18n('wizard', 'label_axis-title-manual-warning')}
                            />
                        )}
                        {title === SETTINGS.TITLE.MANUAL && (
                            <TextInput
                                className={b('title-input')}
                                type="text"
                                pin="round-round"
                                hasClear
                                qa="dialog-placeholder-title-value"
                                placeholder={i18n('wizard', 'label_axis-title')}
                                size="m"
                                value={titleValue}
                                onUpdate={this.handleAxisTitleValueUpdate}
                            />
                        )}
                    </div>
                }
            />
        );
    }

    renderAxisTypeSettings() {
        const {visualizationId} = this.props;
        const {type} = this.state.settings;

        if (typeof type === 'undefined' || !isAxisTypeEnabled(visualizationId)) {
            return null;
        }

        return (
            <DialogPlaceholderRow
                settingCustomWidth="265px"
                title={i18n('wizard', 'label_axis-type')}
                setting={
                    <DialogRadioButtons
                        stretched={true}
                        ref={this.tooltipAxisTypeAnchorRef}
                        qa="axis-type-radio-buttons"
                        items={AXIS_TYPE_RADIO_BUTTON_OPTIONS}
                        value={type}
                        onUpdate={this.handleAxisTypeUpdate}
                    />
                }
            />
        );
    }

    renderAxisFormatSettings() {
        const {axisFormatMode} = this.state.settings;
        const {visualizationId, item} = this.props;

        if (typeof axisFormatMode === 'undefined' || !isAxisFormatEnabled(visualizationId)) {
            return null;
        }

        const isAxisWithPercent = isPercentVisualization(visualizationId);
        const placeholderItems = item.items || [];

        const isFirstFieldIsNumeric = isNumberField(placeholderItems[0]);
        const section = `section_${item.id}`;

        const radioOptions = AXIS_FORMAT_MODE_RADIO_BUTTON_OPTIONS.map((option) => {
            if (option.value === SETTINGS.AXIS_FORMAT_MODE.BY_FIELD) {
                return {
                    ...option,
                    content: i18n(
                        'wizard',
                        visualizationId === 'combined-chart'
                            ? 'label_combined-chart-axis-format-by-field'
                            : 'label_axis-format-by-field',
                        {axisName: i18n('wizard', section)},
                    ),
                    disabled: isAxisWithPercent || !isFirstFieldIsNumeric,
                };
            }
            return option;
        });

        return (
            <DialogPlaceholderRow
                title={i18n('wizard', 'label_axis-format-settings')}
                setting={
                    <DialogRadioButtons
                        items={radioOptions}
                        value={axisFormatMode}
                        onUpdate={this.handleAxisFormatModeRadioButtonUpdate}
                    />
                }
            />
        );
    }

    renderAxisModeSettings() {
        const {sort, visualizationId} = this.props;
        const {settings, firstField} = this.state;
        const {axisModeMap} = settings;

        if (typeof axisModeMap === 'undefined' || !firstField) {
            return null;
        }
        const axisMode = axisModeMap[firstField.guid];
        let disabledTooltipContent = null;

        const radioButtons = AXIS_MODE_RADIO_BUTTONS.map((option) => {
            if (option.value === SETTINGS.AXIS_MODE.CONTINUOUS) {
                const reasonForDisabling = isContinuousAxisModeDisabled({
                    // Axis mode always depends on first item in placeholder
                    field: firstField,
                    axisSettings: settings,
                    visualizationId,
                    sort,
                });

                if (reasonForDisabling) {
                    disabledTooltipContent = getAxisModeTooltipContent(reasonForDisabling);

                    return {
                        ...option,
                        disabled: true,
                    };
                }
            }

            return option;
        });

        return (
            <React.Fragment>
                <DialogPlaceholderRow
                    title={i18n('wizard', 'label_axis-mode')}
                    setting={
                        <React.Fragment>
                            <DialogRadioButtons
                                items={radioButtons}
                                value={axisMode}
                                onUpdate={this.handleAxisModeUpdate}
                                qa={'axis-mode-radio-buttons'}
                            />
                            {disabledTooltipContent && (
                                <HelpPopover
                                    className={b('title-popover')}
                                    content={i18n('wizard', disabledTooltipContent)}
                                />
                            )}
                        </React.Fragment>
                    }
                />
            </React.Fragment>
        );
    }

    renderGridSettings() {
        const {grid} = this.state.settings;

        if (typeof grid === 'undefined') {
            return null;
        }

        return (
            <DialogPlaceholderRow
                title={i18n('wizard', 'label_grid')}
                setting={
                    <DialogRadioButtons
                        items={GRID_RADIO_BUTTON_OPTIONS}
                        value={grid}
                        onUpdate={this.handleGridRadioButtonUpdate}
                        qa="grid-radio-buttons"
                    />
                }
            />
        );
    }

    renderGridStepSettings() {
        const {settings, firstField} = this.state;
        const {gridStep, grid, gridStepValue, axisModeMap} = settings;

        if (typeof gridStep === 'undefined') {
            return null;
        }

        const axisMode =
            firstField && axisModeMap ? axisModeMap[firstField.guid] : SETTINGS.AXIS_MODE.DISCRETE;

        const disabled = grid === SETTINGS.GRID.OFF;
        const items = GRID_STEP_RADIO_BUTTON_OPTIONS.map((option) => {
            if (option.value === SETTINGS.GRID_STEP.MANUAL) {
                return {
                    ...option,
                    disabled: axisMode === SETTINGS.AXIS_MODE.DISCRETE,
                };
            }

            return option;
        });

        return (
            <React.Fragment>
                <DialogPlaceholderRow
                    settingCustomWidth="155px"
                    title={<span>{i18n('wizard', 'label_grid-step')}, px</span>}
                    setting={
                        <DialogRadioButtons
                            stretched={true}
                            items={items}
                            value={gridStep}
                            onUpdate={this.handleGridStepRadioButtonUpdate}
                            disabled={disabled}
                        />
                    }
                />
                {gridStep === SETTINGS.GRID_STEP.MANUAL && (
                    <DialogPlaceholderRow
                        title={''}
                        setting={
                            <TextInput
                                className={b('grid-step-input')}
                                type="number"
                                pin="round-round"
                                size="m"
                                value={String(gridStepValue)}
                                disabled={grid === SETTINGS.GRID.OFF}
                                onUpdate={this.handleGridStepValueUpdate}
                            />
                        }
                    />
                )}
            </React.Fragment>
        );
    }

    renderHideLabelsSettings() {
        const {hideLabels} = this.state.settings;

        if (typeof hideLabels === 'undefined') {
            return null;
        }
        return (
            <DialogPlaceholderRow
                title={i18n('wizard', 'label_axis-hide-labels')}
                setting={
                    <DialogRadioButtons
                        items={HIDE_LABELS_RADIO_BUTTON_OPTIONS}
                        value={hideLabels}
                        onUpdate={this.handleHideLabelsRadioButtonsUpdate}
                    />
                }
            />
        );
    }

    renderLabelsViewSettings() {
        const {visualizationId} = this.props;
        const {labelsView, hideLabels} = this.state.settings;

        if (typeof labelsView === 'undefined' || !isAxisLabelsRotationEnabled(visualizationId)) {
            return null;
        }

        return (
            <DialogPlaceholderRow
                settingCustomWidth="500px"
                title={i18n('wizard', 'label_labels-view')}
                setting={
                    <DialogRadioButtons
                        stretched={true}
                        items={LABELS_VIEW_RADIO_BUTTON_OPTIONS}
                        value={labelsView}
                        onUpdate={this.handleLabelsViewRadioButtonUpdate}
                        disabled={hideLabels === SETTINGS.HIDE_LABELS.YES}
                    />
                }
            />
        );
    }

    renderScaleSettings() {
        const {visualizationId} = this.props;
        const {scale, scaleValue} = this.state.settings;

        if (typeof scale === 'undefined' || !isAxisScaleEnabled(visualizationId)) {
            return null;
        }

        return (
            <React.Fragment>
                <DialogPlaceholderRow
                    title={i18n('wizard', 'label_scale')}
                    settingCustomWidth="155px"
                    setting={
                        <DialogRadioButtons
                            stretched={true}
                            items={SCALE_RADIO_BUTTON_OPTIONS}
                            value={scale}
                            onUpdate={this.handleScaleRadioButtonsUpdate}
                        />
                    }
                />
                {scale === SETTINGS.SCALE.AUTO && typeof scaleValue === 'string' && (
                    <DialogPlaceholderRow
                        title={''}
                        setting={
                            <DialogRadioButtons
                                qa="autoscale-radio-buttons"
                                items={SCALE_VALUE_RADIO_BUTTON_OPTIONS}
                                value={scaleValue}
                                onUpdate={this.handleScaleValueUpdate}
                                ref={this.tooltipScaleValueAnchorRef}
                            />
                        }
                    />
                )}
                {scale === SETTINGS.SCALE.MANUAL && (
                    <DialogPlaceholderRow
                        title={''}
                        setting={
                            <React.Fragment>
                                <DialogPlaceholderRow
                                    titleCustomWidth="60px"
                                    customGapBetweenTitleAndSetting="5px"
                                    rowCustomMarginBottom="10px"
                                    title={i18n('wizard', 'label_min')}
                                    setting={
                                        <TextInput
                                            className={b('min-input')}
                                            type="number"
                                            pin="round-round"
                                            size="m"
                                            value={(scaleValue as [string, string])[0]}
                                            onUpdate={(value) => {
                                                this.handleManualScaleValueUpdate(value, 'min');
                                            }}
                                        />
                                    }
                                />
                                <DialogPlaceholderRow
                                    titleCustomWidth="60px"
                                    customGapBetweenTitleAndSetting="5px"
                                    rowCustomMarginBottom="0px"
                                    title={i18n('wizard', 'label_max')}
                                    setting={
                                        <TextInput
                                            className={b('max-input')}
                                            type="number"
                                            pin="round-round"
                                            size="m"
                                            value={(scaleValue as [string, string])[1]}
                                            onUpdate={(value) => {
                                                this.handleManualScaleValueUpdate(value, 'max');
                                            }}
                                        />
                                    }
                                />
                            </React.Fragment>
                        }
                    />
                )}
            </React.Fragment>
        );
    }

    renderPolylinePoints() {
        const {
            settings: {polylinePoints},
        } = this.state;

        if (typeof polylinePoints === 'undefined') {
            return null;
        }

        return (
            <DialogPlaceholderRow
                title={i18n('wizard', 'label_polyline-points')}
                setting={
                    <DialogRadioButtons
                        items={POLYLINE_POINTS_RADIO_BUTTON_OPTIONS}
                        value={polylinePoints}
                        onUpdate={this.handlePolylinePointsRadioButtonUpdate}
                    />
                }
            />
        );
    }

    renderModalBody() {
        const {tooltipContent, tooltipType} = this.state;

        return (
            <div>
                {this.renderScaleSettings()}
                {this.renderAxisTitleSettings()}
                {this.renderAxisTypeSettings()}
                {this.renderAxisModeSettings()}
                {this.renderAxisFormatSettings()}
                {this.renderGridSettings()}
                {this.renderGridStepSettings()}
                {this.renderHideLabelsSettings()}
                {this.renderLabelsViewSettings()}
                {this.renderNullsRadioButtons()}
                {this.renderHolidaysRadioButtons()}
                {this.renderPolylinePoints()}
                {tooltipContent && tooltipType && (
                    <Popover
                        ref={this.tooltipRef}
                        hasClose={true}
                        anchorRef={
                            tooltipType === 'type'
                                ? this.tooltipAxisTypeAnchorRef
                                : this.tooltipScaleValueAnchorRef
                        }
                        content={tooltipContent}
                        hasArrow={true}
                    />
                )}
            </div>
        );
    }

    handleAxisModeUpdate = (axisMode: string) => {
        this.setState({
            settings: {
                ...this.state.settings,
                axisModeMap: {
                    ...this.state.settings.axisModeMap,
                    [this.state.firstField!.guid]: axisMode,
                },
                gridStep: SETTINGS.GRID_STEP.AUTO,
                gridStepValue: undefined,
            },
        });
    };

    handleAxisFormatModeRadioButtonUpdate = (axisFormatMode: string) => {
        this.setState({settings: {...this.state.settings, axisFormatMode}});
    };

    handlePolylinePointsRadioButtonUpdate = (polylinePointsMode: string) => {
        this.setState({settings: {...this.state.settings, polylinePoints: polylinePointsMode}});
    };

    handleHolidaysRadioButtonUpdate = (holidaysMode: string) => {
        this.setState({settings: {...this.state.settings, holidays: holidaysMode}});
    };

    handleNullsRadioButtonUpdate = (nullsMode: string) => {
        this.setState({settings: {...this.state.settings, nulls: nullsMode}});
    };

    handleLabelsViewRadioButtonUpdate = (labelsViewsMode: string) => {
        this.setState({settings: {...this.state.settings, labelsView: labelsViewsMode}});
    };

    handleHideLabelsRadioButtonsUpdate = (hideLabelsMode: string) => {
        this.setState({settings: {...this.state.settings, hideLabels: hideLabelsMode}});
    };

    handleGridStepRadioButtonUpdate = (gridStepMode: string) => {
        this.setState({settings: {...this.state.settings, gridStep: gridStepMode}});
    };

    handleGridRadioButtonUpdate = (gridMode: string) => {
        this.setState({settings: {...this.state.settings, grid: gridMode}});
    };

    handleGridStepValueUpdate = (gridStepValue: string) => {
        this.setState({settings: {...this.state.settings, gridStepValue: Number(gridStepValue)}});
    };

    handleAxisTitleModeUpdate = (axisTitleMode: string) => {
        this.setState({settings: {...this.state.settings, title: axisTitleMode}});
    };

    handleAxisTitleValueUpdate = (titleValue: string) => {
        this.setState({settings: {...this.state.settings, titleValue}});
    };

    handleScaleRadioButtonsUpdate = (scaleMode: string) => {
        const scaleValue =
            scaleMode === SETTINGS.SCALE.MANUAL
                ? (['0', '100'] as [string, string])
                : SETTINGS.SCALE_VALUE.MIN_MAX;

        this.setState({
            settings: {
                ...this.state.settings,
                scale: scaleMode,
                scaleValue,
            },
        });
    };

    handleAxisTypeUpdate = (axisType: string) => {
        const settings = this.state.settings;

        const updatedState: Partial<State> = {
            settings: {
                ...this.state.settings,
                type: axisType,
            },
        };

        if (
            axisType === SETTINGS.TYPE.LOGARITHMIC &&
            settings.scaleValue === SETTINGS.SCALE_VALUE.ZERO_MAX
        ) {
            updatedState.settings = {
                ...updatedState.settings,
                scaleValue: SETTINGS.SCALE_VALUE.MIN_MAX,
            };
            updatedState.tooltipType = 'scaleValue';
            updatedState.tooltipContent = (
                <span data-qa={DialogPlaceholderQa.TooltipZeroToMaxScale}>
                    {i18n('wizard', 'tooltip_zero-to-max-scale')}
                </span>
            );
        }

        this.setState(
            (prevState: State) => ({...prevState, ...updatedState}),
            () => this.tooltipRef.current && this.tooltipRef.current.openTooltip(),
        );
    };

    handleScaleValueUpdate = (scaleValue: string) => {
        const settings = this.state.settings;

        const updatedState: Partial<State> = {
            settings: {
                ...this.state.settings,
                scaleValue,
            },
        };

        if (
            scaleValue === SETTINGS.SCALE_VALUE.ZERO_MAX &&
            settings.type === SETTINGS.TYPE.LOGARITHMIC
        ) {
            updatedState.settings = {
                ...updatedState.settings,
                type: SETTINGS.TYPE.LINEAR,
            };
            updatedState.tooltipType = 'type';
            updatedState.tooltipContent = (
                <span data-qa={DialogPlaceholderQa.TooltipLogarithmicAxis}>
                    {i18n('wizard', 'tooltip_logarithmic-axis')}
                </span>
            );
        }

        this.setState(
            (prevState: State) => ({...prevState, ...updatedState}),
            () => this.tooltipRef.current && this.tooltipRef.current.openTooltip(),
        );
    };

    handleManualScaleValueUpdate = (value: string, type: 'min' | 'max') => {
        const settings = this.state.settings;
        const scaleValue = (settings.scaleValue || []) as [string, string];

        const [prevMin, prevMax] = scaleValue;

        const updatedScaleValue = [];

        if (type === 'min') {
            updatedScaleValue.push(value, prevMax);
        } else {
            updatedScaleValue.push(prevMin, value);
        }

        this.setState({
            settings: {
                ...this.state.settings,
                scaleValue: updatedScaleValue as [string, string],
            },
        });
    };
}

DialogManager.registerDialog(DIALOG_PLACEHOLDER, withHiddenUnmount(DialogPlaceholder));
