import React from 'react';

import type {ButtonProps} from '@gravity-ui/uikit';
import {Button} from '@gravity-ui/uikit';
import {connect, useDispatch} from 'react-redux';
import {useParams} from 'react-router-dom';
import {ConnectionsBaseQA} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {registry} from 'ui/registry';

import type {DialogCreateConnectionInWbOrCollectionProps, DialogCreateConnectionProps} from '../..';
import {DIALOG_CONN_CREATE_CONNECTION, DIALOG_CONN_CREATE_IN_WB_OR_COLLECTION} from '../..';
import {CreationPlaces} from '../../../constants';
import {
    connectionTypeSelector,
    createS3BasedConnection,
    formChangedSelector,
    gsheetUpdatingSelector,
    newConnectionSelector,
    submitLoadingSelector,
    updateS3BasedConnection,
} from '../../../store';
import {getSubmitButtonText} from '../../../utils';
import {useCreateConnectionHandler} from '../../hooks';
import type {CreateConnectionHandlerArgs} from '../../hooks';

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
    const {workbookId, collectionId} = useParams<{workbookId?: string; collectionId?: string}>();
    const {createConnectionHandler} = useCreateConnectionHandler({
        hasWorkbookIdInParams: Boolean(workbookId),
        hasCollectionIdInParams: Boolean(collectionId),
    });

    const applyCreationHandler: DialogCreateConnectionProps['onApply'] = React.useCallback(
        async (_key, name, dirPath) => {
            dispatch(createS3BasedConnection({name, dirPath}));
        },
        [dispatch],
    );

    const applyCreationInWbHandler: DialogCreateConnectionInWbOrCollectionProps['onApply'] =
        React.useCallback(
            async (args) => {
                dispatch(createS3BasedConnection({name: args.name, workbookId: args.workbookId}));
            },
            [dispatch],
        );

    const applyCreationInCollectionHandler: DialogCreateConnectionInWbOrCollectionProps['onApply'] =
        React.useCallback(
            async (args) => {
                dispatch(
                    createS3BasedConnection({
                        name: args.name,
                        workbookId: args.workbookId,
                        collectionId: args.collectionId,
                    }),
                );
            },
            [dispatch],
        );

    const getOpenDialogArs = React.useCallback((): CreateConnectionHandlerArgs => {
        const {getNewConnectionDestination} = registry.connections.functions.getAll();
        const destination = getNewConnectionDestination(Boolean(workbookId), Boolean(collectionId));

        switch (destination) {
            case CreationPlaces.Folder:
                return {
                    id: DIALOG_CONN_CREATE_CONNECTION,
                    props: {onApply: applyCreationHandler},
                };
            case CreationPlaces.Workbook:
                return {
                    id: DIALOG_CONN_CREATE_IN_WB_OR_COLLECTION,
                    props: {onApply: applyCreationInWbHandler},
                };
            case CreationPlaces.Collection:
                return {
                    id: DIALOG_CONN_CREATE_IN_WB_OR_COLLECTION,
                    props: {onApply: applyCreationInCollectionHandler, collectionId},
                };
        }
    }, [
        workbookId,
        applyCreationHandler,
        applyCreationInWbHandler,
        applyCreationInCollectionHandler,
        collectionId,
    ]);

    const handleClick = () => {
        if (newConnection) {
            createConnectionHandler(getOpenDialogArs());
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
        loading: submitLoadingSelector(state),
        gsheetUpdating: gsheetUpdatingSelector(state),
    };
};

/** Button for creating/editing s3-based connections */
export const S3BasedConnButton = connect(mapStateToProps)(S3BasedConnButtonComponent);
