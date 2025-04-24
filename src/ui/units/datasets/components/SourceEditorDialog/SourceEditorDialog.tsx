import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import _isEqual from 'lodash/isEqual';
import {connect} from 'react-redux';
import type {DatalensGlobalState} from 'ui';

import {I18n} from '../../../../../i18n';
import type {DatasetComponentError} from '../../../../../shared';
import DialogConfirm from '../../../../components/DialogConfirm/DialogConfirm';
import type {FormValidationError} from '../../helpers/validation';
import {VALIDATION_ERROR} from '../../helpers/validation';
import {filteredDatasetParametersSelector} from '../../store/selectors';
import type {FormOptions, StandaloneSource, Update} from '../../store/types';

import {Form, InputFormItem, ParamSelector, SourceError, SourceSwitcher} from './components';
import type {RenderParamSelector} from './components';
import type {EditedSource, OnParamCreate, OnParamEdit, OnSourceUpdate} from './types';
import {
    BASE_TITLE_FORM_OPTIONS,
    TITLE_INPUT,
    createValidationSchema,
    getDataForValidation,
    getErrorText,
    getInitialSelectedFreeformSource,
    getPreparedSource,
    getSelectedFreeformSourceByType,
    getUpdatedInputName,
    getUpdatedSource,
    getValidationErrors,
    mergeSources,
} from './utils';

import './SourceEditorDialog.scss';

const b = block('source-editor-dialog');
const i18n = I18n.keyset('dataset.sources-tab.modify');
const i18nConfirmDialog = I18n.keyset('component.dl-field-editor.view');

type StateProps = ReturnType<typeof mapStateToProps>;

type SourceEditorDialogProps = {
    onApply: (
        source: EditedSource,
    ) => Promise<{updates: Update[]; sourceErrors: DatasetComponentError[]}>;
    onUpdate: (source: EditedSource) => void;
    onClose: () => void;
    onParamCreate: OnParamCreate;
    onParamEdit: OnParamEdit;
    open: boolean;
    source: EditedSource;
    error?: Error;
} & StateProps;

const SourceEditorDialog: React.FC<SourceEditorDialogProps> = (props) => {
    const {
        onApply,
        onUpdate,
        onClose,
        onParamCreate,
        onParamEdit,
        open,
        sources,
        source: propsSource,
        freeformSources,
        componentErrors,
        parameters,
    } = props;
    const [source, setSource] = React.useState(propsSource);
    const [selectedFreeformSource, setSelectedFreeformSource] = React.useState(
        getInitialSelectedFreeformSource(source, freeformSources),
    );
    const [validationErrors, setValidationErrors] = React.useState<FormValidationError[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const sourceChanged = React.useMemo(() => {
        return !_isEqual(
            {parameters: propsSource.parameters, title: propsSource.title},
            {parameters: source.parameters, title: source.title},
        );
    }, [propsSource, source]);

    const isNewSource = !('id' in source);

    const onSourceSwitcherChange = React.useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const nextFreeformSource = getSelectedFreeformSourceByType(
                e.target.value,
                freeformSources,
            );

            if (nextFreeformSource) {
                setSource(mergeSources(source, nextFreeformSource));
                setSelectedFreeformSource(nextFreeformSource);
                setValidationErrors([]);
            }
        },
        [setSelectedFreeformSource, source, freeformSources],
    );

    const onSourceUpdate: OnSourceUpdate = React.useCallback(
        (update) => {
            const inputName = getUpdatedInputName(update);
            const hasErrorInUpdatedInput = Boolean(
                validationErrors.find(({name}) => name === inputName),
            );

            if (hasErrorInUpdatedInput) {
                const nextValidationErrors = validationErrors.filter(
                    ({name}) => name !== inputName,
                );
                setValidationErrors(nextValidationErrors);
            }

            setSource((prevSource) => getUpdatedSource(prevSource, update));
        },
        [setSource, validationErrors],
    );

    const closeConfirmDialog = React.useCallback(() => {
        setConfirmOpen(false);
    }, [setConfirmOpen]);

    const attemptToCloseDialog = React.useCallback(() => {
        if (sourceChanged) {
            setConfirmOpen(true);
        } else {
            onClose();
        }
    }, [onClose, setConfirmOpen, sourceChanged]);

    const isValid = React.useCallback(() => {
        const schema = createValidationSchema(selectedFreeformSource?.form);
        const data = getDataForValidation(source, selectedFreeformSource);
        const nextValidationErrors = getValidationErrors(schema, data);

        if (isNewSource && sources?.find((formSource) => formSource.title === source.title)) {
            nextValidationErrors.push({
                name: TITLE_INPUT,
                type: VALIDATION_ERROR.HAS_DUPLICATED_TITLES,
            });
        }

        setValidationErrors(nextValidationErrors);

        return !nextValidationErrors.length;
    }, [source, sources, selectedFreeformSource]);

    const _onApply = React.useCallback(async () => {
        if (!selectedFreeformSource || !isValid()) {
            return;
        }

        setLoading(true);

        const preparedSource = getPreparedSource(source, selectedFreeformSource);
        const {updates, sourceErrors} = await onApply(preparedSource);

        setLoading(false);

        if (updates && updates.length) {
            const update = updates.find(({action}) => {
                return action === 'add_source' || action === 'update_source';
            });

            if (update && 'source' in update) {
                const resultSource = update.source;
                const withoutErrors = !sourceErrors.find(({id}) => id === resultSource.id);

                onUpdate(resultSource as StandaloneSource);

                if (withoutErrors) {
                    onClose();
                }
            }
        }
    }, [onApply, onUpdate, onClose, isValid, source, selectedFreeformSource]);

    const renderParamSelector = React.useCallback<RenderParamSelector>(
        (args) => {
            return (
                <ParamSelector
                    {...args}
                    parameters={parameters}
                    onParamCreate={onParamCreate}
                    onParamEdit={onParamEdit}
                />
            );
        },
        [parameters, onParamCreate, onParamEdit],
    );

    React.useEffect(() => {
        setSource(propsSource);
    }, [propsSource]);

    const previousDefaultSourceTitleRef = React.useRef(selectedFreeformSource?.title || '');
    React.useEffect(() => {
        const currentDefaultSelectedSourceTitle = selectedFreeformSource?.title || '';
        if (isNewSource && source.title === previousDefaultSourceTitleRef.current) {
            setSource({...source, title: currentDefaultSelectedSourceTitle});
        }
        previousDefaultSourceTitleRef.current = currentDefaultSelectedSourceTitle;
    }, [selectedFreeformSource]);

    if (!selectedFreeformSource) {
        return null;
    }

    return (
        <Dialog
            qa="source-editor-dialog"
            className={b()}
            open={open}
            disableFocusTrap={true}
            onClose={attemptToCloseDialog}
        >
            <Dialog.Header caption={i18n('label_source-editor-header')} />
            <Dialog.Body>
                {freeformSources.length > 1 && (
                    <SourceSwitcher
                        freeformSources={freeformSources}
                        selectedFreeformSource={selectedFreeformSource}
                        onChange={onSourceSwitcherChange}
                    />
                )}
                <InputFormItem
                    {...BASE_TITLE_FORM_OPTIONS}
                    qa="source-editor-title"
                    value={source.title}
                    sourceType={source.source_type}
                    field_doc_key={`${source.source_type}/title` as FormOptions['field_doc_key']}
                    error={getErrorText(validationErrors, TITLE_INPUT)}
                    onUpdate={onSourceUpdate}
                />
                <Form
                    freeformSource={selectedFreeformSource}
                    source={source}
                    validationErrors={validationErrors}
                    onUpdate={onSourceUpdate}
                    renderParamSelector={renderParamSelector}
                />
                {componentErrors && (
                    <SourceError source={source} componentErrors={componentErrors} />
                )}
                <DialogConfirm
                    visible={confirmOpen}
                    confirmOnEnterPress={true}
                    message={i18nConfirmDialog('label_confirm-message')}
                    onCancel={closeConfirmDialog}
                    onApply={onClose}
                    isWarningConfirm={true}
                />
            </Dialog.Body>
            <Dialog.Footer
                loading={loading}
                textButtonCancel={i18n('button_cancel')}
                textButtonApply={isNewSource ? i18n('button_create') : i18n('button_apply')}
                propsButtonApply={{disabled: !sourceChanged}}
                onClickButtonCancel={attemptToCloseDialog}
                onClickButtonApply={_onApply}
            />
        </Dialog>
    );
};

const mapStateToProps = (store: DatalensGlobalState) => ({
    freeformSources: store.dataset.freeformSources,
    componentErrors: store.dataset.content.component_errors,
    sources: store.dataset.content.sources,
    parameters: filteredDatasetParametersSelector(store),
});

export default connect(mapStateToProps)(SourceEditorDialog);
