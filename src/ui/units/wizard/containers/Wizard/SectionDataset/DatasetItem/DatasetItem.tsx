import React from 'react';

import {Function, Link as LinkIcon, PencilToSquare} from '@gravity-ui/icons';
import type {DropdownMenuItem} from '@gravity-ui/uikit';
import {DropdownMenu, Icon, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {DatasetField, Field, HierarchyField, Link, Update} from 'shared';
import {
    DATASET_FIELD_TYPES,
    DatasetFieldType,
    DatasetItemActionsQa,
    SectionDatasetQA,
    isParameter,
} from 'shared';
import {openDialog, openDialogParameter} from 'store/actions/dialog';
import type {DatalensGlobalState} from 'ui';
import {DIALOG_FIELD_INSPECTOR} from 'units/wizard/components/Dialogs/DialogFieldInspector/DialogFieldInspector';
import {
    selectDataset,
    selectDatasetId,
    selectOriginalParameters,
} from 'units/wizard/selectors/dataset';
import {selectUpdates, selectUpdatesByFieldId} from 'units/wizard/selectors/preview';
import {getIconForDataType} from 'units/wizard/utils/helpers';
import Utils from 'utils';

import {updateDatasetByValidation} from '../../../../actions';
import {setUpdates} from '../../../../actions/preview';
import type {WizardDispatch} from '../../../../reducers';

import './DatasetItem.scss';

type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type StateProps = ReturnType<typeof mapStateToProps>;

export type DatasetItemProps = {
    dndProps: Record<string, any>; // DNDItem Props
    links: Link[];
    removeHierarchy: (field: HierarchyField) => void;
    openHierarchyEditor: (field: HierarchyField) => void;
    openDialogField: (
        item: Field,
        extra: {
            title?: boolean;
            label?: string;
            hideLabel?: boolean;
        },
    ) => void;
    onClickEditDatasetItem: (item: Field) => void;
    onClickDuplicateDatasetItem: (item: Field) => void;
    openDialogMultidataset: () => void;
    onClickRemoveDatasetItem: (item: Field) => void;
    openDialog: typeof openDialog;
};

type DatasetItemInnerProps = DatasetItemProps & DispatchProps & StateProps;

const b = block('wizard-dataset-item');

class DatasetItem extends React.Component<DatasetItemInnerProps> {
    itemRef = React.createRef<HTMLElement>();
    render() {
        const {item} = this.props.dndProps;

        const itemTitle = item.fakeTitle || item.title;
        const itemTitleAndDescription = item.description
            ? `${item.title}\n\n${item.description}`
            : itemTitle;

        const isLinked = this.getIsLinked();
        const isItemParameter = isParameter(item);
        const isDatasetParameter = isItemParameter && !item.local;

        const menuItems = this.getItems();
        const needToShowMoreButton = menuItems.some((menuItem) => !menuItem.hidden);
        const hasParameterChanged = this.props.datasetItemUpdates.length > 0;

        const showFormulaIcon =
            item.type !== 'PSEUDO' &&
            !isParameter(item) &&
            item.data_type !== DATASET_FIELD_TYPES.HIERARCHY;

        return (
            <div
                className={`${b()} ${this.getClassName()}`}
                title={itemTitleAndDescription}
                ref={this.itemRef as React.RefObject<HTMLDivElement>}
                data-qa={itemTitle}
            >
                <div
                    className={`${b('item-icon')} ${item.data_type}-icon`}
                    data-qa={SectionDatasetQA.ItemIcon}
                    onClick={() => {
                        if (item.data_type === DATASET_FIELD_TYPES.HIERARCHY) {
                            this.props.openHierarchyEditor(item);
                        }

                        if (item.type === 'PSEUDO') {
                            return;
                        }

                        if (isItemParameter) {
                            this.props.openDialogParameter({
                                type: isDatasetParameter ? 'edit-default-value' : 'edit',
                                field: item,
                                onApply: (field: DatasetField) =>
                                    this.handleApplyDialogParameter(field, item),
                                onReset: this.handleResetDialogParameter,
                            });
                            return;
                        }

                        const extra = {
                            title: Boolean(item.local),
                        };

                        this.props.openDialogField(item, extra);
                    }}
                >
                    <Icon data={this.getItemIcon()} width="16" height="16" />
                </div>
                <div
                    className={`${b('item-title')}`}
                    data-qa={SectionDatasetQA.ItemTitle}
                    title={itemTitleAndDescription}
                >
                    {itemTitle}
                    {isLinked && (
                        <div
                            className={`${b('item-link-icon')}`}
                            onClick={this.props.openDialogMultidataset}
                        >
                            <Icon data={LinkIcon} width="16" height="16" />
                        </div>
                    )}
                </div>
                <div className={`${b('item-right-icons-container')}`}>
                    {showFormulaIcon && (
                        <div
                            className={`${b('item-formula-icon')}`}
                            onClick={() => {
                                this.props.onClickEditDatasetItem(item);
                            }}
                            data-qa={SectionDatasetQA.ItemFunction}
                        >
                            <Icon data={Function} size={14} />
                        </div>
                    )}
                    {isDatasetParameter && hasParameterChanged && (
                        <Popover
                            content={i18n('wizard', 'tooltip_parameter-changed-icon')}
                            hasArrow={false}
                            placement="bottom"
                            offset={{mainAxis: -5, crossAxis: 0}}
                        >
                            {
                                // title is made an empty string in order to override the parent title.
                                // Otherwise, it turns out that a tooltip with a hint is shown and a title of the entire field is also shown on top
                            }
                            <div className={`${b('item-formula-icon')}`} title="">
                                <Icon data={PencilToSquare} size={14} />
                            </div>
                        </Popover>
                    )}
                    <div
                        className={`${b('item-more-icon')}`}
                        onMouseEnter={(e) => {
                            this.addIgnoreDrag(e.currentTarget.parentElement);
                        }}
                        onMouseLeave={(e) => {
                            this.removeIgnoreDrag(e.currentTarget.parentElement);
                        }}
                    >
                        {needToShowMoreButton && (
                            <DropdownMenu
                                size="s"
                                defaultSwitcherProps={{
                                    qa: SectionDatasetQA.FieldActions,
                                    size: 's',
                                    width: 'max',
                                }}
                                items={menuItems}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    getClassName() {
        const {item, className, isDragging} = this.props.dndProps;
        let resultClassName = '';

        const itemType = isParameter(item)
            ? DatasetFieldType.Parameter.toLowerCase()
            : item.type?.toLowerCase();

        resultClassName += item.formula && !item.asPseudo ? ' formula-item' : '';
        resultClassName += className || '';
        resultClassName += item.className ? ` ${item.className}` : ` item ${itemType}-item`;
        resultClassName += isDragging ? ' is-dragging' : '';
        resultClassName += item.local && !item.asPseudo ? ' local-item' : '';
        resultClassName += item.asPseudo ? ' pseudo-item' : '';

        if (item.type !== 'PSEUDO' || item.data_type === DATASET_FIELD_TYPES.HIERARCHY) {
            resultClassName += item.valid ? '' : ' item-error';
        }

        return resultClassName;
    }

    getItemIcon() {
        const {item} = this.props.dndProps;
        return getIconForDataType(item.data_type);
    }

    getIsLinked() {
        const {links, dndProps} = this.props;
        const item = dndProps.item;

        if (links.length) {
            return links.some((link: Link) => {
                const linkWithThisDataset = link.fields[item.datasetId];
                return linkWithThisDataset && linkWithThisDataset.field.guid === item.guid;
            });
        } else {
            return false;
        }
    }

    getItems(): DropdownMenuItem[] {
        const {item} = this.props.dndProps;
        const isItemParameter = isParameter(item);
        const isDatasetParameter = isItemParameter && !item.local;

        return [
            {
                action: async () => {
                    if (window.confirm(i18n('wizard', 'toast_confirm-remove-item'))) {
                        this.removeIgnoreDrag(this.itemRef.current);
                        this.props.onClickRemoveDatasetItem(item);
                    }
                },
                qa: DatasetItemActionsQa.RemoveField,
                text: i18n('wizard', 'button_remove'),
                hidden: !item.local,
            },
            {
                action: () => {
                    this.props.removeHierarchy(item as HierarchyField);
                },
                qa: 'dropdown-field-menu-hierarchy-remove',
                text: i18n('wizard', 'button_remove'),
                hidden: item.data_type !== DATASET_FIELD_TYPES.HIERARCHY,
            },
            {
                action: () => {
                    this.props.openHierarchyEditor(item as HierarchyField);
                },
                qa: 'dropdown-field-menu-hierarchy-edit',
                text: i18n('wizard', 'button_edit'),
                hidden: item.data_type !== DATASET_FIELD_TYPES.HIERARCHY,
            },
            {
                action: () => {
                    this.removeIgnoreDrag(this.itemRef.current);

                    this.props.onClickDuplicateDatasetItem(item);
                },
                qa: 'dropdown-field-menu-duplicate',
                text: i18n('wizard', 'button_duplicate'),
                hidden: item.data_type === DATASET_FIELD_TYPES.HIERARCHY || isItemParameter,
            },
            {
                action: () => {
                    this.removeIgnoreDrag(this.itemRef.current);

                    this.props.onClickEditDatasetItem(item);
                },
                qa: 'dropdown-field-menu-edit',
                text: i18n('wizard', 'button_edit'),
                hidden: !item.local || item.calc_mode !== 'formula',
            },
            {
                action: () => {
                    this.props.openDialogParameter({
                        type: isDatasetParameter ? 'edit-default-value' : 'edit',
                        field: item,
                        onApply: (field: DatasetField) =>
                            this.handleApplyDialogParameter(field, item),
                        onReset: this.handleResetDialogParameter,
                    });
                },
                qa: 'dropdown-field-menu-edit-parameter',
                text: i18n('wizard', 'button_edit'),
                hidden: !isParameter(item),
            },
            {
                action: () => {
                    this.props.openDialog({id: DIALOG_FIELD_INSPECTOR, props: {field: item}});
                },
                qa: 'dropdown-field-menu-inspect',
                text: 'Inspect!',
                hidden: !Utils.isSuperUser(),
            },
        ];
    }

    handleApplyDialogParameter = (updatedField: DatasetField, initialField: Field) => {
        const {dataset, originalParameters} = this.props;

        if (!dataset) {
            return;
        }

        const originalParameter = originalParameters.find(
            (originalField) => originalField.guid === updatedField.guid,
        );

        // When the field was reset to the value from the dataset, then we need to send an update
        // In order not to change the dataset with your hands, but to do it honestly through the back
        // But we don't need the update itself, since it doesn't make any sense
        // After validation, the field will be the same as in the dataset.
        // Therefore, we will delete all updates with this flag in updateDatasetByValidation before putting them in the store and config
        const deleteUpdateAfterValidation =
            originalParameter &&
            String(originalParameter.default_value) === String(updatedField.default_value);

        let updates: Update[];

        if (updatedField.guid === initialField.guid) {
            updates = [
                {
                    action: 'update_field',
                    field: updatedField,
                    deleteUpdateAfterValidation,
                },
            ];
        } else {
            // We need to update both guid and title at once. Since title === guid, and the backend can't do that.
            // Therefore, we first update the guid and the title and the rest of the field with a separate update
            updates = [
                // Updating the guid first
                {
                    action: 'update_field',
                    field: {
                        ...updatedField,
                        guid: initialField.guid,
                        new_id: updatedField.guid,
                    },
                },
                // And then the whole field is completely
                {
                    action: 'update_field',
                    field: updatedField,
                },
            ];
        }

        this.props.updateDatasetByValidation({
            dataset,
            updates,
        });
    };

    handleResetDialogParameter = (fieldId: string): DatasetField | undefined => {
        const {originalParameters, updates} = this.props;

        const filteredUpdates = updates.filter((update) => update.field.guid !== fieldId);

        this.props.setUpdates({updates: filteredUpdates});

        return originalParameters.find((originalField) => originalField.guid === fieldId);
    };

    removeIgnoreDrag(element: HTMLElement | null) {
        if (!element) {
            return;
        }
        element.className = element.className.replace(' ignore-drag', '');
    }

    addIgnoreDrag(element: HTMLElement | null) {
        if (!element) {
            return;
        }
        element.className += ' ignore-drag';
    }
}

const mapDispatchToProps = (dispatch: WizardDispatch) => {
    return bindActionCreators(
        {
            openDialogParameter,
            updateDatasetByValidation,
            openDialog,
            setUpdates,
        },
        dispatch,
    );
};

const mapStateToProps = (state: DatalensGlobalState, ownProps: DatasetItemProps) => {
    const currentDatasetId = selectDatasetId(state) || '';
    const item = ownProps.dndProps.item;

    return {
        dataset: selectDataset(state),
        originalParameters: selectOriginalParameters(state, currentDatasetId),
        updates: selectUpdates(state),
        datasetItemUpdates: selectUpdatesByFieldId(state, item.guid),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(DatasetItem);
