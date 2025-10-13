import React from 'react';

import type {SegmentedRadioGroupOptionProps, SelectOptionGroup} from '@gravity-ui/uikit';
import {i18n} from 'i18n';
import type {
    AvailableFieldType,
    CommonNumberFormattingOptions,
    DatasetFieldAggregation,
    DatasetOptions,
    Field,
    Placeholder,
    PlaceholderSettings,
} from 'shared';
import {
    AxisMode,
    DATASET_FIELD_TYPES,
    DialogFieldMainSectionQa,
    DialogFieldSettingsQa,
    PlaceholderId,
    WizardVisualizationId,
    isDateField,
    isNumberField,
} from 'shared';

import {
    AVAILABLE_AGGREGATIONS_BY_COMMON_CAST,
    AVAILABLE_DATETIMETZ_FORMATS,
    AVAILABLE_DATETIMETZ_FORMATS_NON_TABLE,
    AVAILABLE_DATETIME_FORMATS,
    AVAILABLE_DATETIME_FORMATS_NON_TABLE,
    AVAILABLE_DATETIME_GROUPING_MODES,
    AVAILABLE_DATE_FORMATS,
    AVAILABLE_DATE_FORMATS_NON_TABLE,
    AVAILABLE_DATE_GROUPING_MODES,
    AVAILABLE_FIELD_TYPES,
} from '../../../../../constants';
import {getCommonDataType} from '../../../../../utils/helpers';
import {DialogRadioButtons} from '../../../components/DialogRadioButtons/DialogRadioButtons';
import {getDialogFieldSelectItems} from '../../utils/misc';
import {DialogFieldInput} from '../DialogFieldInput/DialogFieldInput';
import {DialogFieldRow} from '../DialogFieldRow/DialogFieldRow';
import {DialogFieldSelect} from '../DialogFieldSelect/DialogFieldSelect';

type Props = {
    item: Field;
    extra:
        | {
              title?: boolean;
              label?: string;
              hideLabel?: boolean;
          }
        | undefined;
    options: DatasetOptions;
    title: string | undefined;
    originTitle: string | undefined;
    hideLabelMode: 'show' | 'hide' | undefined;
    data_type: DATASET_FIELD_TYPES | undefined;
    format: string | undefined;
    aggregation: DatasetFieldAggregation | undefined;
    grouping: string | undefined;
    cast: DATASET_FIELD_TYPES | undefined;
    availableLabelModes: string[] | undefined;
    visualizationId: string | undefined;
    currentPlaceholder: Placeholder | undefined;
    placeholderId: PlaceholderId | undefined;
    formatting: CommonNumberFormattingOptions;
    handleTitleInputUpdate: (v: string) => void;
    handleLabelModeUpdate: (v: string) => void;
    handleFieldTypeUpdate: (v: string) => void;
    handleLabelHideUpdate: (v: string) => void;
    handleDateFormatUpdate: (v: string) => void;
    handleAggregationUpdate: (v: string) => void;
    handleDateGroupUpdate: (v: string) => void;
};

export class DialogFieldMainSection extends React.Component<Props> {
    render() {
        const {
            visualizationId,
            item,
            cast,
            data_type,
            grouping = '',
            currentPlaceholder,
        } = this.props;

        const commonDataType = getCommonDataType(cast || data_type!);

        const placeholderSettings = currentPlaceholder?.settings as PlaceholderSettings;
        const isDateFieldItem = isDateField(item);
        const isDiscreteMode = placeholderSettings?.axisModeMap?.[item.guid] === AxisMode.Discrete;
        const isDateAndDiscreteMode = isDateFieldItem && isDiscreteMode;
        const hasValidDataType = commonDataType === 'date' || item.grouping;

        const enableFormat =
            visualizationId &&
            hasValidDataType &&
            (isDateAndDiscreteMode || this.isTableVisualization || this.isMetricVisualization);

        return (
            <React.Fragment>
                {this.renderOriginTitleInput()}
                {this.renderTitleInput()}
                {this.renderModesSelect()}
                {this.renderFieldTypeSelect()}
                {(commonDataType === 'date' || grouping) && this.renderDateGroupSelect()}
                {enableFormat && this.renderDateFormatSelect()}
                {this.renderAggregationSelect()}
                {this.renderLabelHide()}
            </React.Fragment>
        );
    }
    renderOriginTitleInput() {
        const {extra, originTitle} = this.props;

        if (!extra?.title || !originTitle) {
            return null;
        }

        return (
            <DialogFieldRow
                title={i18n('wizard', 'label_original-title')}
                setting={
                    <DialogFieldInput
                        qa={DialogFieldSettingsQa.FieldTitleInput}
                        value={originTitle}
                        disabled={true}
                    />
                }
            />
        );
    }

    renderTitleInput() {
        const {extra, title} = this.props;

        if (!extra?.title) {
            return null;
        }

        return (
            <DialogFieldRow
                title={i18n('wizard', 'label_title')}
                setting={
                    <DialogFieldInput
                        qa={DialogFieldSettingsQa.FieldTitleInput}
                        onUpdate={this.props.handleTitleInputUpdate}
                        value={title}
                    />
                }
            />
        );
    }

    renderDateGroupSelect() {
        const {options} = this.props;
        const {item, cast, grouping} = this.props;

        if (options && !options.supported_functions.includes('datetrunc')) {
            return null;
        }

        const availableModes = (
            (cast || item?.originalDateCast) === 'date'
                ? AVAILABLE_DATE_GROUPING_MODES
                : AVAILABLE_DATETIME_GROUPING_MODES
        ) as [string, string[]][];

        const noneItem: SelectOptionGroup = {
            label: i18n('wizard', 'label_without-group'),
            options: [
                {
                    value: 'none',
                    qa: `${DialogFieldMainSectionQa.GroupingSelector}-none`,
                    content: i18n('wizard', 'label_none'),
                },
            ],
        };

        let isCustomFormula = false;

        if (item.grouping) {
            const [operation, mode] = item.grouping.split('-');

            let functionName;
            if (operation === 'trunc') {
                functionName = 'datetrunc';
            } else {
                functionName = 'datepart';
            }

            const formula = `${functionName}([${item.originalTitle || item.title}], "${mode}")`;

            isCustomFormula = Boolean(item.local && formula !== item.formula);
        }

        const restItems: SelectOptionGroup[] = isCustomFormula
            ? []
            : availableModes.map(
                  ([groupTitle, values]): SelectOptionGroup => ({
                      label: i18n('wizard', `label_${groupTitle as AvailableFieldType}`),
                      options: getDialogFieldSelectItems({
                          arr: values,
                          generateValue: (value) => `${groupTitle}-${value}`,
                          generateTitle: (value) =>
                              i18n('wizard', `label_${value as AvailableFieldType}`),
                          generateQa: (value) =>
                              `${DialogFieldMainSectionQa.GroupingSelector}-${groupTitle}-${value}`,
                      }),
                  }),
              );

        const items: SelectOptionGroup[] = [noneItem, ...restItems];
        const title = i18n(
            'wizard',
            item?.aggregation === 'none' ? 'label_date-group' : 'label_date-group-preaggregated',
        );
        const placeholder = i18n(
            'wizard',
            `label_${grouping?.replace(/trunc-|part-/, '') as AvailableFieldType}`,
        );

        return (
            <DialogFieldRow
                title={title}
                setting={
                    <DialogFieldSelect
                        disabled={isCustomFormula}
                        placeholder={placeholder}
                        options={items}
                        value={isCustomFormula ? 'none' : grouping}
                        onUpdate={this.props.handleDateGroupUpdate}
                        controlTestAnchor={DialogFieldMainSectionQa.GroupingSelector}
                        warning={
                            isCustomFormula
                                ? i18n('wizard', 'label_using-formula-warning')
                                : undefined
                        }
                    />
                }
            />
        );
    }

    renderModesSelect() {
        const {extra, availableLabelModes, formatting, item, placeholderId} = this.props;

        if (placeholderId === PlaceholderId.Labels && !isNumberField(item)) {
            return null;
        }

        if (extra?.label && Array.isArray(availableLabelModes) && availableLabelModes.length > 1) {
            const labelMode = formatting.labelMode;
            const items = getDialogFieldSelectItems({
                arr: availableLabelModes,
                generateTitle: (value) => i18n('wizard', `label_${value as AvailableFieldType}`),
                generateQa: (value) => `${DialogFieldMainSectionQa.LabelModeSelector}-${value}`,
            });
            const placeholder = i18n('wizard', `label_${labelMode as AvailableFieldType}`);
            const title = i18n('wizard', 'label_label-mode');
            return (
                <DialogFieldRow
                    title={title}
                    setting={
                        <DialogFieldSelect
                            controlTestAnchor={DialogFieldMainSectionQa.LabelModeSelector}
                            placeholder={placeholder}
                            options={items}
                            value={labelMode}
                            onUpdate={this.props.handleLabelModeUpdate}
                        />
                    }
                />
            );
        }

        return null;
    }

    renderFieldTypeSelect() {
        const {options, item, cast} = this.props;
        if (!item || !options) {
            return null;
        }
        // We take the available types from options.data_types by item.initial_data_type
        // We take the available aggregations from options.data_types by item.cast
        // CHARTS-2348#5eec6fc3685f7123188b2266

        // Left a fallback on AVAILABLE_FIELD_TYPES, because while the back is outside
        // // metrica/apmetrica datasets have not migrated and there initial_data_type = null
        const dataTypes = options.data_types.items;
        const dataType = dataTypes.find(({type}) => {
            // Making a folback on item.cast for items without initial_data_type
            const itemType = item.initial_data_type || item.cast;
            return type === itemType;
        });

        if (!dataType) {
            return null;
        }

        const availableFieldTypes = dataType.casts || AVAILABLE_FIELD_TYPES;

        const title = i18n(
            'wizard',
            item.aggregation === 'none' ? 'label_type' : 'label_type-preaggregated',
        );
        const placeholder = i18n('wizard', `label_${cast as AvailableFieldType}`);
        const items = getDialogFieldSelectItems({
            arr: availableFieldTypes,
            generateTitle: (value) => i18n('wizard', `label_${value as AvailableFieldType}`),
            generateQa: (value) => `${DialogFieldMainSectionQa.TypeSelector}-${value}`,
        });

        return (
            <DialogFieldRow
                title={title}
                setting={
                    <DialogFieldSelect
                        placeholder={placeholder}
                        options={items}
                        value={cast}
                        onUpdate={this.props.handleFieldTypeUpdate}
                        controlTestAnchor={DialogFieldMainSectionQa.TypeSelector}
                        disabled={!availableFieldTypes.length}
                    />
                }
            />
        );
    }

    renderLabelHide() {
        const {extra, hideLabelMode} = this.props;

        const radioButtons: SegmentedRadioGroupOptionProps[] = [
            {
                value: 'hide',
                content: i18n('wizard', 'label_hide'),
            },
            {
                value: 'show',
                content: i18n('wizard', 'label_show'),
            },
        ];

        if (!extra?.hideLabel) {
            return null;
        }

        return (
            <DialogFieldRow
                title={i18n('wizard', 'label_label-hide-mode')}
                setting={
                    <DialogRadioButtons
                        items={radioButtons}
                        value={hideLabelMode}
                        onUpdate={this.props.handleLabelHideUpdate}
                    />
                }
            />
        );
    }

    renderDateFormatSelect() {
        const {format, grouping = ''} = this.props;

        const items = getDialogFieldSelectItems({
            arr: this.getAvailableDateFormats(),
            generateTitle: (value) => value,
        });
        const title = i18n('wizard', 'label_date-format');
        const disabled = grouping.indexOf('part') !== -1;
        return (
            <DialogFieldRow
                title={title}
                setting={
                    <DialogFieldSelect
                        options={items}
                        value={format}
                        onUpdate={this.props.handleDateFormatUpdate}
                        disabled={disabled}
                    />
                }
            />
        );
    }

    renderAggregationSelect() {
        const {aggregation, options, item, cast} = this.props;

        if (!options || !item) {
            return null;
        }

        const dataTypes = options.data_types.items;

        const datasetOptions = dataTypes.find((dataTypeOptions) => {
            return dataTypeOptions.type === item.cast;
        });

        const commonCast = getCommonDataType(cast as unknown as DATASET_FIELD_TYPES);
        const availableAggregations = datasetOptions
            ? ['none', ...datasetOptions.aggregations]
            : ['none', ...AVAILABLE_AGGREGATIONS_BY_COMMON_CAST[commonCast]];

        const isAutoAggregated = item.autoaggregated && !item.grouping;

        const title = i18n('wizard', 'label_aggregation');

        let placeholder: string | undefined;

        if (isAutoAggregated) {
            placeholder = i18n('wizard', 'label_auto');
        } else if (aggregation) {
            placeholder = i18n('wizard', `label_${aggregation}`);
        }

        const value = isAutoAggregated ? undefined : aggregation;
        const items = getDialogFieldSelectItems({
            arr: availableAggregations,
            generateTitle: (itemValue: string) =>
                i18n('wizard', `label_${itemValue as AvailableFieldType}`),
            generateQa: (value) => `${DialogFieldMainSectionQa.AggregationSelector}-${value}`,
        });
        const disabled = item.autoaggregated && !item.grouping;
        return (
            <DialogFieldRow
                title={title}
                setting={
                    <DialogFieldSelect
                        placeholder={placeholder}
                        options={items}
                        value={value}
                        disabled={disabled}
                        onUpdate={this.props.handleAggregationUpdate}
                        controlTestAnchor={DialogFieldMainSectionQa.AggregationSelector}
                    />
                }
            />
        );
    }

    private getAvailableDateFormats() {
        const fieldType = this.props.cast || this.props.data_type;
        switch (fieldType) {
            case DATASET_FIELD_TYPES.DATE:
                return this.isTableVisualization
                    ? AVAILABLE_DATE_FORMATS
                    : AVAILABLE_DATE_FORMATS_NON_TABLE;
            case DATASET_FIELD_TYPES.DATETIMETZ:
                return this.isTableVisualization
                    ? AVAILABLE_DATETIMETZ_FORMATS
                    : AVAILABLE_DATETIMETZ_FORMATS_NON_TABLE;
            case DATASET_FIELD_TYPES.GENERICDATETIME:
            default:
                return this.isTableVisualization
                    ? AVAILABLE_DATETIME_FORMATS
                    : AVAILABLE_DATETIME_FORMATS_NON_TABLE;
        }
    }

    get isTableVisualization() {
        return (
            this.props.visualizationId === WizardVisualizationId.FlatTable ||
            this.props.visualizationId === WizardVisualizationId.PivotTable
        );
    }

    get isMetricVisualization() {
        return this.props.visualizationId === WizardVisualizationId.Metric;
    }
}
