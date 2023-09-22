import React from 'react';

import block from 'bem-cn-lite';
import _debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {compose} from 'recompose';
import {createStructuredSelector} from 'reselect';
import {
    addField,
    deleteField,
    disableSaveDataset,
    duplicateField,
    editorSetItemsToDisplay,
    enableSaveDataset,
    toggleFieldEditorModuleLoader,
    updateDatasetByValidation,
    updateField,
    updateRLS,
} from 'units/datasets/store/actions/creators';

import {DIALOG_FIELD_EDITOR} from '../../../../components/DialogFieldEditor/DialogFieldEditor';
import {CounterName, GoalId, reachMetricaGoal} from '../../../../libs/metrica';
import {closeDialog, openDialog} from '../../../../store/actions/dialog';
import DatasetTable from '../../components/DatasetTable/DatasetTable';
import RLSDialog from '../../components/RLSDialog/RLSDialog';
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
        const {fields, filter, itemsToDisplay} = this.props;

        return getFilteredFields({
            fields,
            filter,
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
        const {fields, parameters, dataset, datasetId, options, types} = this.props;

        const fieldsWithParameters = [...fields, ...parameters];

        this.props.openDialog({
            id: DIALOG_FIELD_EDITOR,
            props: {
                datasetContent: dataset,
                datasetId,
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

    debouncedUpdate2000 = _debounce(this.props.updateDatasetByValidation, 2000);

    modifyFields = ({
        actionType,
        field,
        debounce = false,
        updatePreview = false,
        validateEnabled = true,
    }) => {
        const {
            updateDatasetByValidation,
            addField,
            duplicateField,
            deleteField,
            updateField,
            disableSaveDataset,
            enableSaveDataset,
        } = this.props;
        const {guid} = field;

        if (guid) {
            if (validateEnabled) {
                disableSaveDataset();
            } else {
                enableSaveDataset();
            }

            switch (actionType) {
                case 'duplicate': {
                    duplicateField(field);

                    this.debouncedUpdate2000({
                        updatePreview,
                        validateEnabled,
                    });

                    break;
                }
                case 'delete': {
                    deleteField(field);

                    this.debouncedUpdate2000({
                        updatePreview,
                        validateEnabled,
                    });

                    break;
                }
                case 'add': {
                    addField(field);

                    updateDatasetByValidation({
                        updatePreview,
                        validateEnabled,
                    });

                    break;
                }
                case 'update': {
                    updateField(field);

                    if (debounce) {
                        this.debouncedUpdate2000({
                            updatePreview,
                            validateEnabled,
                        });
                    } else {
                        updateDatasetByValidation({
                            updatePreview,
                            validateEnabled,
                        });
                    }

                    break;
                }
            }
        }
    };

    updateField = (data) => {
        this.modifyFields({
            ...data,
            updatePreview: true,
            actionType: 'update',
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

    removeField = (data) => {
        this.modifyFields({
            ...data,
            actionType: 'delete',
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
                    duplicateField={this.duplicateField}
                    removeField={this.removeField}
                    openRLSDialog={this.openRLSDialog}
                    openDialog={this.props.openDialog}
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
    dataset: PropTypes.object.isRequired,
    rls: PropTypes.object.isRequired,
    fields: PropTypes.array.isRequired,
    parameters: PropTypes.array.isRequired,
    datasetFields: PropTypes.array.isRequired,
    types: PropTypes.array.isRequired,
    sources: PropTypes.array.isRequired,
    updateRLS: PropTypes.func.isRequired,
    disableSaveDataset: PropTypes.func.isRequired,
    enableSaveDataset: PropTypes.func.isRequired,
    toggleFieldEditorModuleLoader: PropTypes.func.isRequired,
    editorSetItemsToDisplay: PropTypes.func.isRequired,
    openDialog: PropTypes.func.isRequired,
    ui: PropTypes.object.isRequired,
    options: PropTypes.object.isRequired,
    validation: PropTypes.object.isRequired,
    filter: PropTypes.string.isRequired,
    itemsToDisplay: PropTypes.array.isRequired,
    datasetId: PropTypes.string,
    sourceAvatars: PropTypes.array,
    permissions: PropTypes.object,
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
});
const mapDispatchToProps = {
    updateDatasetByValidation,
    addField,
    duplicateField,
    deleteField,
    updateField,
    updateRLS,
    disableSaveDataset,
    enableSaveDataset,
    toggleFieldEditorModuleLoader,
    editorSetItemsToDisplay,
    openDialog,
    closeDialog,
};

export default compose(connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true}))(
    DatasetEditor,
);
