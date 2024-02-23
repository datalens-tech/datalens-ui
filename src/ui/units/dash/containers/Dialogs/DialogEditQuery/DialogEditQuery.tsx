import React from 'react';

import {Dialog, Flex} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import type {ConnectionQueryContent} from 'shared';
import type {GetConnectionTypedQueryErrorResponse} from 'shared/schema';

import DialogManager from '../../../../../components/DialogManager/DialogManager';
import {getSdk} from '../../../../../libs/schematic-sdk';
import {closeDialog} from '../../../../../store/actions/dialog';
import {selectWorkbookId} from '../../../../workbooks/store/selectors';
import {setSelectorDialogItem} from '../../../store/actions/dashTyped';
import {selectSelectorDialog} from '../../../store/selectors/dashTypedSelectors';

import {QueryEditor} from './QueryEditor/QueryEditor';
import {QueryError} from './QueryError/QueryError';

import './DialogEditQuery.scss';

export const DIALOG_EDIT_QUERY = Symbol('DIALOG_EDIT_QUERY');

export type OpenDialogEditQueryArgs = {
    id: typeof DIALOG_EDIT_QUERY;
    props: undefined;
};

const i18nConnectionBasedControlFake = (str: string) => str;

const b = block('dialog-edit-query');

const DialogEditQuery: React.FC = () => {
    const dispatch = useDispatch();
    const {connectionQueryContent, connectionQueryType, connectionId} =
        useSelector(selectSelectorDialog);
    const workbookId = useSelector(selectWorkbookId);

    const [query, setQuery] = React.useState<string | undefined>(connectionQueryContent?.query);
    const [disabled, setDisabled] = React.useState(connectionQueryContent?.query.length === 0);
    const [loading, setLoading] = React.useState(false);
    const [errorState, setErrorState] = React.useState<
        {error: GetConnectionTypedQueryErrorResponse; failedQuery: string | undefined} | undefined
    >();

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
                    parameters: [],
                },
            })
            .then(() => {
                setErrorState(undefined);
                dispatch(setSelectorDialogItem({connectionQueryContent: queryContent}));
                dispatch(closeDialog());
            })
            .catch((e: GetConnectionTypedQueryErrorResponse) => {
                setDisabled(true);
                setErrorState({error: e, failedQuery: query});
            })
            .finally(() => {
                setLoading(false);
            });
    };
    const handleQueryEditorUpdate = (v: string) => {
        setQuery(v);
        setDisabled(v.trim().length === 0);
    };
    return (
        <Dialog className={b()} open={true} hasCloseButton={true} onClose={handleClose}>
            <Dialog.Header caption={i18nConnectionBasedControlFake('title_edit-query')} />
            <Dialog.Body>
                <Flex direction="column" className={b('content')}>
                    <QueryEditor query={query} onQueryEditorUpdate={handleQueryEditorUpdate} />
                    {errorState ? (
                        <QueryError query={errorState.failedQuery} error={errorState.error} />
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
                textButtonApply={i18nConnectionBasedControlFake('button_apply')}
                textButtonCancel={i18nConnectionBasedControlFake('button_cancel')}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_EDIT_QUERY, DialogEditQuery);
