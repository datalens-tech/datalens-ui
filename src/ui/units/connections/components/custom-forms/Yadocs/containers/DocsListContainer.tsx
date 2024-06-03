import React from 'react';

import {I18n} from 'i18n';
import get from 'lodash/get';
import {batch, useDispatch, useSelector} from 'react-redux';

import {usePrevious} from '../../../../../../hooks';
import {
    connectionIdSelector,
    extractYadocItemId,
    findUploadedYadoc,
    formOauthTokenSelector,
    getFilteredYadocItems,
    getYadocItemIndex,
    handleReplacedSources,
    innerAuthorizedSelector,
    retryPollYadocStatus,
    setYadocItemsAndFormSources,
    setYadocsActiveDialog,
    setYadocsSelectedItemId,
    updateYadocSource,
    yadocsActiveDialogSelector,
    yadocsItemsSelector,
    yadocsSelectedItemIdSelector,
} from '../../../../store';
import {DocsList} from '../components';
import type {HandleItemClick} from '../types';

import {useYadocsDialogs} from './useYadocsDialogs';

const i18n = I18n.keyset('connections.gsheet.view');

export const DocsListContainer = () => {
    const dispatch = useDispatch();
    const {
        openSourcesDialog,
        openRenameSourceDialog,
        openAddDocumentDialog,
        openReplaceSourceDialog,
    } = useYadocsDialogs();
    const activeDialog = useSelector(yadocsActiveDialogSelector);
    const prevActiveDialog = usePrevious(activeDialog);
    const authorized = useSelector(innerAuthorizedSelector);
    const connectionId = useSelector(connectionIdSelector);
    const items = useSelector(yadocsItemsSelector);
    const oauthToken = useSelector(formOauthTokenSelector);
    const selectedItemId = useSelector(yadocsSelectedItemIdSelector);
    const selectedItemIndex = React.useMemo(() => {
        return getYadocItemIndex(items, selectedItemId);
    }, [selectedItemId, items]);

    const clickAddDocumentButton = React.useCallback(() => {
        dispatch(
            setYadocsActiveDialog({
                activeDialog: {
                    type: 'dialog-add-document',
                    connectionId,
                    oauthToken,
                },
            }),
        );
    }, [connectionId, oauthToken, dispatch]);

    const clickListItem = React.useCallback<HandleItemClick>(
        (item) => {
            batch(() => {
                const itemId = extractYadocItemId(item);
                switch (item.type) {
                    case 'uploadedYadoc': {
                        if (item.status === 'ready') {
                            const fileId = get(item, ['data', 'file_id']);
                            dispatch(
                                setYadocsActiveDialog({
                                    activeDialog: {
                                        type: 'dialog-sources',
                                        fileId,
                                        batch: !item.replacedSourceId,
                                    },
                                }),
                            );
                        }
                        break;
                    }
                }

                if (itemId !== selectedItemId) {
                    dispatch(setYadocsSelectedItemId({selectedItemId: itemId}));
                }
            });
        },
        [selectedItemId, dispatch],
    );

    const deleteListItem = React.useCallback<HandleItemClick>(
        (item) => {
            const nextItems = getFilteredYadocItems(items, extractYadocItemId(item));
            const replacedSourceId = extractYadocItemId(item);
            batch(() => {
                dispatch(setYadocItemsAndFormSources(nextItems));
                dispatch(handleReplacedSources({action: 'filter', replacedSourceId}));
            });
        },
        [items, dispatch],
    );

    const clickErrorAction = React.useCallback<HandleItemClick>(
        (item) => {
            switch (item.type) {
                case 'uploadedYadoc': {
                    dispatch(retryPollYadocStatus(item.data.file_id));
                    break;
                }
                case 'yadocSourceInfo': {
                    const fileId = get(item, ['fileId']);
                    const sourceId = get(item, ['data', 'source_id']);
                    dispatch(updateYadocSource({fileId, sourceId}));
                    break;
                }
                case 'yadocEditableSource': {
                    const fileId = get(item, ['data', 'file_id']);
                    const sourceId = get(item, ['data', 'source', 'source_id']);
                    dispatch(updateYadocSource({fileId, sourceId}));
                }
            }
        },
        [dispatch],
    );

    const clickRenameAction = React.useCallback<HandleItemClick>(
        (item) => {
            let sourceId: string | undefined;
            let value: string | undefined;

            switch (item.type) {
                case 'yadocEditableSource': {
                    sourceId = get(item, ['data', 'source', 'source_id']);
                    value = get(item, ['data', 'source', 'title']);
                    break;
                }
                case 'yadocReadonlySource': {
                    sourceId = get(item, ['data', 'id']);
                    value = get(item, ['data', 'title']);
                }
            }

            if (sourceId) {
                dispatch(
                    setYadocsActiveDialog({
                        activeDialog: {type: 'dialog-rename', sourceId, value},
                    }),
                );
            }
        },
        [dispatch],
    );

    const clickReplaceAction = React.useCallback<HandleItemClick>(
        (item) => {
            let sourceId: string | undefined;

            switch (item.type) {
                case 'yadocEditableSource': {
                    sourceId = get(item, ['data', 'source', 'source_id']);
                    break;
                }
                case 'yadocReadonlySource': {
                    sourceId = get(item, ['data', 'id']);
                }
            }

            if (sourceId) {
                dispatch(
                    setYadocsActiveDialog({
                        activeDialog: {
                            type: 'dialog-replace',
                            sourceId,
                            connectionId,
                        },
                    }),
                );
            }
        },
        [connectionId, dispatch],
    );

    React.useEffect(() => {
        if (activeDialog) {
            const alreadyOpened = prevActiveDialog?.type === activeDialog.type;

            switch (activeDialog.type) {
                case 'dialog-sources': {
                    const yadoc = findUploadedYadoc(items, activeDialog.fileId);

                    if (yadoc) {
                        openSourcesDialog({
                            yadoc,
                            batch: activeDialog.batch,
                            update: alreadyOpened,
                        });
                    }

                    break;
                }
                case 'dialog-add-document': {
                    const {type: _, ...dialogArgs} = activeDialog;
                    openAddDocumentDialog({
                        ...dialogArgs,
                        authorized,
                        oauthToken,
                        update: alreadyOpened,
                    });
                    break;
                }
                case 'dialog-rename': {
                    const {type: _, ...dialogArgs} = activeDialog;
                    const type = items[getYadocItemIndex(items, dialogArgs.sourceId)]?.type;
                    openRenameSourceDialog({
                        ...dialogArgs,
                        type,
                        caption: i18n('label_replace-name'),
                        update: alreadyOpened,
                    });

                    break;
                }
                case 'dialog-replace': {
                    const {type: _, ...dialogArgs} = activeDialog;
                    openReplaceSourceDialog({
                        ...dialogArgs,
                        authorized,
                        caption: i18n('label_replace-source'),
                        oauthToken,
                        update: alreadyOpened,
                    });
                }
            }
        }
    }, [
        items,
        activeDialog,
        prevActiveDialog,
        authorized,
        oauthToken,
        openSourcesDialog,
        openRenameSourceDialog,
        openAddDocumentDialog,
        openReplaceSourceDialog,
    ]);

    React.useEffect(() => {
        const isItemInList = getYadocItemIndex(items, selectedItemId) !== -1;

        if ((!selectedItemId || !isItemInList) && items.length) {
            const nextId = extractYadocItemId(items[0]);
            dispatch(setYadocsSelectedItemId({selectedItemId: nextId}));
        }

        if (selectedItemId && !items.length) {
            dispatch(setYadocsSelectedItemId({selectedItemId: ''}));
        }
    }, [selectedItemId, items, dispatch]);

    return (
        <DocsList
            items={items}
            selectedItemIndex={selectedItemIndex}
            clickAddDocumentButton={clickAddDocumentButton}
            clickErrorAction={clickErrorAction}
            clickListItem={clickListItem}
            clickRenameAction={clickRenameAction}
            clickReplaceAction={clickReplaceAction}
            deleteListItem={deleteListItem}
        />
    );
};
