import type {OpenDialogArgs} from 'store/actions/openDialogTypes';
import {DIALOG_ERROR_WITH_TABS} from '../../components/DialogErrorWithTabs/DialogErrorWithTabs';
import type {DataLensApiError, DialogFilterProps, OpenDialogFilterArgs} from 'ui';
import {DIALOG_FILTER} from 'ui';
import type {
    DialogConfirmApplyStatus,
    DialogConfirmProps,
} from '../../components/DialogConfirm/DialogConfirm';
import {DIALOG_CONFIRM} from '../../components/DialogConfirm/DialogConfirm';

import type {DialogWarningProps} from 'ui/components/DialogWarning/DialogWarning';
import {DIALOG_WARNING} from 'ui/components/DialogWarning/DialogWarning';
import {i18n} from 'i18n';
import type {AppDispatch} from '../index';
import type {DialogParameterProps} from '../../components/DialogParameter/DialogParameter';
import {DIALOG_PARAMETER} from '../../components/DialogParameter/DialogParameter';
import type {PartialBy} from 'shared';

export const OPEN_DIALOG = Symbol('dialog/OPEN_DIALOG');
export const UPDATE_DIALOG_PROPS = Symbol('dialog/UPDATE_DIALOG_PROPS');
export const CLOSE_DIALOG = Symbol('dialog/CLOSE_DIALOG');
export const SET_CONFIRM_DIALOG_LOADING_STATUS = Symbol('dialog/SET_CONFIRM_DIALOG_LOADING_STATUS');

export type OpenDialogAction = {
    type: typeof OPEN_DIALOG;
    id: symbol;
    props?: any;
};

export type CloseDialogAction = {
    type: typeof CLOSE_DIALOG;
};

export type UpdateDialogStateAction = {
    type: typeof UPDATE_DIALOG_PROPS;
    id: symbol;
    props?: any;
};

export const openDialog = <T extends unknown>(args: OpenDialogArgs<T>): OpenDialogAction => {
    return {
        type: OPEN_DIALOG,
        id: args.id,
        props: args.props,
    };
};

export function closeDialog(): CloseDialogAction {
    return {
        type: CLOSE_DIALOG,
    };
}

export function updateDialogProps<T extends unknown>(
    args: OpenDialogArgs<T>,
): UpdateDialogStateAction {
    return {
        type: UPDATE_DIALOG_PROPS,
        id: args.id,
        props: args.props,
    };
}

type SetConfirmDialogLoadingStatusAction = {
    type: typeof SET_CONFIRM_DIALOG_LOADING_STATUS;
    payload: DialogConfirmApplyStatus;
};

export function setDialogConfirmLoadingStatus(
    payload: SetConfirmDialogLoadingStatusAction['payload'],
): SetConfirmDialogLoadingStatusAction {
    return {
        type: SET_CONFIRM_DIALOG_LOADING_STATUS,
        payload,
    };
}

type OpenDialogErrorWithTabsArguments = {
    error: DataLensApiError;
    title?: string | null;
    withReport?: boolean;
    onRetry?: () => void;
};

export const openDialogErrorWithTabs = ({
    error,
    title,
    withReport,
    onRetry,
}: OpenDialogErrorWithTabsArguments) => {
    return function (dispatch: AppDispatch) {
        dispatch(
            openDialog({
                id: DIALOG_ERROR_WITH_TABS,
                props: {
                    title: title || error?.message,
                    error,
                    onCancel: () => dispatch(closeDialog()),
                    withReport,
                    onRetry,
                },
            }),
        );
    };
};

export type OpenDialogConfirmArguments = Omit<DialogConfirmProps, 'visible'>;

export const openDialogConfirm = (commonProps: OpenDialogConfirmArguments) => {
    return function (dispatch: AppDispatch) {
        dispatch(
            openDialog({
                id: DIALOG_CONFIRM,
                props: {
                    ...commonProps,
                    visible: true,
                },
            }),
        );
    };
};

export type OpenWarningAlertArguments = Omit<DialogWarningProps, 'visible'>;

export const openWarningDialog = (commonProps: OpenWarningAlertArguments) => {
    return function (dispatch: AppDispatch) {
        dispatch(
            openDialog({
                id: DIALOG_WARNING,
                props: {
                    ...commonProps,
                    visible: true,
                },
            }),
        );
    };
};

type OpenDialogSaveChartConfirmArguments = Pick<
    OpenDialogConfirmArguments,
    | 'onApply'
    | 'message'
    | 'confirmHeaderText'
    | 'confirmButtonText'
    | 'cancelButtonText'
    | 'widthType'
>;

export const openDialogSaveChartConfirm = ({
    onApply,
    message,
    confirmHeaderText,
    confirmButtonText,
    cancelButtonText,
    widthType,
}: OpenDialogSaveChartConfirmArguments) => {
    return function (dispatch: AppDispatch) {
        const openDialogConfirmParams: OpenDialogConfirmArguments = {
            onApply: async (args) => {
                await onApply(args);
                dispatch(closeDialog());
            },
            message,
            isWarningConfirm: true,
            cancelButtonView: 'flat',
            onCancel: () => dispatch(closeDialog()),
            confirmOnEnterPress: true,
            confirmHeaderText:
                confirmHeaderText || i18n('component.dl-dialog-confirm.view', 'confirm-header'),
            cancelButtonText:
                cancelButtonText ||
                i18n('component.dl-dialog-confirm.view', 'button-save-chart_cancel'),
            confirmButtonText:
                confirmButtonText ||
                i18n('component.dl-dialog-confirm.view', 'button-save-chart_apply'),
            widthType,
        };
        dispatch(openDialogConfirm(openDialogConfirmParams));
    };
};

type OpenDialogSaveDraftChartAsActualConfirmArguments = {
    onApply: (event?: React.MouseEvent<HTMLElement, MouseEvent> | undefined) => void;
};

export const openDialogSaveDraftChartAsActualConfirm = ({
    onApply,
}: OpenDialogSaveDraftChartAsActualConfirmArguments) => {
    return function (dispatch: AppDispatch) {
        dispatch(
            openDialogSaveChartConfirm({
                onApply: (args) => {
                    onApply(args);
                    dispatch(closeDialog());
                },
                message: `${i18n('revisions.dialog-confirm', 'label_text')} ${i18n(
                    'revisions.dialog-confirm',
                    'label_text-unsaved-lost',
                )}`,
                confirmButtonText: i18n('revisions.dialog-confirm', 'button_confirm'),
                cancelButtonText: i18n('revisions.dialog-confirm', 'button_cancel'),
                confirmHeaderText: i18n('revisions.dialog-confirm', 'label_title'),
                widthType: 'medium',
            }),
        );
    };
};

type OpenDialogParameterArguments = Omit<DialogParameterProps, 'onClose'>;

export const openDialogParameter = ({
    type,
    onApply,
    field,
    onReset,
    showTemplateWarn,
    templateEnabled,
}: OpenDialogParameterArguments) => {
    return function (dispatch: AppDispatch) {
        const openDialogParameterParams: DialogParameterProps = {
            type,
            onClose: () => dispatch(closeDialog()),
            onApply: (updatedField) => {
                const {cast, default_value} = updatedField;
                // temporary workaround CHARTS-6821
                if (
                    cast === 'genericdatetime' &&
                    typeof default_value === 'string' &&
                    default_value.endsWith('Z')
                ) {
                    updatedField.default_value = default_value.substring(0, 19);
                }
                onApply(updatedField);
                dispatch(closeDialog());
            },
            onReset,
            field,
            showTemplateWarn,
            templateEnabled,
        };

        dispatch(
            openDialog({
                id: DIALOG_PARAMETER,
                props: openDialogParameterParams,
            }),
        );
    };
};

export const openDialogFilter = (
    args: PartialBy<Omit<DialogFilterProps, 'visible'>, 'onClose'>,
) => {
    return function (dispatch: AppDispatch) {
        const dialogFilterArgs: OpenDialogFilterArgs = {
            id: DIALOG_FILTER,
            props: {
                visible: true,
                field: args.field,
                datasetId: args.datasetId,
                workbookId: args.workbookId,
                options: args.options,
                onClose: () => {
                    if (args.onClose) {
                        args.onClose();
                    }
                    dispatch(closeDialog());
                },
                onApply: (data) => {
                    args.onApply(data);
                    dispatch(closeDialog());
                },
                filter: args.filter,
                fields: args.fields,
                hideApplyButton: Boolean(args.hideApplyButton),
                updates: args.updates,
                dashboardParameters: args.dashboardParameters,
                parameters: args.parameters,
            },
        };

        dispatch(openDialog(dialogFilterArgs));
    };
};

export type DialogAction =
    | OpenDialogAction
    | CloseDialogAction
    | UpdateDialogStateAction
    | SetConfirmDialogLoadingStatusAction;
