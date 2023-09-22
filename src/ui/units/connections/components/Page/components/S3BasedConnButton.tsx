import React from 'react';

import {Button, ButtonProps} from '@gravity-ui/uikit';
import {connect, useDispatch} from 'react-redux';
import {useParams} from 'react-router-dom';
import {ConnectionsBaseQA} from 'shared';
import {DatalensGlobalState} from 'ui';

import {
    DIALOG_CONN_CREATE_CONNECTION,
    DIALOG_CONN_CREATE_IN_WB_CONNECTION,
    DialogCreateConnectionInWbProps,
    DialogCreateConnectionProps,
} from '../..';
import {openDialog} from '../../../../../store/actions/dialog';
import {OpenDialogArgs} from '../../../../../store/actions/openDialogTypes';
import {
    connectionTypeSelector,
    createS3BasedConnection,
    formChangedSelector,
    gsheetUpdatingSelector,
    newConnectionSelector,
    updateS3BasedConnection,
} from '../../../store';
import {getSubmitButtonText} from '../../../utils';

type DispatchState = ReturnType<typeof mapStateToProps>;
type S3BasedConnButtonProps = DispatchState & Partial<ButtonProps>;

const S3BasedConnButtonComponent = (props: S3BasedConnButtonProps) => {
    const {
        connType,
        newConnection,
        disabled,
        loading,
        gsheetUpdating,
        size = 'm',
        view = 'action',
    } = props;
    const dispatch = useDispatch();
    const {workbookId} = useParams<{workbookId?: string}>();

    const applyCreationHandler: DialogCreateConnectionProps['onApply'] = React.useCallback(
        async (_key, name, dirPath) => {
            dispatch(createS3BasedConnection({name, dirPath}));
        },
        [dispatch],
    );

    const applyCreationInWbHandler: DialogCreateConnectionInWbProps['onApply'] = React.useCallback(
        async ({name}) => {
            dispatch(createS3BasedConnection({name}));
        },
        [dispatch],
    );

    const getOpenDialogArs = React.useCallback(
        (createInWorkbook: boolean): OpenDialogArgs => {
            if (createInWorkbook) {
                return {
                    id: DIALOG_CONN_CREATE_IN_WB_CONNECTION,
                    props: {onApply: applyCreationInWbHandler},
                };
            }

            return {
                id: DIALOG_CONN_CREATE_CONNECTION,
                props: {onApply: applyCreationHandler},
            };
        },
        [applyCreationHandler, applyCreationInWbHandler],
    );

    const handleClick = () => {
        if (newConnection) {
            const openDialogArgs = getOpenDialogArs(Boolean(workbookId));
            dispatch(openDialog(openDialogArgs));
        } else {
            dispatch(updateS3BasedConnection(connType));
        }
    };

    return (
        <Button
            qa={ConnectionsBaseQA.S3_ACTION_BUTTON}
            size={size}
            view={view}
            onClick={handleClick}
            disabled={disabled || gsheetUpdating}
            loading={loading}
        >
            {getSubmitButtonText(newConnection)}
        </Button>
    );
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        connType: connectionTypeSelector(state),
        newConnection: newConnectionSelector(state),
        disabled: !formChangedSelector(state),
        loading: state.connections.ui.submitLoading,
        gsheetUpdating: gsheetUpdatingSelector(state),
    };
};

/** Button for creating/editing s3-based connections */
export const S3BasedConnButton = connect(mapStateToProps)(S3BasedConnButtonComponent);
