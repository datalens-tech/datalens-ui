import React from 'react';

import {
    ArrowUpArrowDown,
    BarsAscendingAlignLeft,
    BarsDescendingAlignLeft,
    CircleExclamationFill,
    Function,
    Xmark,
} from '@gravity-ui/icons';
import {DropdownMenu, Icon} from '@gravity-ui/uikit';
import {Popover as LegacyPopover} from '@gravity-ui/uikit/legacy';
import type {PopoverInstanceProps} from '@gravity-ui/uikit/legacy';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {SDK} from 'libs';
import {cloneDeep} from 'lodash';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';
import type {
    DatasetField,
    DatasetFieldCalcMode,
    Field,
    PlaceholderSettings,
    Shared,
    Sort,
} from 'shared';
import {
    AxisMode,
    DATASET_FIELD_TYPES,
    DatasetFieldType,
    PlaceholderId,
    QLChartType,
    SortDirection,
    VisualizationItemQa,
    WizardVisualizationId,
    isAllAxisModesAvailable,
    isMeasureName,
    isParameter,
} from 'shared';
import {closeDialog, openDialog} from 'store/actions/dialog';
import type {DatalensGlobalState} from 'ui';
import {getChartType} from 'ui/units/ql/store/reducers/ql';
import {selectExtraSettings} from 'ui/units/wizard/selectors/widget';
import Utils from 'ui/utils/utils';
import {
    createFieldFromVisualization,
    removeQuickFormula,
    updateDatasetByValidation,
    updateFieldFromVisualization,
    updatePreviewWithRerender,
} from 'units/wizard/actions';
import {openHierarchyEditor} from 'units/wizard/actions/hierarchyEditor';
import {updatePreviewAndClientChartsConfig} from 'units/wizard/actions/preview';
import {
    setColorsConfig,
    setShapesConfig,
    setSort,
    updatePlaceholderSettings,
} from 'units/wizard/actions/visualization';
import type {DialogFieldState} from 'units/wizard/components/Dialogs/DialogField/DialogField';
import {DIALOG_FIELD} from 'units/wizard/components/Dialogs/DialogField/DialogField';
import {DIALOG_FIELD_INSPECTOR} from 'units/wizard/components/Dialogs/DialogFieldInspector/DialogFieldInspector';
import {
    AVAILABLE_DATETIMETZ_FORMATS,
    AVAILABLE_DATETIME_FORMATS,
    AVAILABLE_DATE_FORMATS,
    CONFLICT_TOOLTIPS,
    SETTINGS,
} from 'units/wizard/constants';
import {
    selectDataset,
    selectDatasets,
    selectDimensions,
    selectFields,
    selectMeasures,
} from 'units/wizard/selectors/dataset';
import {selectWizardWorkbookId} from 'units/wizard/selectors/settings';
import {
    selectColorsConfig,
    selectShapesConfig,
    selectSort,
} from 'units/wizard/selectors/visualization';
import {getIconForDataType, prepareFieldForUpdate} from 'units/wizard/utils/helpers';
import {v1 as uuidv1} from 'uuid';

import {DIALOG_FIELD_EDITOR} from '../../../../../../components/DialogFieldEditor/DialogFieldEditor';
import {updateVisualizationPlaceholderItems} from '../../../../actions/placeholder';
import {parseFilterDate, parseParameterDefaultValue} from '../../../../utils/wizard';

import './VisualizationItem.scss';

const b = block('wizard-visualization-item');

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface Props extends StateProps, DispatchProps {
    props: any; // DNDItem Props
    sdk: SDK;
    visualization: Shared['visualization'];
    onUpdate?: () => void;
}

interface State {}

class VisualizationItem extends React.Component<Props, State> {
    state = {};

    // eslint-disable-next-line complexity
    render() {
        const {props} = this.props;

        const {item, draggingItem, className, isDragging, noSwap, listNoRemove, showHideLabel} =
            props;

        const itemType = isParameter(item)
            ? DatasetFieldType.Parameter.toLowerCase()
            : item.type?.toLowerCase();

        let resultClassName = className || '';
        resultClassName += item.className ? ` ${item.className}` : ` item ${itemType}-item`;
        resultClassName += item.local ? ' local-item' : '';
        resultClassName += item.formula ? ' formula-item' : '';
        resultClassName += item.conflict ? ' conflict-item' : '';
        resultClassName += item.disabled ? ' disabled-item' : '';

        if (!item.undragable) {
            resultClassName += isDragging ? ' is-dragging' : '';
        }

        const items = [
            {
                action: () => {
                    this.props.actions.openDialog({
                        id: DIALOG_FIELD_INSPECTOR,
                        props: {field: item},
                    });
                },
                text: 'Inspect!',
                hidden: !Utils.isSuperUser() || item.inspectHidden,
            },
        ];

        const swapIsAllowed =
            draggingItem &&
            draggingItem.item &&
            !draggingItem.listNoRemove &&
            ((draggingItem.listAllowedTypes && draggingItem.listAllowedTypes.has(item.type)) ||
                (draggingItem.listCheckAllowed && draggingItem.listCheckAllowed(item))) &&
            ((props.listAllowedTypes && props.listAllowedTypes.has(draggingItem.item.type)) ||
                (props.listCheckAllowed && props.listCheckAllowed(draggingItem.item)));

        const dragHoveredClassName = `drag-hovered ${
            swapIsAllowed ? 'drag-hovered-swap' : 'drag-hovered-remove'
        }`;

        const dataTypeIconData = getIconForDataType(item.data_type);

        const itemTitle = item.fakeTitle || item.title;
        const {rawValues, filterValues} = this.getFilterValues(item);
        const isFilterDisabled = filterValues && item.disabled;
        const isItemParameter = isParameter(item);

        let itemTitleNode;
        if (item.type === 'PSEUDO') {
            itemTitleNode = <span>{itemTitle}</span>;
        } else {
            const titleValueClassName = isFilterDisabled ? '' : 'item-title__value';
            itemTitleNode = (
                <span>
                    <span className={titleValueClassName}>{itemTitle}</span>
                    {filterValues && `: ${filterValues}`}
                    {isItemParameter && `: ${parseParameterDefaultValue(item)}`}
                </span>
            );
        }

        let elementTitle = itemTitle;
        if (item.disabled) {
            elementTitle = `${elementTitle} (${i18n('wizard', 'label_overriden-from-dashboard')})`;
        }

        if (item.datasetName) {
            elementTitle += `\n(${item.datasetName})`;
        }

        if (filterValues) {
            elementTitle += `:\n${filterValues}`;
        }

        const ref = React.createRef<PopoverInstanceProps>();

        const filterCountClassName = isFilterDisabled ? '' : `filter-counter__${itemType}`;
        const additionalTitleClassName = isFilterDisabled ? '' : `filter-title__${itemType}`;
        const itemTitleClassName = `item-title ${additionalTitleClassName}`;
        const shouldShowRemoveIcon = !listNoRemove;

        const showFormulaIcon = item.type !== 'PSEUDO' && !isParameter(item) && !item.formulaHidden;

        return (
            <div
                key={item.id}
                className={`${b()} ${resultClassName}`}
                data-qa={itemTitle}
                onClick={(event) => {
                    if (
                        props.listId === 'filters' ||
                        props.listId === 'layer-filters' ||
                        props.listId === 'dashboard-filters' ||
                        props.listId === 'dashboard-parameters'
                    ) {
                        props.listOnItemClick(event, item);

                        event.stopPropagation();
                    }
                }}
                onDragOver={(e) => {
                    const element = e.currentTarget;

                    if (
                        (item.type === 'PSEUDO' &&
                            item.data_type !== DATASET_FIELD_TYPES.HIERARCHY) ||
                        !(draggingItem && draggingItem.item)
                    ) {
                        return;
                    }

                    const {top, bottom} = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - top;

                    // Imagine a coordinate system in Euclidean space where the y axis is pointing downwards:
                    // 0 is located where the upper edge of the element that we hit with the cursor while dragging something;
                    // elementSize is located where the lower edge of the same element is.
                    // The zone that we consider the trigger for the replay -
                    // this is a zone the size of half of the element from 1/4 of its height to 3/4 of its height.
                    // If we are in this zone, then we add this class
                    const elementSize = bottom - top;
                    const replaceZoneSize = elementSize / 2;

                    const inReplaceZone =
                        replaceZoneSize / 2 < y && y < elementSize - replaceZoneSize / 2;

                    if (inReplaceZone) {
                        let drawReplace;

                        if (props.listAllowedTypes) {
                            const {allowedDataTypes} = props.list.props;
                            drawReplace =
                                (props.listAllowedTypes.has(draggingItem.item.type) &&
                                    !allowedDataTypes) ||
                                (allowedDataTypes &&
                                    allowedDataTypes.has(draggingItem.item.data_type));
                        } else if (props.listCheckAllowed) {
                            drawReplace = props.listCheckAllowed(draggingItem.item);
                        } else {
                            drawReplace = false;
                        }

                        if (drawReplace && element.className.indexOf(dragHoveredClassName) === -1) {
                            element.className += ` ${dragHoveredClassName}`;
                        }
                    } else {
                        element.className = element.className.replace(
                            ` ${dragHoveredClassName}`,
                            '',
                        );
                    }
                }}
                onDragLeave={(e: React.DragEvent<HTMLDivElement>) => {
                    const element = e.currentTarget;
                    const related = e.relatedTarget as Element;

                    // Ignore ondragleave on the cross
                    if (
                        related &&
                        (typeof related.className !== 'string' ||
                            related.className.indexOf('cross-icon') > -1)
                    ) {
                        return false;
                    }

                    element.className = element.className.replace(` ${dragHoveredClassName}`, '');

                    return true;
                }}
                onDrop={(e) => {
                    const element = e.currentTarget;

                    // If there is a required class - trigger the replay
                    if (element.className.indexOf(dragHoveredClassName) > -1) {
                        element.className = element.className.replace(
                            ` ${dragHoveredClassName}`,
                            '',
                        );
                        props.list.doingReplace = true;
                    }
                }}
                onMouseEnter={(e) => {
                    const target = e.target as Element;
                    const isMouseOnTooltip =
                        target && target.classList.contains('tooltip__backdrop');

                    if (item.conflict) {
                        if (isMouseOnTooltip) {
                            ref.current?.closeTooltip();
                        } else {
                            ref.current?.openTooltip();
                        }
                    }
                }}
                onMouseLeave={() => {
                    if (item.conflict) {
                        ref.current?.closeTooltip();
                    }
                }}
                onDoubleClick={() => {
                    if (item.noEdit) {
                        return;
                    }

                    if (item.conflict) {
                        ref.current?.closeTooltip();
                    }

                    if (
                        item.type !== 'PSEUDO' &&
                        item.data_type !== DATASET_FIELD_TYPES.HIERARCHY
                    ) {
                        this.openDialogFieldEditor(item);
                    }
                }}
            >
                <div
                    className={`item-icon ${item.data_type}-icon`}
                    onClick={(event) => {
                        if (isParameter(item)) {
                            return;
                        }

                        if (item.data_type === DATASET_FIELD_TYPES.HIERARCHY) {
                            this.props.actions.openHierarchyEditor(item);
                        }

                        const isPseudoHasSettings =
                            this.props.visualization.id === WizardVisualizationId.PivotTable &&
                            (props.listId === PlaceholderId.PivotTableColumns ||
                                props.listId === PlaceholderId.PivotTableRows);

                        if (item.type === 'PSEUDO' && !isPseudoHasSettings) {
                            return;
                        }

                        if (props.listOnItemClick) {
                            props.listOnItemClick(event, item);

                            event.stopPropagation();

                            return;
                        }

                        if (
                            props.listId === 'filters' ||
                            props.listId === 'layer-filters' ||
                            props.listId === 'dashboard-filters'
                        ) {
                            event.stopPropagation();

                            return;
                        }

                        const extra: Record<string, boolean> = {};
                        if (props.listId === 'labels') {
                            extra.label = true;
                        }

                        extra.title = true;

                        if (showHideLabel && item.type === 'MEASURE') {
                            extra.hideLabel = true;
                        }

                        this.openDialogField(item, extra);

                        event.stopPropagation();
                    }}
                >
                    <Icon data={dataTypeIconData} size={16} />
                </div>
                <div className={itemTitleClassName} title={elementTitle}>
                    {itemTitleNode}
                </div>
                <div className="item-right-icons-container">
                    {items.some(({hidden}) => !hidden) && (
                        <div
                            className="item-right-icon more-icon"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <DropdownMenu
                                size="s"
                                defaultSwitcherProps={{
                                    view: 'flat-secondary',
                                    size: 's',
                                    width: 'max',
                                }}
                                defaultSwitcherClassName="more-icon-switcher"
                                items={items}
                            />
                        </div>
                    )}
                    {showFormulaIcon && (
                        <div
                            data-qa={VisualizationItemQa.FormulaIcon}
                            className="item-right-icon formula-icon"
                            onClick={(event) => {
                                this.openDialogFieldEditor(item);

                                event.stopPropagation();
                            }}
                        >
                            <Icon data={Function} size={14} />
                        </div>
                    )}
                    {!noSwap && (
                        <div className="item-right-icon swap-icon">
                            <Icon data={ArrowUpArrowDown} width="20" />
                        </div>
                    )}
                    {shouldShowRemoveIcon && (
                        <div
                            className="item-right-icon cross-icon"
                            onClick={(event) => {
                                props.onRemoveItemClick(props.index);

                                event.stopPropagation();
                            }}
                            onDoubleClick={(event) => {
                                // This prevents opening edit-dialog on double-clicking cross
                                event.stopPropagation();
                            }}
                        >
                            <Icon data={Xmark} size={16} />
                        </div>
                    )}
                    {rawValues?.length > 1 ? (
                        <div className={`item-right-icon filter-counter ${filterCountClassName}`}>
                            {rawValues.length}
                        </div>
                    ) : null}
                    <div className="item-right-icon error-icon">
                        <Icon data={CircleExclamationFill} size={18} />
                    </div>
                    {item.conflict ? (
                        <LegacyPopover
                            ref={ref}
                            content={i18n(
                                'wizard',
                                CONFLICT_TOOLTIPS[item.conflict as keyof typeof CONFLICT_TOOLTIPS],
                            )}
                        />
                    ) : null}
                    {props.listId === 'sort' ? (
                        <div className="item-right-icon sort-icon" onClick={this.onSortClick(item)}>
                            <Icon
                                data={
                                    item.direction === SortDirection.ASC
                                        ? BarsAscendingAlignLeft
                                        : BarsDescendingAlignLeft
                                }
                                width="14"
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }

    private closeDialogFieldEditor = () => {
        this.props.actions.closeDialog();
    };

    private onSaveDialogFieldEditor = (field: DatasetField) => {
        this.updateField({field: field as Field});

        this.closeDialogFieldEditor();
    };

    private onCreateDialogFieldEditor = (field: DatasetField) => {
        this.createField({field: field as Field});

        this.closeDialogFieldEditor();
    };

    private onSortClick = (item: Sort) => {
        const {sort} = this.props;

        return () => {
            if (item.conflict) {
                return;
            }

            item.direction =
                item.direction === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC;

            this.props.actions.setSort({
                sort,
            });

            this.props.actions.updatePreviewAndClientChartsConfig({});
        };
    };

    private getCastFunction = (dataType: string) => {
        switch (dataType) {
            case 'string':
                return 'str';
            case 'integer':
                return 'int';
            case 'float':
                return 'float';
            case 'boolean':
                return 'bool';
            case 'date':
                return 'date';
            case 'datetime':
                return 'genericdatetime';
            case 'geopoint':
                return 'geopoint';
            case 'geopolygon':
                return 'geopolygon';
            default:
                return 'str';
        }
    };

    private openDialogFieldEditor = (item: Field) => {
        const {fields, dataset, workbookId} = this.props;

        let field;

        if (item.local) {
            if (item.formula) {
                if (item.quickFormula) {
                    item.title = '';
                }

                field = item;
            } else {
                let formula = `[${item.originalTitle || item.title}]`;

                if (item.initial_data_type !== item.data_type) {
                    const cast = this.getCastFunction(item.cast);

                    formula = `${cast}(${formula})`;
                }

                if (item.aggregation !== 'none') {
                    const aggregation =
                        item.aggregation === 'countunique' ? 'countd' : item.aggregation;

                    formula = `${aggregation}(${formula})`;
                }

                field = {
                    ...item,
                    title: '',
                    guid: uuidv1(),
                    fakeTitle: undefined,
                    calc_mode: 'formula' as DatasetFieldCalcMode,
                    formula,
                };
            }
        } else if (item.formula) {
            field = {
                ...item,
                title: '',
                guid: uuidv1(),
                fakeTitle: undefined,
            };
        } else {
            field = {
                ...item,
                title: '',
                guid: uuidv1(),
                fakeTitle: undefined,
                calc_mode: 'formula' as DatasetFieldCalcMode,
                formula: `[${item.originalTitle || item.title}]`,
            };
        }

        const fieldEditorFields = fields.filter(
            (field) => !field.quickFormula && !field.hidden && !field.virtual,
        );

        this.props.actions.openDialog({
            id: DIALOG_FIELD_EDITOR,
            props: {
                datasetContent: dataset?.dataset,
                datasetId: dataset?.id || '',
                workbookId,
                datasetOptions: dataset?.options,

                field,

                fields: fieldEditorFields,
                onlyFormulaEditor: true,
                onClose: this.closeDialogFieldEditor,
                onSave: (dialogItem: Field) => {
                    this.onSaveDialogFieldEditor(dialogItem);

                    if (this.props.onUpdate) {
                        this.props.onUpdate();
                    }
                },
                onCreate: this.onCreateDialogFieldEditor,
            },
        });
    };

    // Without the groupingChanged flag, the following case breaks:
    // - duplicate the formula field of type date|datetime
    // - changing his grouping
    private updateField = async ({
        field,
        groupingChanged,
    }: {
        field: Field;
        groupingChanged?: boolean;
    }) => {
        const editingField = this.props.props.item;

        if (editingField.local && editingField.formula && !editingField.quickFormula) {
            const dataset = this.props.dataset!;

            const preparedField = prepareFieldForUpdate({
                field,
                groupingChanged,
            });

            this.props.actions.updateDatasetByValidation({
                dataset,
                updates: [
                    {
                        action: 'update_field',
                        field: preparedField,
                    },
                ],
            });
        } else {
            const wasQuickFormula = editingField.quickFormula;

            editingField.formula = field.formula;
            editingField.title = field.title;
            editingField.fakeTitle = undefined;
            editingField.cast = undefined;
            editingField.quickFormula = false;

            if (wasQuickFormula) {
                await this.props.actions.removeQuickFormula({
                    field: editingField,
                    needUpdate: false,
                    datasets: this.props.datasets,
                });
            }

            this.props.actions.createFieldFromVisualization({
                field: editingField,
                needUniqueTitle: false,
                quickFormula: false,
            });
        }
    };

    private createField = ({field}: {field: Field}) => {
        const editingField = this.props.props.item;

        editingField.formula = field.formula;
        editingField.title = field.title;
        editingField.fakeTitle = field.fakeTitle;
        editingField.cast = undefined;
        editingField.quickFormula = false;

        this.props.actions.createFieldFromVisualization({
            field: editingField,
            needUniqueTitle: false,
            quickFormula: false,
        });
    };

    private openDialogField = (item: Field, extra: any) => {
        const {visualization, extraSettings, props, qlChartType} = this.props;
        const {dataset} = this.props;

        this.props.actions.openDialog({
            id: DIALOG_FIELD,
            props: {
                item,
                extra,
                visualization,
                placeholderId: this.props.props.listId,
                options: dataset && dataset.options,
                // @ts-ignore
                availableLabelModes: visualization.availableLabelModes,
                formattingEnabled: true,
                onApply: (dialogFieldState: DialogFieldState) => {
                    this.onDialogFieldApply(item, dialogFieldState);

                    if (this.props.onUpdate) {
                        this.props.onUpdate();
                    }
                },
                onCancel: this.closeDialogField,
                extraSettings,
                fieldIndexInSection: props.index,
                markupTypeEnabled: qlChartType !== QLChartType.Monitoringql,
            },
        });
    };

    private closeDialogField = () => {
        this.props.actions.closeDialog();
    };

    // eslint-disable-next-line complexity
    private onDialogFieldApply = async (
        target: Field,
        {
            title,
            cast,
            aggregation,
            format,
            grouping,
            hideLabelMode,
            formatting,
            barsSettings,
            backgroundSettings,
            subTotalsSettings,
            hintSettings,
            markupType,
        }: DialogFieldState,
    ) => {
        const clientsideProperties = {
            title,
            format,
            hideLabelMode,
            formatting,
            barsSettings,
            backgroundSettings,
            subTotalsSettings,
            hintSettings,
            markupType,
        };

        const serversideProperties = {
            cast,
            aggregation,
            grouping,
        };

        const dataset = cloneDeep(this.props.datasets.find((ds) => ds.id === target.datasetId));
        const currentPlaceholderId = this.props.props.listId;
        const placeholder = this.props.visualization.placeholders.find(
            (p) => p.id === currentPlaceholderId,
        );

        if (!dataset && !isMeasureName(target)) {
            console.error('onDialogFieldApply failed');

            return;
        }

        const isClientSidePropertiesChanged = Object.entries(clientsideProperties).some(
            ([key, value]) => target[key as keyof Field] !== value,
        );

        const isServersidePropertiesChanged = Object.entries(serversideProperties).some(
            ([key, value]) => target[key as keyof Field] !== value,
        );

        if ((target.fakeTitle || target.title) !== title) {
            const colorsConfig = this.props.colorsConfig;
            const shapesConfig = this.props.shapesConfig;

            const mountedColors: Record<string, string> = colorsConfig?.mountedColors
                ? {...colorsConfig.mountedColors}
                : {};
            const mountedShapes: Record<string, string> = shapesConfig?.mountedShapes
                ? {...shapesConfig.mountedShapes}
                : {};

            const oldTitle = target.fakeTitle || target.title;
            const newTitle = title || target.title;

            if (mountedColors[oldTitle]) {
                const oldTitleValue = mountedColors[oldTitle];
                delete mountedColors[oldTitle];

                const updatedMountedValues = {
                    ...mountedColors,
                    [newTitle]: oldTitleValue,
                };

                this.props.actions.setColorsConfig({
                    colorsConfig: {...colorsConfig, mountedColors: updatedMountedValues},
                });
            }

            if (mountedShapes[oldTitle]) {
                const oldTitleValue = mountedShapes[oldTitle];
                delete mountedShapes[oldTitle];

                const updatedMountedValues = {
                    ...mountedShapes,
                    [newTitle]: oldTitleValue,
                };
                this.props.actions.setShapesConfig({
                    shapesConfig: {...shapesConfig, mountedShapes: updatedMountedValues},
                });
            }

            target.fakeTitle = title!;
        }

        if (target.format !== format) {
            target.format = format!;
        }

        if (target.cast !== cast) {
            if (cast === 'date' && !AVAILABLE_DATE_FORMATS.includes(String(target.format))) {
                target.format = AVAILABLE_DATE_FORMATS[2];
            } else if (
                cast === 'genericdatetime' &&
                !AVAILABLE_DATETIME_FORMATS.includes(String(target.format))
            ) {
                target.format = AVAILABLE_DATETIME_FORMATS[5];
            } else if (
                cast === 'datetimetz' &&
                !AVAILABLE_DATETIMETZ_FORMATS.includes(String(target.format))
            ) {
                target.format = AVAILABLE_DATETIMETZ_FORMATS[7];
            }

            if (placeholder && cast) {
                const axisModeMap =
                    (placeholder.settings as PlaceholderSettings)?.axisModeMap || {};
                const axisMode = axisModeMap[target.guid] || AxisMode.Discrete;

                if (
                    !isAllAxisModesAvailable({data_type: cast}) &&
                    axisMode === SETTINGS.AXIS_MODE.CONTINUOUS
                ) {
                    this.props.actions.updatePlaceholderSettings(currentPlaceholderId, {
                        axisModeMap: {
                            ...axisModeMap,
                            [target.guid]: SETTINGS.AXIS_MODE.DISCRETE,
                        },
                    });
                }
            }

            target.cast = cast!;
            target.data_type = cast as unknown as DATASET_FIELD_TYPES;
        }

        if (target.grouping !== grouping) {
            target.grouping = grouping;
        }

        if (target.aggregation !== aggregation) {
            target.aggregation = aggregation!;
        }

        if (target.hideLabelMode !== hideLabelMode) {
            target.hideLabelMode = hideLabelMode!;
        }

        if (target.formatting !== formatting) {
            target.formatting = formatting;
        }

        if (barsSettings && target.barsSettings !== barsSettings) {
            target.barsSettings = barsSettings;
        }

        if (backgroundSettings && target.backgroundSettings !== backgroundSettings) {
            target.backgroundSettings = backgroundSettings;
        }

        if (subTotalsSettings && target.subTotalsSettings !== subTotalsSettings) {
            target.subTotalsSettings = subTotalsSettings;
        }

        target.hintSettings = hintSettings;
        target.markupType =
            target.data_type === DATASET_FIELD_TYPES.STRING ? markupType : undefined;

        if (isClientSidePropertiesChanged && !isServersidePropertiesChanged) {
            this.props.actions.updatePreviewWithRerender();
        }

        if (isServersidePropertiesChanged && dataset) {
            if (target.quickFormula) {
                this.props.actions.updateFieldFromVisualization({
                    field: target,
                    dataset,
                });
            } else {
                if (target.quickFormula) {
                    await this.props.actions.removeQuickFormula({
                        field: target,
                        needUpdate: false,
                        datasets: this.props.datasets,
                    });
                }

                this.props.actions.createFieldFromVisualization({
                    field: target,
                });
            }
        }

        this.props.actions.updateVisualizationPlaceholderItems({
            items: placeholder?.items || [],
            options: {item: target, placeholderId: placeholder?.id as PlaceholderId},
        });

        this.closeDialogField();
    };

    private getFilterValues = (item: Field): {rawValues: string[]; filterValues: string} => {
        const {filter, data_type} = item;

        if (!filter || !filter?.value?.length) {
            return {rawValues: [], filterValues: ''};
        } else if (filter?.value.length === 1 && filter?.value?.[0] === '') {
            return {
                rawValues: [],
                filterValues: i18n('component.operations', 'label_operation-all-values'),
            };
        }

        const rawValues = Array.isArray(filter.value) ? filter.value : [filter.value];

        let filterValues: string;
        if (
            data_type === DATASET_FIELD_TYPES.DATE ||
            data_type === DATASET_FIELD_TYPES.GENERICDATETIME
        ) {
            filterValues = parseFilterDate(item);
        } else {
            filterValues = rawValues.join(',');
        }

        return {
            rawValues,
            filterValues,
        };
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        sort: selectSort(state),
        fields: selectFields(state),
        dataset: selectDataset(state),
        dimensions: selectDimensions(state),
        measures: selectMeasures(state),
        datasets: selectDatasets(state),
        colorsConfig: selectColorsConfig(state),
        shapesConfig: selectShapesConfig(state),
        extraSettings: selectExtraSettings(state),
        workbookId: selectWizardWorkbookId(state),
        qlChartType: getChartType(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        actions: bindActionCreators(
            {
                updatePreviewAndClientChartsConfig,
                setSort,
                openHierarchyEditor,
                openDialog,
                closeDialog,
                updateFieldFromVisualization,
                createFieldFromVisualization,
                setShapesConfig,
                setColorsConfig,
                updatePreviewWithRerender,
                updateDatasetByValidation,
                removeQuickFormula,
                updatePlaceholderSettings,
                updateVisualizationPlaceholderItems,
            },
            dispatch,
        ),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(VisualizationItem);
