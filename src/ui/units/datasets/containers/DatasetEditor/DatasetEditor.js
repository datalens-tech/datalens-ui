import React from 'react';

import block from 'bem-cn-lite';
import _debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {compose} from 'recompose';
import {createStructuredSelector} from 'reselect';
import {selectDebugMode} from 'ui/store/selectors/user';
import {
    addField,
    batchDeleteFields,
    batchUpdateFields,
    duplicateField,
    editorSetItemsToDisplay,
    toggleFieldEditorModuleLoader,
    toggleSaveDataset,
    updateDatasetByValidation,
    updateField,
    updateRLS,
} from 'units/datasets/store/actions/creators';

import {DIALOG_FIELD_EDITOR} from '../../../../components/DialogFieldEditor/DialogFieldEditor';
import {CounterName, GoalId, reachMetricaGoal} from '../../../../libs/metrica';
import {closeDialog, openDialog, openDialogConfirm} from '../../../../store/actions/dialog';
import DatasetTable from '../../components/DatasetTable/DatasetTable';
import RLSDialog from '../../components/RLSDialog/RLSDialog';
import {DATASET_VALIDATION_TIMEOUT} from '../../constants';
import {
    UISelector,
    avatarsSelector,
    datasetContentSelector,
    datasetFieldsSelector,
    datasetPermissionsSelector,
    datasetValidationSelector,
    editorFilterSelector,
    editorItemsToDisplaySelector,
    filteredDatasetFieldsSelector,
    filteredDatasetParametersSelector,
    optionsSelector,
    previewEnabledSelector,
    rlsSelector,
    sourcesSelector,
    typesSelector,
    workbookIdSelector,
} from '../../store/selectors/dataset';

import {getFilteredFields, isShowHiddenFieldsUpdated} from './utils';

import './DatasetEditor.scss';

const b = block('dataset-editor');

class DatasetEditor extends React.Component {
    state = {
        isFieldEditorVisible: false,
        isShowHiddenFieldsAlreadyClicked: false,
        field: null,
        updates: [],
        visibleRLSDialog: false,
        currentRLSField: '',
    };

    get filteredFields() {
        const {fields, filter, itemsToDisplay, dlDebugMode} = this.props;

        return getFilteredFields({
            fields,
            filter,
            dlDebugMode,
            showHidden: itemsToDisplay.includes('hiddenFields'),
        });
    }

    handleItemsToDisplayUpdate = (itemsToDisplay) => {
        const showHiddenFieldsUpdated = isShowHiddenFieldsUpdated(
            this.props.itemsToDisplay,
            itemsToDisplay,
        );

        if (showHiddenFieldsUpdated) {
            const goalId = this.state.isShowHiddenFieldsAlreadyClicked
                ? GoalId.ShowHiddenFieldsSecondClick
                : GoalId.ShowHiddenFieldsFirstClick;

            reachMetricaGoal(CounterName.Main, goalId);

            if (!this.state.isShowHiddenFieldsAlreadyClicked) {
                this.setState({isShowHiddenFieldsAlreadyClicked: true});
            }
        }

        this.props.editorSetItemsToDisplay(itemsToDisplay);
    };

    openDialogFieldEditor = async ({field} = {}) => {
        const {fields, parameters, dataset, datasetId, options, types, workbookId} = this.props;

        const fieldsWithParameters = [...fields, ...parameters];

        this.props.openDialog({
            id: DIALOG_FIELD_EDITOR,
            props: {
                datasetContent: dataset,
                datasetId,
                workbookId,
                datasetOptions: options,
                field,
                fields: fieldsWithParameters,
                dataTypes: types,
                onlyFormulaEditor: false,
                onClose: this.closeDialogFieldEditor,
                onSave: this.onSaveDialogFieldEditor,
                onCreate: this.onCreateDialogFieldEditor,
                onLoadStart: () => {
                    this.props.toggleFieldEditorModuleLoader(true);
                },
                onLoadComplete: () => {
                    this.props.toggleFieldEditorModuleLoader(false);
                },
            },
        });

        this.setState({
            field,
            isFieldEditorVisible: true,
        });
    };

    closeDialogFieldEditor = () => {
        this.props.closeDialog();
    };

    debouncedUpdate = _debounce(this.props.updateDatasetByValidation, DATASET_VALIDATION_TIMEOUT);

    updateDataset = ({debounce, updatePreview, validateEnabled}) => {
        if (debounce) {
            this.debouncedUpdate({
                updatePreview,
                validateEnabled,
            });
        } else {
            this.props.updateDatasetByValidation({
                updatePreview,
                validateEnabled,
            });
        }
    };

    batchModifyFields = ({
        actionType,
        fields,
        debounce = false,
        updatePreview = false,
        validateEnabled = true,
    }) => {
        if (fields.length > 0 && fields.every(({guid}) => guid)) {
            this.props.toggleSaveDataset({enable: !validateEnabled, validationPending: debounce});

            switch (actionType) {
                case 'delete': {
                    this.props.batchDeleteFields(fields);

                    this.updateDataset({
                        debounce,
                        updatePreview,
                        validateEnabled,
                    });

                    break;
                }
                case 'update': {
                    this.props.batchUpdateFields(fields);

                    this.updateDataset({
                        debounce,
                        updatePreview,
                        validateEnabled,
                    });

                    break;
                }
            }
        }
    };

    modifyFields = ({actionType, field, updatePreview = false, validateEnabled = true}) => {
        if (field.guid) {
            this.props.toggleSaveDataset({enable: !validateEnabled});

            switch (actionType) {
                case 'duplicate': {
                    this.props.duplicateField(field);

                    this.updateDataset({
                        debounce: true,
                        updatePreview,
                        validateEnabled,
                    });

                    break;
                }
                case 'add': {
                    this.props.addField(field);

                    this.updateDataset({
                        debounce: false,
                        updatePreview,
                        validateEnabled,
                    });

                    break;
                }
            }
        }
    };

    updateField = ({field, ...data}) => {
        this.batchModifyFields({
            ...data,
            fields: [field],
            updatePreview: true,
            actionType: 'update',
        });
    };

    removeField = ({field, ...data}) => {
        this.batchModifyFields({
            ...data,
            fields: [field],
            actionType: 'delete',
            updatePreview: true,
            debounce: true,
        });
    };

    addField = (data) => {
        this.modifyFields({
            ...data,
            actionType: 'add',
        });
    };

    duplicateField = (data) => {
        this.modifyFields({
            ...data,
            actionType: 'duplicate',
            updatePreview: true,
        });
    };

    batchRemoveFields = (data) => {
        this.batchModifyFields({
            ...data,
            actionType: 'delete',
            updatePreview: true,
        });
    };

    batchUpdateFields = (data) => {
        this.batchModifyFields({
            ...data,
            actionType: 'update',
            updatePreview: true,
        });
    };

    onSaveDialogFieldEditor = (field) => {
        this.updateField({
            field,
            updatePreview: true,
        });

        this.closeDialogFieldEditor();
    };

    onCreateDialogFieldEditor = (field) => {
        this.addField({
            field,
            updatePreview: true,
        });

        this.closeDialogFieldEditor();
    };

    openRLSDialog = ({field}) => {
        const {rls} = this.props;
        const {guid} = field;

        if (rls && guid) {
            const rlsField = rls[guid] || '';

            this.setState({
                visibleRLSDialog: true,
                currentRLSField: rlsField,
                field,
            });
        }
    };

    closeRLSDialog = () => {
        this.setState({
            visibleRLSDialog: false,
            currentRLSField: '',
            field: null,
        });
    };

    render() {
        const {sourceAvatars, validation, options, itemsToDisplay, rls, permissions} = this.props;
        const {field, visibleRLSDialog, currentRLSField} = this.state;

        return (
            <div className={b()}>
                <DatasetTable
                    permissions={permissions}
                    rls={rls}
                    fields={this.filteredFields}
                    options={options}
                    itemsToDisplay={itemsToDisplay}
                    sourceAvatars={sourceAvatars}
                    validationInProgress={validation.isLoading}
                    onClickRow={this.openDialogFieldEditor}
                    updateField={this.updateField}
                    batchUpdateFields={this.batchUpdateFields}
                    duplicateField={this.duplicateField}
                    removeField={this.removeField}
                    batchRemoveFields={this.batchRemoveFields}
                    openRLSDialog={this.openRLSDialog}
                    openDialog={this.props.openDialog}
                    closeDialog={this.props.closeDialog}
                    openDialogConfirm={this.props.openDialogConfirm}
                    onDisplaySettingsUpdate={this.handleItemsToDisplayUpdate}
                />
                <RLSDialog
                    visible={visibleRLSDialog}
                    rlsField={currentRLSField}
                    field={field}
                    onClose={this.closeRLSDialog}
                    onSave={this.props.updateRLS}
                />
            </div>
        );
    }
}

DatasetEditor.propTypes = {
    updateDatasetByValidation: PropTypes.func.isRequired,
    addField: PropTypes.func.isRequired,
    duplicateField: PropTypes.func.isRequired,
    updateField: PropTypes.func.isRequired,
    toggleSaveDataset: PropTypes.func.isRequired,
    updateRLS: PropTypes.func.isRequired,
    toggleFieldEditorModuleLoader: PropTypes.func.isRequired,
    editorSetItemsToDisplay: PropTypes.func.isRequired,
    batchDeleteFields: PropTypes.func.isRequired,
    batchUpdateFields: PropTypes.func.isRequired,
    openDialog: PropTypes.func.isRequired,
    closeDialog: PropTypes.func.isRequired,
    openDialogConfirm: PropTypes.func.isRequired,

    dataset: PropTypes.object.isRequired,
    rls: PropTypes.object.isRequired,
    fields: PropTypes.array.isRequired,
    parameters: PropTypes.array.isRequired,
    datasetFields: PropTypes.array.isRequired,
    types: PropTypes.array.isRequired,
    sources: PropTypes.array.isRequired,
    ui: PropTypes.object.isRequired,
    options: PropTypes.object.isRequired,
    validation: PropTypes.object.isRequired,
    filter: PropTypes.string.isRequired,
    itemsToDisplay: PropTypes.array.isRequired,
    datasetId: PropTypes.string,
    sourceAvatars: PropTypes.array,
    permissions: PropTypes.object,
    workbookId: PropTypes.string,
    dlDebugMode: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
    fields: filteredDatasetFieldsSelector,
    parameters: filteredDatasetParametersSelector,
    dataset: datasetContentSelector,
    datasetFields: datasetFieldsSelector,
    types: typesSelector,
    sources: sourcesSelector,
    sourceAvatars: avatarsSelector,
    rls: rlsSelector,
    previewEnabled: previewEnabledSelector,
    ui: UISelector,
    options: optionsSelector,
    validation: datasetValidationSelector,
    filter: editorFilterSelector,
    itemsToDisplay: editorItemsToDisplaySelector,
    permissions: datasetPermissionsSelector,
    workbookId: workbookIdSelector,
    dlDebugMode: selectDebugMode,
});
const mapDispatchToProps = {
    updateDatasetByValidation,
    addField,
    duplicateField,
    batchDeleteFields,
    updateField,
    batchUpdateFields,
    updateRLS,
    toggleSaveDataset,
    toggleFieldEditorModuleLoader,
    editorSetItemsToDisplay,
    openDialog,
    closeDialog,
    openDialogConfirm,
};

export default compose(connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true}))(
    DatasetEditor,
);
