import React from 'react';

import type {RadioButtonOption} from '@gravity-ui/uikit';
import {Dialog, Icon, Switch} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DialogManager from 'components/DialogManager/DialogManager';
import {i18n} from 'i18n';
import isNull from 'lodash/isNull';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';
import type {
    CommonSharedExtraSettings,
    HintSettings,
    MarkupType,
    Placeholder,
    TableFieldBackgroundSettings,
} from 'shared';
import {
    DialogFieldSettingsQa,
    MARKUP_TYPE,
    PlaceholderId,
    WizardVisualizationId,
    getDefaultFormatting,
    isPseudoField,
} from 'shared';
import type {TableSubTotalsSettings} from 'shared/types/wizard/sub-totals';
import {setExtraSettings} from 'ui/units/wizard/actions/widget';
import {
    getDefaultSubTotalsSettings,
    isSubTotalsAvailableInDialogField,
} from 'ui/units/wizard/components/Dialogs/DialogField/utils/subTotals';
import type {Optional} from 'utility-types';

import type {
    ClientChartsConfig,
    CommonNumberFormattingOptions,
    DatasetFieldAggregation,
    DatasetOptions,
    NestedPartial,
    Field as TField,
    TableBarsSettings,
} from '../../../../../../shared/types';
import {DATASET_FIELD_TYPES} from '../../../../../../shared/types';
import {registry} from '../../../../../registry';
import {
    AVAILABLE_DATETIMETZ_FORMATS,
    AVAILABLE_DATETIME_FORMATS,
    AVAILABLE_DATE_FORMATS,
    HIDE_LABEL_MODES,
} from '../../../constants';
import {getCommonDataType, getIconForDataType} from '../../../utils/helpers';
import {DialogRadioButtons} from '../components/DialogRadioButtons/DialogRadioButtons';

import {BackgroundSettings} from './components/BackgroundSettings/BackgroundSettings';
import {BarsSettings} from './components/BarsSettings/BarsSettings';
import {DialogFieldMainSection} from './components/DialogFieldMainSection/DialogFieldMainSection';
import {DialogFieldRow} from './components/DialogFieldRow/DialogFieldRow';
import NumberComponent, {
    isFloatNumberFormatting,
    isIntegerNumberFormatting,
} from './components/Number/Number';
import {SubTotalsSettings} from './components/SubTotalsSettings/SubTotalsSettings';
import {
    getDefaultBackgroundSettings,
    showBackgroundSettingsInDialogField,
} from './utils/backgroundSettings';
import {getDefaultBarsSettings, showBarsInDialogField} from './utils/barsSettings';
import {
    canUseStringAsHtml,
    canUseStringAsMarkdown,
    getFormattingDataType,
    isOneOfPropChanged,
} from './utils/misc';

import './DialogField.scss';

type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type DialogFieldProps = {
    item?: TField;
    extra?: {
        title?: boolean;
        label?: string;
        hideLabel?: boolean;
    };
    availableLabelModes?: string[];
    visualization: ClientChartsConfig['visualization'];
    placeholderId?: PlaceholderId;
    options?: DatasetOptions;
    formattingEnabled: boolean;
    onCancel: () => void;
    onApply: (state: DialogFieldState) => void;
    extraSettings?: CommonSharedExtraSettings;
    fieldIndexInSection?: number;
};

type FieldStateExtend = DialogFieldProps &
    Pick<
        TField,
        'data_type' | 'cast' | 'aggregation' | 'format' | 'title' | 'grouping' | 'hideLabelMode'
    >;

export type DialogFieldState = Optional<FieldStateExtend> & {
    formatting: CommonNumberFormattingOptions;
    isBarsSettingsEnabled?: boolean;
    barsSettings?: TableBarsSettings;
    backgroundSettings?: TableFieldBackgroundSettings;
    isBackgroundSettingsEnabled?: boolean;
    isSubTotalsAvailable?: boolean;
    subTotalsSettings?: TableSubTotalsSettings;
    isErrorOccurred?: boolean;
    originTitle?: string;
    visualizationId?: string;
    currentPlaceholder?: Placeholder;
    hintSettings?: HintSettings;
    markupType?: MarkupType;
};

const b = block('wizard-dialog-field');

export const DIALOG_FIELD = Symbol('DIALOG_FIELD');

export type OpenDialogFieldArgs = {
    id: typeof DIALOG_FIELD;
    props: DialogFieldProps;
};

type DialogFieldInnerProps = DialogFieldProps & DispatchProps;

class DialogField extends React.PureComponent<DialogFieldInnerProps, DialogFieldState> {
    constructor(props: DialogFieldInnerProps) {
        super(props);

        const visualizationId = props.visualization.id;
        const currentPlaceholder = props.visualization.placeholders.find(
            (p) => p.id === props.placeholderId,
        );
        const isPivotFallbackTurnedOn =
            visualizationId === WizardVisualizationId.PivotTable &&
            props.extraSettings?.pivotFallback === 'on';

        const initialState: DialogFieldState = {
            formatting: props.item?.formatting || ({} as CommonNumberFormattingOptions),
            hintSettings: props.item?.hintSettings,
            isBarsSettingsEnabled:
                !isPivotFallbackTurnedOn &&
                showBarsInDialogField(visualizationId, props.placeholderId, props.item),
            isBackgroundSettingsEnabled:
                !isPivotFallbackTurnedOn &&
                showBackgroundSettingsInDialogField(
                    visualizationId as WizardVisualizationId,
                    props.placeholderId,
                ),
            isSubTotalsAvailable: isSubTotalsAvailableInDialogField(
                visualizationId as WizardVisualizationId | undefined,
                props.placeholderId,
                props.item,
            ),
            isErrorOccurred: false,
            currentPlaceholder,
            markupType: props.item?.markupType,
        };

        if (initialState.isBarsSettingsEnabled && props.item) {
            initialState.barsSettings = props.item.barsSettings || getDefaultBarsSettings();
        }

        if (initialState.isBackgroundSettingsEnabled && props.item) {
            initialState.backgroundSettings =
                props.item.backgroundSettings || getDefaultBackgroundSettings(props.item);
        }

        if (initialState.isSubTotalsAvailable && props.item) {
            initialState.subTotalsSettings =
                props.item.subTotalsSettings || getDefaultSubTotalsSettings();
        }

        this.state = initialState;
    }

    // eslint-disable-next-line complexity
    componentDidMount() {
        const {item, extra, availableLabelModes = [], visualization, options} = this.props;

        if (!item) {
            return;
        }

        const visualizationId = visualization.id;

        const {data_type, cast, formatting} = item;

        const commonDataType = getCommonDataType(cast || data_type);

        if (commonDataType === 'date') {
            if (!item.format) {
                switch (cast || data_type) {
                    case DATASET_FIELD_TYPES.DATE:
                        item.format = AVAILABLE_DATE_FORMATS[2];
                        break;
                    case DATASET_FIELD_TYPES.GENERICDATETIME:
                        item.format = AVAILABLE_DATETIME_FORMATS[5];
                        break;
                    case DATASET_FIELD_TYPES.DATETIMETZ:
                        item.format = AVAILABLE_DATETIMETZ_FORMATS[7];
                        break;
                }
            }

            if (!item.grouping) {
                item.grouping = 'none';
            }
        }

        const defaultFormatting = isPseudoField(item) ? {} : getDefaultFormatting(item);

        const preparedFormatting: CommonNumberFormattingOptions = {
            ...defaultFormatting,
            ...(formatting || {}),
        };

        if (extra && extra.label) {
            const itemLabelMode =
                (item.formatting as CommonNumberFormattingOptions)?.labelMode || '';
            preparedFormatting.labelMode =
                availableLabelModes.indexOf(itemLabelMode) === -1
                    ? availableLabelModes[0]
                    : itemLabelMode;
        }

        this.setState({
            item,
            extra,
            availableLabelModes,
            options,

            data_type,
            cast,
            originTitle:
                item.fakeTitle && !item.title.startsWith('title-') ? item.title : undefined,
            title: item.fakeTitle || item.title,
            aggregation: item.aggregation,
            format: item.format,
            grouping: item.grouping,
            hideLabelMode: (item.hideLabelMode as 'hide' | 'show') || HIDE_LABEL_MODES.DEFAULT,
            formatting: preparedFormatting,
            visualizationId,
        });
    }

    render() {
        const {formattingEnabled} = this.props;
        const {item, formatting, isErrorOccurred} = this.state;

        if (!item) {
            return null;
        }

        const {data_type, type} = item;
        const itemType = type.toLowerCase();
        const dataTypeIconData = getIconForDataType(data_type);

        let valid = isOneOfPropChanged<TField>(this.state as TField, item, [
            'cast',
            'aggregation',
            'format',
            'title',
            'grouping',
            'hideLabelMode',
            'formatting',
            'barsSettings',
        ]);

        if (formattingEnabled) {
            // The case when the user erased the value in NumberInput and, leaving the focus on it, wants to commit the form
            valid =
                !formatting ||
                !Number.isNaN((formatting as CommonNumberFormattingOptions).precision);
        }

        const modalBody = this.renderModalBody();
        if (!modalBody) {
            // Added onCancel to remove dialog from redux storage
            this.props.onCancel();
            return null;
        }

        return (
            <Dialog
                open={true}
                onClose={this.props.onCancel}
                disableFocusTrap={true}
                className={b()}
            >
                <div className={b(itemType)}>
                    <Dialog.Header
                        caption={item.fakeTitle || item.title}
                        insertBefore={<Icon data={dataTypeIconData} width="16" />}
                    />
                    <Dialog.Body className={b('body')}>{modalBody}</Dialog.Body>
                    <Dialog.Footer
                        preset="default"
                        onClickButtonCancel={() => {
                            this.props.onCancel();
                        }}
                        onClickButtonApply={() => {
                            this.props.onApply(this.state);
                        }}
                        textButtonApply={i18n('wizard', 'button_apply')}
                        textButtonCancel={i18n('wizard', 'button_cancel')}
                        propsButtonApply={{
                            disabled: !valid || isErrorOccurred,
                            qa: 'field-dialog-apply',
                        }}
                    />
                </div>
            </Dialog>
        );
    }

    renderModalBody() {
        const {item} = this.state;

        if (!item) {
            return null;
        }

        const bodyItems = [
            this.renderMainSection(),
            this.renderMarkdownSettings(),
            this.renderHintSettings(),
            this.renderFormattingItem(),
            this.renderSubTotalsSettings(),
            this.renderBarsSettings(),
            this.renderBackgroundSettings(),
        ];

        if (bodyItems.every(isNull)) {
            return null;
        }

        return (
            <>
                {bodyItems.map((bodyItem, index) => (
                    <React.Fragment key={index}>{bodyItem}</React.Fragment>
                ))}
            </>
        );
    }

    private renderMainSection() {
        const {
            visualizationId,
            item,
            cast,
            data_type,
            options,
            grouping = '',
            formatting,
            originTitle,
            title,
            hideLabelMode,
            format,
            aggregation,
            availableLabelModes,
            extra,
            placeholderId,
            currentPlaceholder,
        } = this.state;

        if (!item || !options || isPseudoField(item)) {
            return null;
        }

        return (
            <DialogFieldMainSection
                placeholderId={placeholderId}
                item={item}
                extra={extra}
                title={title}
                originTitle={originTitle}
                hideLabelMode={hideLabelMode}
                options={options}
                data_type={data_type}
                format={format}
                aggregation={aggregation}
                grouping={grouping}
                cast={cast}
                availableLabelModes={availableLabelModes}
                visualizationId={visualizationId}
                formatting={formatting}
                currentPlaceholder={currentPlaceholder}
                handleTitleInputUpdate={this.handleTitleInput}
                handleLabelModeUpdate={this.handleLabelModeUpdate}
                handleFieldTypeUpdate={this.handleFieldTypeUpdate}
                handleLabelHideUpdate={this.handleLabelHideUpdate}
                handleDateFormatUpdate={this.handleDateFormatUpdate}
                handleAggregationUpdate={this.handleAggregationUpdate}
                handleDateGroupUpdate={this.handleDateGroupUpdate}
            />
        );
    }

    private renderFormattingItem = () => {
        const {item, cast, formatting} = this.state;

        if (!item || !this.props.formattingEnabled) {
            return null;
        }

        const formattingDataType = getFormattingDataType(item, cast);

        const numberProps = {
            dataType: formattingDataType,
            formatting,
            onChange: (updatedFormatting: CommonNumberFormattingOptions) =>
                this.setState({formatting: updatedFormatting}),
        };

        if (isFloatNumberFormatting(numberProps) || isIntegerNumberFormatting(numberProps)) {
            return <NumberComponent {...numberProps} />;
        }

        return null;
    };

    private renderHintSettings() {
        const {item, placeholderId} = this.props;
        const availablePlaceholders = [
            PlaceholderId.FlatTableColumns,
            PlaceholderId.PivotTableRows,
        ];

        if (!item || !availablePlaceholders.includes(placeholderId as PlaceholderId)) {
            return null;
        }

        const hintSettings = this.state.hintSettings;
        const enabled = hintSettings?.enabled;
        const text = hintSettings?.text || item?.description || '';

        const {MarkdownControl} = registry.common.components.getAll();

        return (
            <React.Fragment>
                <DialogFieldRow
                    title={i18n('wizard', 'label_hint')}
                    setting={
                        <Switch
                            onUpdate={(checked) =>
                                this.setState({hintSettings: {enabled: checked, text}})
                            }
                            checked={enabled}
                        />
                    }
                />
                {enabled && (
                    <DialogFieldRow
                        title={''}
                        setting={
                            <MarkdownControl
                                value={text}
                                onChange={(value) =>
                                    this.setState({hintSettings: {enabled, text: value}})
                                }
                                disabled={!enabled}
                            />
                        }
                    />
                )}
            </React.Fragment>
        );
    }

    private renderMarkdownSettings() {
        const {item, placeholderId, visualization} = this.props;
        const isStringField = item?.data_type === DATASET_FIELD_TYPES.STRING;
        const visualizationId = visualization.id as WizardVisualizationId;
        const canTransformToMarkdown =
            isStringField && canUseStringAsMarkdown(visualizationId, placeholderId);
        const canTransformToHtml = isStringField && canUseStringAsHtml();

        if (!canTransformToMarkdown && !canTransformToHtml) {
            return null;
        }

        const items: RadioButtonOption[] = [
            {value: MARKUP_TYPE.none, content: i18n('wizard', 'label_none')},
        ];

        if (canTransformToMarkdown) {
            items.push({value: MARKUP_TYPE.markdown, content: i18n('wizard', 'label_markdown')});
        }

        if (canTransformToHtml) {
            items.push({value: MARKUP_TYPE.html, content: i18n('wizard', 'label_html')});
        }

        return (
            <React.Fragment>
                <DialogFieldRow
                    title={i18n('wizard', 'label_markup-type')}
                    tooltipText={i18n('wizard', 'label_markup-type-tooltip')}
                    setting={
                        <DialogRadioButtons
                            qa={DialogFieldSettingsQa.MarkupTypeRadioButtons}
                            items={items}
                            value={this.state.markupType}
                            onUpdate={(value: string) => {
                                this.setState({markupType: value});
                            }}
                        />
                    }
                />
            </React.Fragment>
        );
    }

    private renderSubTotalsSettings() {
        const {item} = this.props;
        const {isSubTotalsAvailable, subTotalsSettings} = this.state;

        if (!item || isPseudoField(item) || !isSubTotalsAvailable || !subTotalsSettings) {
            return null;
        }

        return (
            <>
                <Dialog.Divider className={b('divider')} />
                <SubTotalsSettings
                    state={subTotalsSettings}
                    onUpdate={this.handleSubTotalsSettingsUpdate}
                />
            </>
        );
    }

    private renderBarsSettings() {
        const {isBarsSettingsEnabled} = this.state;
        const {item} = this.props;

        if (!item || !isBarsSettingsEnabled || isPseudoField(item)) {
            return null;
        }
        return (
            <>
                <Dialog.Divider className={b('divider')} />
                <BarsSettings
                    field={item}
                    state={this.state.barsSettings || getDefaultBarsSettings()}
                    onUpdate={this.handleBarsSettingsUpdate}
                    onError={this.handleOnError}
                />
            </>
        );
    }

    private renderBackgroundSettings() {
        if (!this.state.isBackgroundSettingsEnabled) {
            return null;
        }

        const {backgroundSettings, item} = this.state;
        const {placeholderId, visualization} = this.props;

        if (!backgroundSettings || !item || !placeholderId || !visualization) {
            return null;
        }

        return (
            <>
                {!isPseudoField(item) && <Dialog.Divider className={b('divider')} />}
                <BackgroundSettings
                    currentField={item}
                    state={backgroundSettings}
                    visualization={visualization}
                    placeholderId={placeholderId}
                    onUpdate={this.handleBackgroundSettingsUpdate}
                />
            </>
        );
    }

    private handleOnError = (isErrorOccurred: boolean) => {
        this.setState({isErrorOccurred});
    };

    private handleBarsSettingsUpdate = (barsSettings: Partial<TableBarsSettings>) => {
        this.setState({barsSettings: {...this.state.barsSettings!, ...barsSettings}});
    };

    private handleBackgroundSettingsUpdate = (
        backgroundSettings: NestedPartial<TableFieldBackgroundSettings, 'settings'>,
    ) => {
        const settings = backgroundSettings.settings || {};
        this.setState({
            backgroundSettings: {
                ...this.state.backgroundSettings!,
                ...backgroundSettings,
                settings: {
                    ...this.state.backgroundSettings!.settings,
                    ...settings,
                },
            },
        });
    };

    private handleSubTotalsSettingsUpdate = (
        subTotalsSettings: Partial<TableSubTotalsSettings>,
    ) => {
        this.setState({
            subTotalsSettings: {
                ...this.state.subTotalsSettings!,
                ...subTotalsSettings,
            },
        });

        // First field in section is equivalent of grand totals
        if (this.props.fieldIndexInSection === 0) {
            this.props.actions.setExtraSettings({
                ...this.props.extraSettings,
                totals: subTotalsSettings.enabled ? 'on' : 'off',
            });
        }
    };

    private handleTitleInput = (nextValue: string) => {
        this.setState({title: nextValue});
    };

    private handleLabelHideUpdate = (nextValue: string) => {
        this.setState({
            hideLabelMode: nextValue as TField['hideLabelMode'],
        });
    };

    private handleAggregationUpdate = (nextValue: string) => {
        this.setState({aggregation: nextValue as DatasetFieldAggregation});
    };

    private handleDateFormatUpdate = (nextValue: string) => {
        this.setState({format: nextValue});
    };

    private handleLabelModeUpdate = (nextValue: string) => {
        this.setState((prevState) => ({
            ...prevState,
            formatting: {
                ...prevState.formatting,
                labelMode: nextValue,
            },
        }));
    };

    private handleFieldTypeUpdate = (nextValue: string) => {
        this.setState((prevState) => {
            const state: Partial<DialogFieldState> = {
                cast: nextValue as DATASET_FIELD_TYPES,
                grouping: prevState.grouping,
            };
            if (nextValue === DATASET_FIELD_TYPES.INTEGER) {
                state.formatting = {
                    ...prevState.formatting,
                    precision: 0,
                };
            }

            const isDate =
                nextValue === DATASET_FIELD_TYPES.DATE ||
                nextValue === DATASET_FIELD_TYPES.GENERICDATETIME ||
                nextValue === DATASET_FIELD_TYPES.DATETIMETZ;

            if (isDate) {
                if (!state.grouping) {
                    state.grouping = 'none';
                }
            } else {
                state.grouping = '';
            }

            return {
                ...prevState,
                ...state,
            };
        });
    };

    private handleDateGroupUpdate = (nextValue: string) => {
        this.setState({grouping: nextValue});
    };
}

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        actions: bindActionCreators(
            {
                setExtraSettings,
            },
            dispatch,
        ),
    };
};

const DialogFieldWithRedux = connect(null, mapDispatchToProps)(DialogField);

DialogManager.registerDialog(DIALOG_FIELD, DialogFieldWithRedux);
