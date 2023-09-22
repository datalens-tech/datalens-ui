import React from 'react';

import {I18n} from 'i18n';
import {get} from 'lodash';
import {batch, useDispatch, useSelector} from 'react-redux';

import {InnerFieldKey} from '../../../../constants';
import {
    activeGSheetDialogSelector,
    connectionIdSelector,
    extractGSheetItemId,
    findUploadedGSheet,
    getFilteredGSheetItems,
    getGSheetItemIndex,
    googleRefreshTokenSelector,
    gsheetAddSectionStateSelector,
    gsheetItemsSelector,
    gsheetSelectedItemIdSelector,
    handleReplacedSources,
    innerFormSelector,
    addGoogleSheet as reduxAddGoogleSheet,
    retryPollGSheetStatus,
    setGSheetActiveDialog,
    setGSheetItemsAndFormSources,
    setGSheetSelectedItemId,
    setGsheetAddSectionState,
    updateGSheetSource,
} from '../../../../store';
import {SheetsList} from '../components';
import type {AddGoogleSheet, HandleItemClick, UpdateAddSectionState} from '../types';

import {useGSheetDialogs} from './useGSheetDialogs';
import {getListItems} from './utils';

const i18n = I18n.keyset('connections.gsheet.view');

export const SheetsListContainer = () => {
    const dispatch = useDispatch();
    const {openSourcesDialog, openRenameSourceDialog, openReplaceSourceDialog} = useGSheetDialogs();
    const items = useSelector(gsheetItemsSelector);
    const addSectionState = useSelector(gsheetAddSectionStateSelector);
    const activeDialog = useSelector(activeGSheetDialogSelector);
    const selectedItemId = useSelector(gsheetSelectedItemIdSelector);
    const refreshToken = useSelector(googleRefreshTokenSelector);
    const innerForm = useSelector(innerFormSelector);
    const connectionId = useSelector(connectionIdSelector);
    const authorized = innerForm[InnerFieldKey.Authorized] as boolean;
    const listItems = React.useMemo(() => {
        return getListItems({items});
    }, [items]);
    const selectedItemIndex = React.useMemo(() => {
        return getGSheetItemIndex(listItems, selectedItemId);
    }, [selectedItemId, listItems]);

    const addGoogleSheet = React.useCallback<AddGoogleSheet>(
        (url) => {
            dispatch(reduxAddGoogleSheet(url));
        },
        [dispatch],
    );

    const updateAddSectionState = React.useCallback<UpdateAddSectionState>(
        (updates) => {
            dispatch(setGsheetAddSectionState(updates));
        },
        [dispatch],
    );

    const clickListItem = React.useCallback<HandleItemClick>(
        (item) => {
            batch(() => {
                const itemId = extractGSheetItemId(item);
                switch (item.type) {
                    case 'uploadedGSheet': {
                        if (item.status === 'ready') {
                            const fileId = get(item, ['data', 'file_id']);
                            dispatch(
                                setGSheetActiveDialog({
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
                    dispatch(setGSheetSelectedItemId({selectedItemId: itemId}));
                }
            });
        },
        [selectedItemId, dispatch],
    );

    const deleteListItem = React.useCallback<HandleItemClick>(
        (item) => {
            const nextItems = getFilteredGSheetItems(items, extractGSheetItemId(item));
            const replacedSourceId = extractGSheetItemId(item);
            batch(() => {
                dispatch(setGSheetItemsAndFormSources(nextItems));
                dispatch(handleReplacedSources({action: 'filter', replacedSourceId}));
            });
        },
        [items, dispatch],
    );

    const clickErrorAction = React.useCallback<HandleItemClick>(
        (item) => {
            switch (item.type) {
                case 'uploadedGSheet': {
                    dispatch(retryPollGSheetStatus(item.data.file_id));
                    break;
                }
                case 'gsheetSourceInfo': {
                    const fileId = get(item, ['fileId']);
                    const sourceId = get(item, ['data', 'source_id']);
                    dispatch(updateGSheetSource({fileId, sourceId}));
                    break;
                }
                case 'gsheetEditableSource': {
                    const fileId = get(item, ['data', 'file_id']);
                    const sourceId = get(item, ['data', 'source', 'source_id']);
                    dispatch(updateGSheetSource({fileId, sourceId}));
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
                case 'gsheetEditableSource': {
                    sourceId = get(item, ['data', 'source', 'source_id']);
                    value = get(item, ['data', 'source', 'title']);
                    break;
                }
                case 'gsheetReadonlySource': {
                    sourceId = get(item, ['data', 'id']);
                    value = get(item, ['data', 'title']);
                }
            }

            if (sourceId) {
                dispatch(
                    setGSheetActiveDialog({
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
                case 'gsheetEditableSource': {
                    sourceId = get(item, ['data', 'source', 'source_id']);
                    break;
                }
                case 'gsheetReadonlySource': {
                    sourceId = get(item, ['data', 'id']);
                }
            }

            if (sourceId) {
                dispatch(
                    setGSheetActiveDialog({
                        activeDialog: {
                            type: 'dialog-replace',
                            sourceId,
                            connectionId,
                            refreshToken,
                            authorized,
                        },
                    }),
                );
            }
        },
        [connectionId, refreshToken, authorized, dispatch],
    );

    React.useEffect(() => {
        if (activeDialog) {
            switch (activeDialog.type) {
                case 'dialog-sources': {
                    const gsheet = findUploadedGSheet(items, activeDialog.fileId);

                    if (gsheet) {
                        openSourcesDialog({gsheet, batch: activeDialog.batch});
                    }

                    break;
                }
                case 'dialog-rename': {
                    const {sourceId, value} = activeDialog;
                    const type = items[getGSheetItemIndex(items, sourceId)]?.type;
                    openRenameSourceDialog({
                        type,
                        sourceId,
                        value,
                        caption: i18n('label_replace-name'),
                    });

                    break;
                }
                case 'dialog-replace': {
                    const {
                        sourceId,
                        connectionId: dialogConnectionId,
                        authorized: dialogAuthorized,
                        refreshToken: dialogRefreshToken,
                    } = activeDialog;
                    openReplaceSourceDialog({
                        sourceId,
                        connectionId: dialogConnectionId,
                        authorized: dialogAuthorized,
                        refreshToken: dialogRefreshToken,
                        caption: i18n('label_replace-source'),
                    });
                }
            }
        }
    }, [items, activeDialog, openSourcesDialog, openRenameSourceDialog, openReplaceSourceDialog]);

    React.useEffect(() => {
        const isItemInList = getGSheetItemIndex(listItems, selectedItemId) !== -1;

        if ((!selectedItemId || !isItemInList) && listItems.length) {
            const nextId = extractGSheetItemId(listItems[0]);
            dispatch(setGSheetSelectedItemId({selectedItemId: nextId}));
        }

        if (selectedItemId && !listItems.length) {
            dispatch(setGSheetSelectedItemId({selectedItemId: ''}));
        }
    }, [selectedItemId, listItems, dispatch]);

    return (
        <SheetsList
            addSectionState={addSectionState}
            listItems={listItems}
            selectedItemIndex={selectedItemIndex}
            addGoogleSheet={addGoogleSheet}
            updateAddSectionState={updateAddSectionState}
            clickListItem={clickListItem}
            deleteListItem={deleteListItem}
            clickErrorAction={clickErrorAction}
            clickRenameAction={clickRenameAction}
            clickReplaceAction={clickReplaceAction}
        />
    );
};
