import React from 'react';

import type {DialogProps} from '@gravity-ui/uikit';
import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {AIChat} from 'extensions/src/ui/components/AIChat/AIChat';
import {AIRoles} from 'extensions/src/ui/components/AIChat/constants';
import lodash from 'lodash';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import SplitPane from 'react-split-pane';
import type {
    Dataset,
    DatasetField,
    DatasetFieldError,
    DatasetOptions,
    DatasetSource,
    DatasetSourceAvatar,
    WorkbookId,
} from 'shared';
import {DialogFieldEditorQA, Feature, FieldEditorQa} from 'shared';
import {updateUserSettings} from 'store/actions/user';
import {selectFieldEditorAdditionalShown, selectFieldEditorDocShown} from 'store/selectors/user';
import type {DataTypeConfig, DatalensGlobalState} from 'ui';
import {SPLIT_PANE_RESIZER_CLASSNAME, sdk} from 'ui';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {I18n} from '../../../i18n/index';
import logger from '../../libs/logger';
import type {MonacoTypes} from '../../libs/monaco';
import {registerDatalensFormulaLanguage} from '../../libs/monaco';
import {getSdk} from '../../libs/schematic-sdk';
import DialogConfirm from '../DialogConfirm/DialogConfirm';

import DocSection from './components/DocSection';
import type {FormulaSectionProps} from './components/FormulaSection';
import FormulaSection from './components/FormulaSection';
import {Settings} from './components/Settings';
import SourceSection from './components/SourceSection';
import type {Cancelable, FieldEditorErrors, ModifiedDatasetField, ModifyField} from './typings';
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
            <Dialog
                open={true}
                onClose={this.onClose}
                onTransitionInComplete={() => {
                    // in order for the monaco editor to calculate the dimensions correctly
                    window.dispatchEvent(new Event('resize'));
                }}
            >
                <div className={b()} data-qa={FieldEditorQa.Dialog}>
                    <Dialog.Header caption={i18n('label_title')} />
                    <Settings
                        field={field}
                        errors={errors}
                        onlyFormulaEditor={onlyFormulaEditor}
                        modifyField={this.modifyField}
                        toggleDocumentationPanel={this.toggleDocumentationPanel}
                        toggleAdditionalPanel={this.toggleAdditionalPanel}
                        additionalPanelVisible={this.props.additionalPanelVisible}
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
            additionalPanelVisible,
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
                            {isEnabledFeature(Feature.FieldEditorDocSection) ? (
                                <DocSection sdk={sdk} />
                            ) : (
                                <div></div>
                            )}
                        </SplitPane>
                        {additionalPanelVisible && (
                            <AIChat
                                roles={[AIRoles.Analyst]}
                                className={b('ai-chat')}
                                pinned={false}
                                onClose={() => {}}
                                meta={{}}
                                startMessage={undefined}
                                showHeaderButtons={false}
                            />
                        )}
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
            newSettings: {
                dlFieldEditorAdditionalShown: false,
                dlFieldEditorDocShown: nextDocPanelVisible,
            },
        });

        this.state.editor?.layout();
    };

    toggleAdditionalPanel = async () => {
        const nextAdditionalPanelVisible = !this.props.additionalPanelVisible;

        await this.props.updateUserSettings({
            newSettings: {
                dlFieldEditorDocShown: false,
                dlFieldEditorAdditionalShown: nextAdditionalPanelVisible,
            },
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
            await getSdk().sdk.bi.validateDatasetFormula(
                {
                    datasetId,
                    workbookId,
                    dataset,
                    field,
                },
                {concurrentId: 'validateDatasetFormula'},
            );
        } catch (error) {
            if (!getSdk().sdk.isCancel(error)) {
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
        additionalPanelVisible: selectFieldEditorAdditionalShown(state),
    };
};

const mapDispatchToProps = {
    updateUserSettings,
};

export default connect(mapStateToProps, mapDispatchToProps)(FieldEditor);
