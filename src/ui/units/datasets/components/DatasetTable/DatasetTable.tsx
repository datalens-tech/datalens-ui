import React from 'react';

import {ArrowDown, ArrowUp} from '@gravity-ui/icons';
import DataTable from '@gravity-ui/react-data-table';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {get} from 'lodash';
import type {
    DATASET_FIELD_TYPES,
    DatasetField,
    DatasetFieldAggregation,
    DatasetOptions,
    DatasetRls,
    DatasetSelectionMap,
    DatasetSourceAvatar,
} from 'shared';
import type {Permissions} from 'shared/types/dls';

import type {
    OpenDialogConfirmArguments,
    closeDialog,
    openDialog,
    openDialogConfirm,
} from '../../../../store/actions/dialog';
import type {EditorItemToDisplay} from '../../store/types';
import {DIALOG_DS_FIELD_INSPECTOR} from '../dialogs';

import {DisplaySettings} from './components';
import {BatchActionPanel} from './components/BatchActionPanel/BatchActionPanel';
import {ObservedTableResizer} from './components/ObservedDataTable';
import {BatchFieldAction, FieldAction} from './constants';
import {getAggregationSwitchTo, getColumns, isHiddenSupported} from './utils';

import './DatasetTable.scss';

const b = block('dataset-table');
const i18n = I18n.keyset('dataset.dataset-editor.modify');

DataTable.setCustomIcons({
    ICON_ASC: <Icon className={b('sort-icon')} data={ArrowDown} />,
    ICON_DESC: <Icon className={b('sort-icon')} data={ArrowUp} />,
});

type UpdatePayload = {
    debounce?: boolean;
    validateEnabled?: boolean;
    updatePreview?: boolean;
};

type DatasetTableProps = {
    options: DatasetOptions;
    fields: DatasetField[];
    itemsToDisplay: EditorItemToDisplay[];
    validationInProgress: boolean;
    sourceAvatars?: DatasetSourceAvatar[];
    updateField: (
        data: UpdatePayload & {
            field: Partial<DatasetField> & {new_id?: string};
        },
    ) => void;
    batchUpdateFields: (
        data: UpdatePayload & {
            fields: Partial<DatasetField>[] & {new_id?: string}[];
        },
    ) => void;
    duplicateField: (data: {field: DatasetField}) => void;
    removeField: (data: {field: DatasetField}) => void;
    batchRemoveFields: (data: {fields: DatasetField[]}) => void;
    onClickRow: (data: {field: DatasetField}) => void;
    openRLSDialog: (data: {field: DatasetField}) => void;
    openDialog: typeof openDialog;
    openDialogConfirm: typeof openDialogConfirm;
    closeDialog: typeof closeDialog;
    onDisplaySettingsUpdate: (itemsToDisplay: string[]) => void;
    rls: DatasetRls;
    permissions?: Permissions;
    vertical?: boolean;
};

type DatasetTableState = {
    activeRow?: number;
    selectedRows: DatasetSelectionMap;
    editableFieldGuid?: string;
    waitingForOpenFieldEditor?: boolean;
};

class DatasetTable extends React.Component<DatasetTableProps, DatasetTableState> {
    state: DatasetTableState = {
        activeRow: undefined,
        selectedRows: {},
        editableFieldGuid: undefined,
        waitingForOpenFieldEditor: false,
    };

    componentDidUpdate(prevProps: DatasetTableProps) {
        const {editableFieldGuid, waitingForOpenFieldEditor} = this.state;

        if (prevProps.validationInProgress && !this.props.validationInProgress) {
            const editableField = this.props.fields.find(({guid}) => guid === editableFieldGuid);

            if (waitingForOpenFieldEditor && editableField) {
                this.props.onClickRow({field: editableField});
            }

            this.setState({
                editableFieldGuid: undefined,
                waitingForOpenFieldEditor: false,
            });
        }
    }

    render() {
        const {fields = [], itemsToDisplay, vertical} = this.props;
        const {activeRow} = this.state;
        const {
            count: selectedCount,
            map: selectedRows,
            canBeHidden,
            canBeShown,
        } = this.getFilteredSelectedRows();

        return (
            <React.Fragment>
                <div className={b(null, 'dataset__tab')}>
                    <DisplaySettings
                        value={itemsToDisplay}
                        onUpdate={this.props.onDisplaySettingsUpdate}
                    />
                    <ObservedTableResizer
                        columns={this.getColumns(selectedRows)}
                        data={fields}
                        emptyDataMessage={i18n('label_no-data')}
                        settings={{
                            stickyHead: DataTable.MOVING,
                            stickyTop: 0,
                            dynamicRender: true,
                            dynamicRenderThreshold: 0,
                            dynamicRenderUseStaticSize: true,
                            syncHeadOnResize: true,
                            highlightRows: true,
                            stripedRows: false,
                            displayIndices: false,
                        }}
                        theme={'dataset'}
                        rowClassName={(row, index) => {
                            return b('row', {
                                active: activeRow === index,
                                selected: selectedRows[row.guid],
                            });
                        }}
                    />
                </div>

                {selectedCount > 0 && (
                    <BatchActionPanel
                        className={b('batch-actions', {vertical})}
                        count={selectedCount}
                        onClose={this.resetSelection}
                        onAction={this.handleBatchUpdate}
                        disableActions={[
                            ...(canBeHidden.count > 0 ? [] : (['hide'] as const)),
                            ...(canBeShown.count > 0 ? [] : (['show'] as const)),
                        ]}
                    />
                )}
            </React.Fragment>
        );
    }

    private getFilteredSelectedRows() {
        const {selectedRows} = this.state;
        const {fields} = this.props;

        let count = 0;
        const canBeHidden: {count: number; fields: DatasetField[]} = {count: 0, fields: []};
        const canBeShown: {count: number; fields: DatasetField[]} = {count: 0, fields: []};
        const filteredFields: DatasetField[] = [];

        const map = fields.reduce<DatasetSelectionMap>((memo, field) => {
            const {guid} = field;
            if (!selectedRows[guid]) {
                return memo;
            }

            count++;
            // eslint-disable-next-line no-param-reassign
            memo[guid] = true;
            filteredFields.push(field);

            if (isHiddenSupported(field)) {
                if (field.hidden) {
                    canBeShown.count++;
                    canBeShown.fields.push(field);
                } else {
                    canBeHidden.count++;
                    canBeHidden.fields.push(field);
                }
            }

            return memo;
        }, {});

        return {count, map, fields: filteredFields, canBeHidden, canBeShown};
    }

    private getColumns(selectedRows: DatasetSelectionMap = {}) {
        return getColumns({
            selectedRows,
            avatars: this.props.sourceAvatars,
            rls: this.props.rls,
            permissions: this.props.permissions,
            fields: get(this.props, ['options', 'fields', 'items']),
            showFieldsId: this.props.itemsToDisplay.includes('fieldsId'),
            setActiveRow: this.setActiveRow,
            openDialogFieldEditor: this.openDialogFieldEditor,
            handleTitleUpdate: this.handleTitleUpdate,
            handleIdUpdate: this.handleIdUpdate,
            handleHiddenUpdate: this.handleHiddenUpdate,
            handleRlsUpdate: this.handleRlsUpdate,
            handleTypeSelectUpdate: this.handleTypeSelectUpdate,
            handleAggregationSelectUpdate: this.handleAggregationSelectUpdate,
            handleDescriptionUpdate: this.handleDescriptionUpdate,
            handleMoreActionClick: this.handleMoreActionClick,
            onSelectChange: this.onSelectChange,
        });
    }

    private resetSelection = () => {
        this.setState({selectedRows: {}});
    };

    private onSelectChange = (isSelected: boolean, guids: (keyof DatasetSelectionMap)[]) => {
        const selectedRows = {...this.state.selectedRows};

        guids.forEach((guid) => {
            if (isSelected) {
                selectedRows[guid] = true;
            } else {
                delete selectedRows[guid];
            }
        });

        this.setState({
            selectedRows,
        });
    };

    private setActiveRow = (activeRow?: number) => this.setState({activeRow});

    private batchConfirmDialog = (
        options: Partial<OpenDialogConfirmArguments> &
            Pick<
                OpenDialogConfirmArguments,
                'onApply' | 'message' | 'confirmHeaderText' | 'confirmButtonText'
            >,
    ) => {
        this.props.openDialogConfirm({
            cancelButtonText: i18n('button_batch-cancel'),
            onCancel: this.props.closeDialog,
            cancelButtonView: 'flat',
            confirmButtonView: 'normal',
            isWarningConfirm: true,
            showIcon: false,
            confirmOnEnterPress: true,
            ...options,
        });
    };

    private openBatchRemoveDialog = (fields: DatasetField[]) => {
        this.batchConfirmDialog({
            onApply: () => {
                this.props.batchRemoveFields({fields});
                this.props.closeDialog();
            },
            message: i18n('text_batch-remove-message'),
            confirmHeaderText: i18n('text_batch-remove-header'),
            confirmButtonText: i18n('button_batch-remove'),
        });
    };

    private openBatchToggleVisibilityDialog = (fields: DatasetField[], hidden: boolean) => {
        this.batchConfirmDialog({
            onApply: () => {
                this.props.batchUpdateFields({
                    validateEnabled: false,
                    updatePreview: true,
                    fields: fields.map(({guid}) => ({
                        guid,
                        hidden,
                    })),
                });
                this.resetSelection();
                this.props.closeDialog();
            },
            message: hidden ? i18n('text_batch-hide-message') : i18n('text_batch-show-message'),
            confirmHeaderText: hidden
                ? i18n('text_batch-hide-header')
                : i18n('text_batch-show-header'),
            confirmButtonText: hidden ? i18n('button_batch-hide') : i18n('button_batch-show'),
        });
    };

    private handleBatchUpdate = (action: BatchFieldAction) => {
        const {fields, canBeShown, canBeHidden} = this.getFilteredSelectedRows();

        switch (action) {
            case BatchFieldAction.Remove: {
                this.openBatchRemoveDialog(fields);
                return;
            }

            case BatchFieldAction.Hide: {
                this.openBatchToggleVisibilityDialog(canBeHidden.fields, true);
                return;
            }

            case BatchFieldAction.Show: {
                this.openBatchToggleVisibilityDialog(canBeShown.fields, false);
                return;
            }

            default: {
                return;
            }
        }
    };

    private handleHiddenUpdate = ({guid, hidden}: DatasetField) => {
        this.props.updateField({
            field: {
                guid,
                hidden: !hidden,
            },
            validateEnabled: false,
            updatePreview: true,
            debounce: true,
        });
    };

    private handleRlsUpdate = (field: DatasetField) => {
        this.props.openRLSDialog({field});
    };

    private handleTitleUpdate = ({guid}: DatasetField, title: string) => {
        this.setState({editableFieldGuid: guid});
        this.props.updateField({field: {guid, title}});
    };

    private handleIdUpdate = ({guid}: DatasetField, newId: string) => {
        this.setState({editableFieldGuid: newId});
        this.props.updateField({field: {guid, new_id: newId}});
    };

    private handleDescriptionUpdate = ({guid}: DatasetField, description: string) => {
        this.props.updateField({
            field: {
                guid,
                description,
            },
            validateEnabled: false,
        });
    };

    private handleTypeSelectUpdate = (
        {guid, aggregation}: DatasetField,
        cast: DATASET_FIELD_TYPES,
    ) => {
        this.props.updateField({
            field: {
                guid,
                cast,
                aggregation: getAggregationSwitchTo(this.props.options, aggregation, cast),
            },
            debounce: true,
        });
    };

    private handleAggregationSelectUpdate = (
        {guid}: DatasetField,
        aggregation: DatasetFieldAggregation,
    ) => {
        this.props.updateField({
            field: {
                guid,
                aggregation,
            },
            debounce: true,
        });
    };

    private openDialogFieldEditor = (field: DatasetField) => {
        const {validationInProgress, onClickRow} = this.props;
        const {editableFieldGuid} = this.state;
        const openUpdatingField = field.guid === editableFieldGuid;

        if (validationInProgress && openUpdatingField) {
            this.setState({waitingForOpenFieldEditor: true});
        } else {
            onClickRow({field});
        }
    };

    private handleMoreActionClick = ({
        action,
        field,
    }: {
        action: FieldAction;
        field: DatasetField;
    }) => {
        switch (action) {
            case FieldAction.Duplicate: {
                this.props.duplicateField({field});
                break;
            }
            case FieldAction.Edit: {
                this.openDialogFieldEditor(field);
                break;
            }
            case FieldAction.Rls: {
                this.props.openRLSDialog({field});
                break;
            }
            case FieldAction.Inspect: {
                this.props.openDialog({id: DIALOG_DS_FIELD_INSPECTOR, props: {field}});
                break;
            }
            case FieldAction.Remove: {
                this.props.removeField({field});
                break;
            }
        }
    };
}

export default DatasetTable;
