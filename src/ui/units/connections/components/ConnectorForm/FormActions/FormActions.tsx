import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {connect, useDispatch} from 'react-redux';
import {useParams} from 'react-router-dom';
import type {DatalensGlobalState} from 'ui';
import {registry} from 'ui/registry';

import {DIALOG_CONN_CREATE_CONNECTION, DIALOG_CONN_CREATE_IN_WB_CONNECTION} from '../../';
import type {
    DialogCreateWorkbookEntryProps,
    EntryDialogBaseProps,
} from '../../../../../components/EntryDialogues';
import {openDialogErrorWithTabs} from '../../../../../store/actions/dialog';
import {
    checkConnection,
    createConnection,
    formChangedSelector,
    formSelector,
    innerFormSelector,
    readonlySelector,
    setValidationErrors,
    submitLoadingSelector,
    updateConnectionWithRevision,
} from '../../../store';
import {validateFormBeforeAction} from '../../../store/utils';
import {useCreateConnectionHandler} from '../../hooks';
import type {CreateConnectionHandlerArgs} from '../../hooks';

import {CheckParamsButton} from './CheckParamsButton/CheckParamsButton';
import {SubmitButton} from './SubmitButton/SubmitButton';
import {showCheckButtonSelector, showSubmitButtonSelector} from './selectors';
import {getSubmitButtonText} from './utils';

const b = block('conn-form');
const i18n = I18n.keyset('connections.form');

type DispatchState = ReturnType<typeof mapStateToProps>;
type FormActionsProps = DispatchState;

export const FormActionsComponent = (props: FormActionsProps) => {
    const {
        form,
        innerForm,
        schema,
        checkData,
        newConnection,
        showSubmitButton,
        showCheckButton,
        submitLoading,
        checkLoading,
        formChanged,
        readonly,
    } = props;
    const dispatch = useDispatch();
    const {workbookId} = useParams<{workbookId?: string}>();
    const {createConnectionHandler} = useCreateConnectionHandler({
        hasWorkbookIdInParams: Boolean(workbookId),
    });
    const submitDisabled = (!newConnection && !formChanged) || checkLoading;

    const applyCreationHandler: EntryDialogBaseProps<void>['onApply'] = React.useCallback(
        async (_key, name, dirPath) => {
            dispatch(createConnection({name, dirPath}));
        },
        [dispatch],
    );

    const applyCreationInWbHandler: DialogCreateWorkbookEntryProps['onApply'] = React.useCallback(
        async (args) => {
            dispatch(createConnection({name: args.name, workbookId: args.workbookId}));
        },
        [dispatch],
    );

    const getOpenDialogArs = React.useCallback((): CreateConnectionHandlerArgs => {
        const {getNewConnectionDestination} = registry.connections.functions.getAll();
        const destination = getNewConnectionDestination(Boolean(workbookId));

        return destination === 'folder'
            ? {
                  id: DIALOG_CONN_CREATE_CONNECTION,
                  props: {onApply: applyCreationHandler},
              }
            : {
                  id: DIALOG_CONN_CREATE_IN_WB_CONNECTION,
                  props: {onApply: applyCreationInWbHandler},
              };
    }, [workbookId, applyCreationHandler, applyCreationInWbHandler]);

    const submitHandler = React.useCallback(() => {
        if (newConnection) {
            const errors = validateFormBeforeAction({
                form,
                innerForm,
                apiSchemaItem: schema?.apiSchema?.create,
            });

            if (errors.length) {
                dispatch(setValidationErrors({errors}));
            } else {
                createConnectionHandler(getOpenDialogArs());
            }
        } else {
            dispatch(updateConnectionWithRevision());
        }
    }, [
        form,
        innerForm,
        schema,
        newConnection,
        dispatch,
        getOpenDialogArs,
        createConnectionHandler,
    ]);

    const checkHandler = React.useCallback(() => {
        const errors = validateFormBeforeAction({
            form,
            innerForm,
            apiSchemaItem: schema?.apiSchema?.check,
        });

        if (errors.length) {
            dispatch(setValidationErrors({errors}));
        } else {
            dispatch(checkConnection());
        }
    }, [form, innerForm, schema, dispatch]);

    const handlePopupButtonClick = React.useCallback(() => {
        if (!checkData.error) {
            return;
        }

        dispatch(
            openDialogErrorWithTabs({
                title: i18n('toast_verify-error'),
                error: checkData.error,
                withReport: true,
            }),
        );
    }, [checkData.error, dispatch]);

    if (!showSubmitButton && !showCheckButton) {
        return null;
    }

    return (
        <div className={b('actions')}>
            {showCheckButton && (
                <CheckParamsButton
                    checkData={checkData}
                    loading={checkLoading}
                    disabled={readonly || submitLoading}
                    onClick={checkHandler}
                    onTooltipActionButtonClick={handlePopupButtonClick}
                />
            )}
            {showSubmitButton && (
                <SubmitButton
                    text={getSubmitButtonText(newConnection)}
                    loading={submitLoading}
                    disabled={submitDisabled}
                    onClick={submitHandler}
                />
            )}
        </div>
    );
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        form: formSelector(state),
        innerForm: innerFormSelector(state),
        schema: state.connections.schema,
        checkData: state.connections.checkData,
        newConnection: !state.connections.entry?.entryId,
        showSubmitButton: showSubmitButtonSelector(state),
        showCheckButton: showCheckButtonSelector(state),
        checkLoading: state.connections.ui.checkLoading,
        submitLoading: submitLoadingSelector(state),
        formChanged: formChangedSelector(state),
        readonly: readonlySelector(state),
    };
};

export const FormActions = connect(mapStateToProps)(FormActionsComponent);
