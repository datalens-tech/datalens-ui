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
    DatasetSourceAvatar,
} from 'shared';
import type {Permissions} from 'shared/types/dls';

import type {openDialog} from '../../../../store/actions/dialog';
import type {EditorItemToDisplay} from '../../store/types';
import {DIALOG_DS_FIELD_INSPECTOR} from '../dialogs';

import {DisplaySettings} from './components';
import {FieldAction} from './constants';
import {getAggregationSwitchTo, getColumns} from './utils';

import './DatasetTable.scss';

const b = block('dataset-table');
const i18n = I18n.keyset('dataset.dataset-editor.modify');

DataTable.setCustomIcons({
    ICON_ASC: <Icon className={b('sort-icon')} data={ArrowDown} />,
    ICON_DESC: <Icon className={b('sort-icon')} data={ArrowUp} />,
});

type DatasetTableProps = {
    options: DatasetOptions;
    fields: DatasetField[];
    itemsToDisplay: EditorItemToDisplay[];
    validationInProgress: boolean;
    sourceAvatars?: DatasetSourceAvatar[];
    updateField: (data: {
        field: Partial<DatasetField> & {new_id?: string};
        debounce?: boolean;
        validateEnabled?: boolean;
        updatePreview?: boolean;
    }) => void;
    duplicateField: (data: {field: DatasetField}) => void;
    removeField: (data: {field: DatasetField}) => void;
    onClickRow: (data: {field: DatasetField}) => void;
    openRLSDialog: (data: {field: DatasetField}) => void;
    openDialog: typeof openDialog;
    onDisplaySettingsUpdate: (itemsToDisplay: string[]) => void;
    rls: DatasetRls;
    permissions?: Permissions;
};

type DatasetTableState = {
    activeRow?: number;
    editableFieldGuid?: string;
    waitingForOpenFieldEditor?: boolean;
};

class DatasetTable extends React.Component<DatasetTableProps, DatasetTableState> {
    state: DatasetTableState = {
        activeRow: undefined,
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
        const {fields = [], itemsToDisplay} = this.props;

        return (
            <div className={b(null, 'dataset__tab')}>
                <DisplaySettings
                    value={itemsToDisplay}
                    onUpdate={this.props.onDisplaySettingsUpdate}
                />
                <DataTable
                    columns={this.columns}
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
                    rowClassName={(_row, index) => {
                        return b('row', {active: this.state.activeRow === index});
                    }}
                />
            </div>
        );
    }

    get columns() {
        return getColumns({
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
        });
    }

    private setActiveRow = (activeRow?: number) => this.setState({activeRow});

    private handleHiddenUpdate = ({guid, hidden}: DatasetField) => {
        this.props.updateField({
            field: {
                guid,
                hidden: !hidden,
            },
            validateEnabled: false,
            updatePreview: true,
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
