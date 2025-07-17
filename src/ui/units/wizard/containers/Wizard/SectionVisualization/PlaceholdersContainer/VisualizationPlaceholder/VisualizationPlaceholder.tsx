import React from 'react';

import type {SelectOption} from '@gravity-ui/uikit';
import {Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {DatalensGlobalState} from 'ui';
import {selectPointSizeConfig, selectVisualization} from 'units/wizard/selectors/visualization';
import {selectExtraSettings} from 'units/wizard/selectors/widget';
import {getGeolayerGroups} from 'units/wizard/utils/helpers';

import type {
    Field,
    Placeholder,
    PointSizeConfig,
    VisualizationLayerType,
} from '../../../../../../../../shared';
import {
    DatasetFieldType,
    PlaceholderActionQa,
    PlaceholderId,
    PseudoFieldTitle,
    WizardVisualizationId,
    isFieldHierarchy,
    isMarkupField,
    isVisualizationWithLayers,
} from '../../../../../../../../shared';
import {
    changeVisualizationLayerType,
    setVisualizationPlaceholderItems,
    transformVisualizationItem,
} from '../../../../../actions';
import {
    openDialogColors,
    openDialogColumnSettings,
    openDialogMetric,
    openDialogPlaceholder,
    openDialogPointsSize,
} from '../../../../../actions/dialog';
import {updateVisualizationPlaceholderItems} from '../../../../../actions/placeholder';
import {updatePreviewAndClientChartsConfig} from '../../../../../actions/preview';
import {
    setColorsConfig,
    setPointsSizeConfig,
    updateFieldColumnSettings,
} from '../../../../../actions/visualization';
import {forceDisableTotalsAndPagination, setExtraSettings} from '../../../../../actions/widget';
import type {DialogColumnSettingsFields} from '../../../../../components/Dialogs/DialogColumnSettings/DialogColumnSettings';
import type {ColumnSettingsState} from '../../../../../components/Dialogs/DialogColumnSettings/hooks/useDialogColumnSettingsState';
import {CHART_SETTINGS, ITEM_TYPES, VISUALIZATION_IDS} from '../../../../../constants';
import PlaceholderComponent from '../Placeholder/Placeholder';
import type {CommonPlaceholderProps} from '../PlaceholdersContainer';

import {COLUMNS_PLACEHOLDERS, ROWS_PLACEHOLDERS} from './constants';

type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type StateProps = ReturnType<typeof mapStateToProps>;

type Props = CommonPlaceholderProps &
    DispatchProps &
    StateProps & {
        placeholder: Placeholder;
    };

const GEOTYPES_ITEMS: SelectOption[] = getGeolayerGroups().map(
    (item): SelectOption => ({
        value: item,
        content: i18n('wizard', `value_geotype-select-${item}`),
        qa: item,
    }),
);

const TABLE_PLACEHOLDERS_WITH_COLUMN_WIDTH_SETTINGS = new Set([
    'flat-table-columns',
    'pivot-table-columns',
    'rows',
]);

const b = block('visualization-container');

class VisualizationPlaceholder extends React.Component<Props> {
    render() {
        const {
            addFieldItems,
            placeholder,
            wrapTo,
            datasetError,
            onBeforeRemoveItem,
            visualization,
        } = this.props;

        const {hasSettings, onActionIconClick, actionIconQa, disabledText} =
            this.placeholderSettings;

        const items = [...placeholder.items];

        return (
            <PlaceholderComponent
                id={placeholder.id}
                qa={`placeholder-${placeholder.id}`}
                key={`placeholder-${placeholder.id}`}
                capacityError="label_fields-overflow"
                iconProps={placeholder.iconProps}
                title={this.renderPlaceholderTitle}
                hasSettings={hasSettings}
                onActionIconClick={onActionIconClick}
                actionIconQa={actionIconQa}
                items={items}
                onUpdate={this.onFieldsUpdate}
                wrapTo={wrapTo}
                disabled={Boolean(datasetError)}
                onBeforeRemoveItem={onBeforeRemoveItem}
                checkAllowed={this.checkAllowedPlaceholderItem}
                capacity={placeholder.capacity}
                transform={this.transformPlaceholderItem}
                allowedTypes={placeholder.allowedTypes}
                allowedDataTypes={placeholder.allowedDataTypes}
                showHideLabel={visualization.allowLabels}
                addFieldItems={addFieldItems}
                onAfterUpdate={this.props.onUpdate}
                disabledText={disabledText}
            />
        );
    }

    get placeholderSettings(): {
        hasSettings: boolean;
        onActionIconClick?: () => void;
        actionIconQa?: string;
        disabledText?: string;
    } {
        const {visualization, placeholder} = this.props;

        switch (visualization.id) {
            case WizardVisualizationId.PieD3:
            case WizardVisualizationId.DonutD3:
            case 'pie':
            case 'donut': {
                const hasSettings =
                    placeholder.items.length > 0 && placeholder.id === PlaceholderId.Colors;
                const colorsContainsHierarchies = placeholder.items.some(isFieldHierarchy);
                const hasStringMeasures = placeholder.items.some(
                    (item) => item.type === DatasetFieldType.Measure && item.data_type === 'string',
                );
                const canChangeColorSettings = !colorsContainsHierarchies && !hasStringMeasures;
                let disabledText: string | undefined;

                if (colorsContainsHierarchies) {
                    disabledText = i18n('wizard', 'label_no-colors-setup-for-hierarchy');
                } else if (hasStringMeasures) {
                    disabledText = i18n('wizard', 'label_no-colors-setup-for-string-measures');
                }

                return {
                    hasSettings,
                    actionIconQa: PlaceholderActionQa.OpenColorDialogIcon,
                    onActionIconClick: canChangeColorSettings ? this.openDialogColors : undefined,
                    disabledText,
                };
            }
            case 'metric': {
                const {items} = placeholder;

                const item = items[0];

                return isMarkupField(item)
                    ? {
                          hasSettings: false,
                      }
                    : {
                          hasSettings: true,
                          onActionIconClick: this.openDialogMetric,
                          actionIconQa: 'placeholder-action-open-metric-dialog',
                      };
            }
            case 'flatTable': {
                const hasSettings =
                    TABLE_PLACEHOLDERS_WITH_COLUMN_WIDTH_SETTINGS.has(placeholder.id) &&
                    placeholder.items.length > 0;
                return {
                    hasSettings,
                    actionIconQa: 'placeholder-action-open-column-settings-dialog',
                    onActionIconClick: this.openDialogColumnSettings,
                };
            }
            case 'pivotTable': {
                const hasSettings =
                    TABLE_PLACEHOLDERS_WITH_COLUMN_WIDTH_SETTINGS.has(placeholder.id) &&
                    placeholder.items.length > 0;
                return {
                    hasSettings,
                    actionIconQa: 'placeholder-action-open-column-settings-dialog',
                    onActionIconClick: this.openDialogColumnSettings,
                };
            }
            default: {
                if (placeholder.id === 'size') {
                    return {
                        hasSettings: true,
                        onActionIconClick: this.openDialogPointsSize,
                    };
                } else {
                    const hasSettings = Boolean(
                        placeholder.settings &&
                            Object.keys(placeholder.settings).length > 0 &&
                            placeholder.items.length > 0,
                    );
                    return {
                        hasSettings,
                        onActionIconClick: this.openDialogPlaceholder,
                        actionIconQa: `placeholder-action-open-${placeholder.id}-dialog`,
                    };
                }
            }
        }
    }

    private openDialogPlaceholder = () => {
        const {placeholder} = this.props;

        this.props.openDialogPlaceholder({placeholder, onApply: this.props.onUpdate});
    };

    private openDialogColors = () => {
        const {placeholder} = this.props;
        const item = placeholder.items[0];

        this.props.openDialogColors({
            item,
            onApply: () => {
                if (this.props.onUpdate) {
                    this.props.onUpdate();
                }
            },
        });
    };

    private openDialogMetric = () => {
        const {extraSettings} = this.props;

        this.props.openDialogMetric({extraSettings});
    };

    private openDialogPointsSize = () => {
        const {geopointsConfig, placeholder, visualization} = this.props;

        this.props.openDialogPointsSize({
            geopointsConfig: geopointsConfig as PointSizeConfig,
            placeholder,
            visualization,
            onApply: this.props.onUpdate
        });
    };

    private openDialogColumnSettings = () => {
        const {visualization, extraSettings} = this.props;

        const columnsPlaceholder = visualization.placeholders.find(
            (placeholder) => COLUMNS_PLACEHOLDERS[placeholder.id],
        );

        const rowsPlaceholder = visualization.placeholders.find(
            (placeholder) => ROWS_PLACEHOLDERS[placeholder.id],
        );

        const fields: DialogColumnSettingsFields = {
            columns: [...(columnsPlaceholder ? columnsPlaceholder.items : [])],
            rows: [...(rowsPlaceholder ? rowsPlaceholder.items : [])],
        };

        this.props.openDialogColumnSettings({
            onApply: this.handleDialogColumnSettingsApply,
            fields,
            visualizationId: visualization.id as WizardVisualizationId,
            pinnedColumns: extraSettings?.pinnedColumns,
        });
    };

    private handleDialogColumnSettingsApply = (
        columnsSettings: {
            columns: ColumnSettingsState;
            rows: ColumnSettingsState;
        },
        pinnedColumns?: number,
    ) => {
        const {visualization} = this.props;

        this.props.setExtraSettings({...this.props.extraSettings, pinnedColumns});

        const placeholders: Placeholder[] = [];
        visualization.placeholders.forEach((placeholder) => {
            if (TABLE_PLACEHOLDERS_WITH_COLUMN_WIDTH_SETTINGS.has(placeholder.id)) {
                placeholders.push(placeholder);
            }
        });

        placeholders.forEach((placeholder, index) => {
            const isLastPlaceholder = index === placeholders.length - 1;
            this.props.updateFieldColumnSettings(
                visualization,
                placeholder,
                columnsSettings,
                isLastPlaceholder,
            );
        });

        if (this.props.onUpdate) {
            this.props.onUpdate();
        }
    };

    private checkAllowedPlaceholderItem = (item: Field) => {
        const {placeholder, visualization} = this.props;

        if (placeholder.checkAllowed) {
            if (!placeholder.checkAllowed(item)) {
                return false;
            }
        } else {
            if (placeholder.allowedDataTypes && !placeholder.allowedDataTypes.has(item.data_type)) {
                return false;
            }

            if (placeholder.allowedTypes && !placeholder.allowedTypes.has(item.type)) {
                return false;
            }
        }

        if (visualization.id === 'pivotTable' && placeholder.id === 'rows') {
            const isAllowedType = ITEM_TYPES.DIMENSIONS_AND_PSEUDO.has(item.type);
            const pivotFallbackSettingValues = this.props.extraSettings?.pivotFallback;
            const isPivotFallbackDisabled =
                pivotFallbackSettingValues !== CHART_SETTINGS.PIVOT_FALLBACK.ON;
            if (isPivotFallbackDisabled) {
                return isAllowedType && item.title !== PseudoFieldTitle.MeasureValues;
            }

            return isAllowedType;
        }

        return true;
    };

    private transformPlaceholderItem = (item: Field, action?: 'replace') => {
        const {placeholder} = this.props;
        const needUpdate = action === 'replace';
        return this.props.transformVisualizationItem({
            item,
            transformField: placeholder.transform,
            needUpdate,
        }) as unknown as Promise<Field>;
    };

    private onFieldsUpdate = (items: Field[], item?: Field) => {
        this.props.updateVisualizationPlaceholderItems({
            items,
            options: {item, placeholderId: this.props.placeholder.id as PlaceholderId},
        });

        this.onUpdateDone();

        if (this.props.onUpdate) {
            this.props.onUpdate();
        }
    };

    private onUpdateDone = () => {
        this.props.updatePreviewAndClientChartsConfig({});
    };

    private renderPlaceholderTitle = () => {
        const {globalVisualization, placeholder} = this.props;
        const {GEOPOINT, GEOPOLYGON, HEATMAP, POLYLINE, GEOPOINT_WITH_CLUSTER} = VISUALIZATION_IDS;

        if (
            globalVisualization &&
            isVisualizationWithLayers(globalVisualization) &&
            [GEOPOINT, GEOPOLYGON, HEATMAP, POLYLINE, GEOPOINT_WITH_CLUSTER].includes(
                placeholder.id as VisualizationLayerType,
            )
        ) {
            const selectedLayerIndex = globalVisualization.layers.findIndex(
                ({layerSettings: {id}}) => id === globalVisualization.selectedLayerId,
            );
            const selectedLayer = globalVisualization.layers[selectedLayerIndex];

            let selectedType: string[] = [];

            if (selectedLayer) {
                selectedType = [selectedLayer.layerSettings.type];
            }

            return (
                <Select
                    options={this.getLayerTypeItems()}
                    qa="geotype-select"
                    className={b('geotype-select')}
                    popupClassName={b('geotype-select-popup')}
                    value={selectedType}
                    onUpdate={this.onVisualizationLayerTypeChange}
                />
            );
        }

        return <span>{i18n('wizard', placeholder.title)}</span>;
    };

    private getLayerTypeItems() {
        return GEOTYPES_ITEMS;
    }

    private onVisualizationLayerTypeChange = ([type]: string[]) => {
        this.props.changeVisualizationLayerType(type as VisualizationLayerType);
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        globalVisualization: selectVisualization(state),
        geopointsConfig: selectPointSizeConfig(state),
        extraSettings: selectExtraSettings(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            transformVisualizationItem,
            updatePreviewAndClientChartsConfig,
            setVisualizationPlaceholderItems,
            openDialogPlaceholder,
            setColorsConfig,
            setExtraSettings,
            setPointsSizeConfig,
            openDialogMetric,
            openDialogPointsSize,
            openDialogColors,
            forceDisableTotalsAndPagination,
            openDialogColumnSettings,
            updateFieldColumnSettings,
            changeVisualizationLayerType,
            updateVisualizationPlaceholderItems,
        },
        dispatch,
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(VisualizationPlaceholder);
