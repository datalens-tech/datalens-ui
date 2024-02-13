import React from 'react';

import {Dialog, DialogProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import lodash from 'lodash';
import {ResolveThunks, connect} from 'react-redux';
import SplitPane from 'react-split-pane';
import {
    Dataset,
    DatasetField,
    DatasetFieldError,
    DatasetOptions,
    DatasetSource,
    DatasetSourceAvatar,
    DialogFieldEditorQA,
    Feature,
    FieldEditorQa,
    WorkbookId,
} from 'shared';
import {updateUserSettings} from 'store/actions/user';
import {selectFieldEditorDocShown} from 'store/selectors/user';
import {DataTypeConfig, DatalensGlobalState, SPLIT_PANE_RESIZER_CLASSNAME, sdk} from 'ui';

import {I18n} from '../../../i18n/index';
import logger from '../../libs/logger';
import {MonacoTypes, registerDatalensFormulaLanguage} from '../../libs/monaco';
import {getSdk} from '../../libs/schematic-sdk';
import Utils from '../../utils';
import DialogConfirm from '../DialogConfirm/DialogConfirm';

import DocSection from './components/DocSection';
import FormulaSection, {FormulaSectionProps} from './components/FormulaSection';
import Settings from './components/Settings';
import SourceSection from './components/SourceSection';
import {Cancelable, FieldEditorErrors, ModifiedDatasetField, ModifyField} from './typings';
import {
    createInitialErrors,
    createInitialField,
    getErrors,
    prepareField,
    validateField,
} from './utils';

import './FieldEditor.scss';

const b = block('dl-field-editor');
const i18n = I18n.keyset('component.dl-field-editor.view');
const VALIDATE_TIMEOUT = 250;

type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;
type StateProps = ReturnType<typeof mapStateToProps>;

export type FieldEditorProps = {
    onClose: () => void;
    onCreate: (field: DatasetField) => void;
    onSave: (field: DatasetField) => void;
    fields: DatasetField[];
    sources: DatasetSource[];
    datasetId: string;
    workbookId: WorkbookId;
    dataset?: Dataset['dataset'];
    sourceAvatars: DatasetSourceAvatar[];
    options?: DatasetOptions;
    dataTypes?: DataTypeConfig[];
    field?: DatasetField;
    onlyFormulaEditor?: boolean;
};

type Props = FieldEditorProps & DispatchProps & StateProps;

interface FieldEditorDeaultProps {
    onlyFormulaEditor: boolean;
}

interface FieldEditorState {
    field: ModifiedDatasetField;
    initialField: ModifiedDatasetField;
    errors: FieldEditorErrors;
    fieldErrors: DatasetFieldError[];
    editor: MonacoTypes.editor.IStandaloneCodeEditor | null;
    dialogConfirmVisible: boolean;
    saveAsNewField: boolean;
}

class FieldEditor extends React.Component<Props, FieldEditorState> {
    static defaultProps: FieldEditorDeaultProps = {
        onlyFormulaEditor: false,
    };

    debounced: Cancelable | null = null;
    throttledSplitPaneChange: Cancelable;
    isUnmounted = false;
    monaco: typeof MonacoTypes | null = null;

    constructor(props: Props) {
        super(props);

        this.throttledSplitPaneChange = lodash.throttle(this.onSplitPaneChange, 50);

        const field = this.props.field || createInitialField();

        this.state = {
            field,
            initialField: field,
            fieldErrors: [],
            errors: createInitialErrors(),
            editor: null,
            dialogConfirmVisible: false,
            saveAsNewField: Boolean(
                this.props.field && this.props.field.formula && !this.props.field.title,
            ),
        };
    }

    componentDidMount() {
        this.debouncedValidateFormula();
    }

    componentWillUnmount() {
        this.isUnmounted = true;
    }

    render() {
        const {onlyFormulaEditor} = this.props;
        const {field, errors, dialogConfirmVisible} = this.state;

        return (
            <Dialog open={true} disableFocusTrap={true} onClose={this.onClose}>
                <div className={b()} data-qa={FieldEditorQa.Dialog}>
                    <Dialog.Header caption={i18n('label_title')} />
                    <Settings
                        field={field}
                        errors={errors}
                        onlyFormulaEditor={onlyFormulaEditor}
                        modifyField={this.modifyField}
                        toggleDocumentationPanel={this.toggleDocumentationPanel}
                    />
                    {this.renderContent()}
                </div>
                <DialogConfirm
                    visible={dialogConfirmVisible}
                    message={i18n('label_confirm-message')}
                    onCancel={this.toggleDialogConfirm}
                    onApply={this.props.onClose}
                    isWarningConfirm={true}
                    confirmOnEnterPress
                />
            </Dialog>
        );
    }

    renderContent() {
        const {
            fields,
            sources,
            sourceAvatars,
            options: {supported_functions: supportedFunctions = []} = {},
            dataTypes = [],
            docPanelVisible,
        } = this.props;
        const {field, fieldErrors, errors} = this.state;
        const {calc_mode: calcMode} = field;

        return (
            <div className={b('content')}>
                {calcMode === 'direct' ? (
                    <React.Fragment>
                        <SourceSection
                            field={field}
                            errors={errors}
                            dataTypes={dataTypes}
                            sources={sources}
                            sourceAvatars={sourceAvatars}
                            modifyField={this.modifyField}
                        />
                        {this.renderFooter()}
                    </React.Fragment>
                ) : (
                    <div className={b('content-panels')}>
                        <SplitPane
                            resizerClassName={SPLIT_PANE_RESIZER_CLASSNAME}
                            split={'horizontal'}
                            defaultSize={'50%'}
                            minSize={0}
                            style={{
                                overflow: 'initial',
                            }}
                            pane1Style={{
                                ...(!docPanelVisible && {
                                    height: '100%',
                                    maxHeight: '100%',
                                }),
                                ...(docPanelVisible && {
                                    maxHeight: '80%',
                                }),
                            }}
                            pane2Style={{
                                zIndex: 2,
                                overflow: 'hidden',
                                backgroundColor: 'var(--g-color-base-float)',
                            }}
                            allowResize={docPanelVisible}
                            onChange={this.throttledSplitPaneChange}
                        >
                            <FormulaSection
                                fields={fields}
                                field={field}
                                fieldErrors={fieldErrors}
                                supportedFunctions={supportedFunctions}
                                modifyField={this.modifyField}
                                setEditorInstance={this.setEditorInstance}
                                setMonaco={this.setMonaco}
                                onSplitPaneChange={lodash.throttle(this.onSplitPaneChange, 50)}
                            >
                                {this.renderFooter()}
                            </FormulaSection>
                            {Utils.isEnabledFeature(Feature.FieldEditorDocSection) ? (
                                <DocSection sdk={sdk} />
                            ) : (
                                <div></div>
                            )}
                        </SplitPane>
                    </div>
                )}
            </div>
        );
    }

    renderFooter() {
        const {field} = this.props;
        const {saveAsNewField} = this.state;

        return (
            <Dialog.Footer
                onClickButtonCancel={this.attemptToCloseDialog}
                onClickButtonApply={this.onApply}
                propsButtonApply={{
                    qa: DialogFieldEditorQA.ApplyButton,
                }}
                propsButtonCancel={{
                    qa: DialogFieldEditorQA.CancelButton,
                }}
                textButtonApply={i18n(
                    `button_${field ? (saveAsNewField ? 'save-as' : 'save') : 'create'}`,
                )}
                textButtonCancel={i18n('button_cancel')}
            />
        );
    }

    get isNewField() {
        return !this.props.field;
    }

    setMonaco: FormulaSectionProps['setMonaco'] = (monaco) => {
        this.monaco = monaco;
        if (monaco) {
            registerDatalensFormulaLanguage(monaco);
        }
    };

    setEditorInstance = (editor: MonacoTypes.editor.IStandaloneCodeEditor | null) => {
        this.setState({editor});
    };

    toggleDialogConfirm = () => {
        this.setState({dialogConfirmVisible: !this.state.dialogConfirmVisible});
    };

    toggleDocumentationPanel = async () => {
        const nextDocPanelVisible = !this.props.docPanelVisible;

        await this.props.updateUserSettings({
            newSettings: {dlFieldEditorDocShown: nextDocPanelVisible},
        });

        this.state.editor?.layout();
    };

    validateFormula = async () => {
        const {datasetId, workbookId, dataset} = this.props;
        const {field} = this.state;

        if (!dataset) {
            return;
        }

        let fieldErrors: DatasetFieldError[] = [];

        try {
            await getSdk().bi.validateDatasetFormula(
                {
                    datasetId,
                    workbookId,
                    dataset,
                    field,
                },
                {concurrentId: 'validateDatasetFormula'},
            );
        } catch (error) {
            if (!getSdk().isCancel(error)) {
                fieldErrors = (error?.details?.data?.field_errors as DatasetFieldError[]) || [];
                logger.logError('FieldEditor: validateDatasetFormula failed', error);
            }
        }

        this.setState({fieldErrors});
    };

    debouncedValidateFormula = () => {
        if (this.debounced) {
            this.debounced.cancel();
        }

        this.debounced = lodash.debounce(this.validateFormula, VALIDATE_TIMEOUT);
        this.debounced();
    };

    modifyField: ModifyField = (updates, errorUpdates) => {
        const {field, errors} = this.state;

        const updatedState: Pick<FieldEditorState, 'field' | 'errors'> = {
            field: {
                ...field,
                ...updates,
            },
            errors: {
                ...errors,
            },
        };

        if (updatedState.field.new_id && updatedState.field.new_id === updatedState.field.guid) {
            // To avoid confirm
            delete updatedState.field.new_id;
        }

        if (errorUpdates) {
            updatedState.errors = {
                ...errors,
                ...errorUpdates,
            };
        }

        this.setState(updatedState, this.debouncedValidateFormula);
    };

    onSplitPaneChange = () => {
        if (this.state.editor) {
            this.state.editor.layout();
        }
    };

    onApply = () => {
        const {fields, onlyFormulaEditor} = this.props;
        const {field} = this.state;

        const preparedField = prepareField(field);

        this.setState({
            field: {...preparedField},
        });

        const isFieldValid = validateField(preparedField, fields);

        if (!isFieldValid) {
            const errors = getErrors(preparedField, fields);

            this.setState({errors}, () => {
                // Switch to tab "Source field" if user has entered invalid field id,
                // switched to tab "Formula" and tried to save the changes
                if (errors.invalidId && !onlyFormulaEditor) {
                    this.modifyField({calc_mode: 'direct'});
                }
            });

            return;
        }

        if (this.isNewField) {
            this.props.onCreate(preparedField);
        } else {
            this.props.onSave(preparedField);
        }
    };

    attemptToCloseDialog = () => {
        const {initialField, field} = this.state;

        if (lodash.isEqual(initialField, field)) {
            this.props.onClose();

            return;
        }

        this.toggleDialogConfirm();
    };

    onClose: DialogProps['onClose'] = (_, reason) => {
        if (reason === 'outsideClick') {
            this.attemptToCloseDialog();

            return;
        }

        if (!this.state.dialogConfirmVisible) {
            this.attemptToCloseDialog();
        }
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        docPanelVisible: selectFieldEditorDocShown(state),
    };
};

const mapDispatchToProps = {
    updateUserSettings,
};

export default connect(mapStateToProps, mapDispatchToProps)(FieldEditor);
