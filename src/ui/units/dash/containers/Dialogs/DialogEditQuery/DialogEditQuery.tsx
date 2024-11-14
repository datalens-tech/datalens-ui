import React from 'react';

import {Dialog, Flex} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {ConnectionQueryContent} from 'shared';
import {mapParametersRecordToTypedQueryApiParameters} from 'shared/modules/typed-query-api';
import type {GetConnectionTypedQueryErrorResponse} from 'shared/schema';
import {setSelectorDialogItem} from 'ui/store/actions/controlDialog';
import {selectSelectorDialog} from 'ui/store/selectors/controlDialog';

import DialogManager from '../../../../../components/DialogManager/DialogManager';
import {getSdk} from '../../../../../libs/schematic-sdk';
import {closeDialog} from '../../../../../store/actions/dialog';
import {selectWorkbookId} from '../../../../workbooks/store/selectors';

import {QueryEditor} from './QueryEditor/QueryEditor';
import {QueryError} from './QueryError/QueryError';
import {validateTypedQueryResponseForSelector} from './helpers/validate-query';

import './DialogEditQuery.scss';

export const DIALOG_EDIT_QUERY = Symbol('DIALOG_EDIT_QUERY');

export type OpenDialogEditQueryArgs = {
    id: typeof DIALOG_EDIT_QUERY;
    props: undefined;
};
const i18n = I18n.keyset('dash.edit-query-dialog');

const b = block('dialog-edit-query');

const DialogEditQuery: React.FC = () => {
    const dispatch = useDispatch();
    const {connectionQueryContent, connectionQueryType, connectionId, selectorParameters} =
        useSelector(selectSelectorDialog);
    const workbookId = useSelector(selectWorkbookId);

    const [query, setQuery] = React.useState<string | undefined>(connectionQueryContent?.query);
    const [disabled, setDisabled] = React.useState(connectionQueryContent?.query.length === 0);
    const [loading, setLoading] = React.useState(false);
    const [errorState, setErrorState] = React.useState<
        {reason: string | undefined; failedQuery: string | undefined} | undefined
    >();

    const handleWrongQueryRequest = (
        reason: string | undefined,
        failedQuery: string | undefined,
    ) => {
        setDisabled(true);

        setErrorState({reason, failedQuery});
    };

    const handleSuccessResponse = (queryContent: ConnectionQueryContent) => {
        setErrorState(undefined);

        dispatch(setSelectorDialogItem({connectionQueryContent: queryContent}));

        dispatch(closeDialog());
    };

    const handleClose = React.useCallback(() => dispatch(closeDialog()), []);

    const handleApply = () => {
        if (!connectionId || !query || !connectionQueryType) {
            return;
        }

        const queryContent: ConnectionQueryContent = {query};
        setLoading(true);
        getSdk()
            .bi.getConnectionTypedQueryData({
                connectionId,
                workbookId,
                body: {
                    query_type: connectionQueryType,
                    query_content: queryContent,
                    parameters: mapParametersRecordToTypedQueryApiParameters(
                        selectorParameters || {},
                    ),
                },
            })
            .then((response) => {
                setLoading(false);
                const validation = validateTypedQueryResponseForSelector(response);
                return validation
                    ? handleSuccessResponse(queryContent)
                    : handleWrongQueryRequest(i18n('error_invalid-typed-query-response'), query);
            })
            .catch((e: GetConnectionTypedQueryErrorResponse) => {
                setLoading(false);
                handleWrongQueryRequest(e?.details?.db_message || e?.details?.description, query);
            });
    };
    const handleQueryEditorUpdate = (v: string) => {
        setQuery(v);

        setDisabled(v.trim().length === 0);
    };
    return (
        <Dialog className={b()} open={true} hasCloseButton={true} onClose={handleClose}>
            <Dialog.Header caption={i18n('title_edit-query')} />
            <Dialog.Body>
                <Flex direction="column" className={b('content')}>
                    <QueryEditor query={query} onQueryEditorUpdate={handleQueryEditorUpdate} />
                    {errorState ? (
                        <QueryError query={errorState.failedQuery} reason={errorState.reason} />
                    ) : null}
                </Flex>
            </Dialog.Body>
            <Dialog.Footer
                preset="default"
                loading={loading}
                showError={false}
                listenKeyEnter={false}
                propsButtonApply={{disabled}}
                onClickButtonCancel={handleClose}
                onClickButtonApply={handleApply}
                textButtonApply={i18n('button_apply')}
                textButtonCancel={i18n('button_cancel')}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_EDIT_QUERY, DialogEditQuery);
