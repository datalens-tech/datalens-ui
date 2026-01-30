import {clone, get, merge} from 'lodash';
import {batch} from 'react-redux';
import type {RecursivePartial} from 'shared';

import logger from '../../../../../libs/logger';
import {FieldKey} from '../../../constants';
import type {ConnectionsReduxDispatch, GSheetItem, GSheetSourceInfo, GetState} from '../../typings';
import {api} from '../api';
import {
    handleReplacedSources,
    setForm,
    setGSheetActiveDialog,
    setGSheetItems,
    setGSheetSelectedItemId,
} from '../base';

import {
    findUploadedGSheet,
    getFilteredGSheetItems,
    getGSheetItemIndex,
    mapGSheetItemsToAPIFormat,
    shapeGSheetEditableSourceItem,
    shapeGSheetReadonlySourceItemAfterUpdate,
    shapeUploadedGSheetSourceInfoItem,
} from './utils';

type PollingHandlerArgs = {
    fileId: string;
    dispatch: ConnectionsReduxDispatch;
    getState: GetState;
};

type UpdateGSheetSourceArgs = {
    fileId: string;
    sourceId: string;
    initialPolling?: boolean;
};

export type UpdateGSheetItemArgs = {
    id: string;
    updates: Partial<Omit<GSheetItem, 'type' | 'data'>> & {
        data?: RecursivePartial<GSheetItem['data']>;
    };
    shouldUpdateForm?: boolean;
};

export const setGSheetItemsAndFormSources = (items: GSheetItem[]) => {
    return (dispatch: ConnectionsReduxDispatch) => {
        batch(() => {
            const sources = mapGSheetItemsToAPIFormat(items);
            dispatch(setGSheetItems({items}));
            dispatch(setForm({updates: {[FieldKey.Sources]: sources}}));
        });
    };
};

export const updateGSheetItem = (args: UpdateGSheetItemArgs) => {
    return (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const {id, updates, shouldUpdateForm} = args;
        const prevItems = get(getState().connections, ['gsheet', 'items']);
        const updatedItemIndex = getGSheetItemIndex(prevItems, id);
        const updatedItem = merge(clone(prevItems[updatedItemIndex]), updates);
        const items = [...prevItems];
        items.splice(updatedItemIndex, 1, updatedItem);

        if (shouldUpdateForm) {
            dispatch(setGSheetItemsAndFormSources(items));
        } else {
            dispatch(setGSheetItems({items}));
        }
    };
};

export const updateGSheetSource = (args: UpdateGSheetSourceArgs) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const {fileId, sourceId, initialPolling} = args;
        let prevItems = get(getState().connections, ['gsheet', 'items']);
        let index = getGSheetItemIndex(prevItems, sourceId);

        if (prevItems[index]?.status !== 'in_progress') {
            dispatch(
                updateGSheetItem({id: sourceId, updates: {status: 'in_progress', error: null}}),
            );
        }

        const response = await api.updateFileSource(fileId, sourceId);

        if ('source' in response) {
            prevItems = get(getState().connections, ['gsheet', 'items']);
            index = getGSheetItemIndex(prevItems, sourceId);
            const items = [...prevItems];
            const editableSource = initialPolling
                ? shapeGSheetReadonlySourceItemAfterUpdate({data: response.source})
                : shapeGSheetEditableSourceItem({data: response.source});
            items.splice(index, 1, editableSource);
            dispatch(setGSheetItemsAndFormSources(items));
        }

        if ('sourceId' in response) {
            dispatch(
                updateGSheetItem({
                    id: sourceId,
                    updates: {status: 'failed', error: response.error},
                }),
            );
        }
    };
};

export const gsheetToSourcesInfo = (fileId: string, sourcesId: string[]) => {
    return (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const prevItems = get(getState().connections, ['gsheet', 'items']);
        const gsheet = findUploadedGSheet(prevItems, fileId);

        if (!gsheet) {
            logger.logError('Redux actions (conn): gsheetToSourcesInfo failed');
            return;
        }

        const newSources = sourcesId.reduce((acc, sourceId) => {
            const data = gsheet.data.sources?.find((source) => source.source_id === sourceId);

            if (data) {
                acc.push(shapeUploadedGSheetSourceInfoItem({data, fileId}));
            }

            return acc;
        }, [] as GSheetSourceInfo[]);

        batch(() => {
            if (gsheet.replacedSourceId) {
                const gsheetIndex = getGSheetItemIndex(prevItems, fileId);
                const sourceInfo = newSources[0];
                const items = [...prevItems];
                items.splice(gsheetIndex, 1, sourceInfo);
                dispatch(setGSheetItems({items}));
                dispatch(
                    handleReplacedSources({
                        action: 'add',
                        replaceSource: {
                            old_source_id: gsheet.replacedSourceId,
                            new_source_id: sourceInfo.data.source_id,
                        },
                    }),
                );
            } else {
                const filteredPrevItems = getFilteredGSheetItems(prevItems, fileId);
                dispatch(setGSheetItems({items: [...filteredPrevItems, ...newSources]}));
            }

            const selectedItemId = newSources[0].data.source_id;
            dispatch(setGSheetSelectedItemId({selectedItemId}));
            sourcesId.forEach((sourceId) => {
                dispatch(updateGSheetSource({fileId, sourceId}));
            });
        });
    };
};

export async function pollGSheetStatus(args: PollingHandlerArgs) {
    const {fileId, dispatch, getState} = args;
    const {status, error} = await api.checkFileStatus(fileId);
    const items = get(getState().connections, ['gsheet', 'items']);
    const gsheet = findUploadedGSheet(items, fileId);

    if (!gsheet) {
        return;
    }

    switch (status) {
        case 'ready': {
            const {sources} = await api.fetchFileSources(fileId);
            batch(() => {
                dispatch(updateGSheetItem({id: fileId, updates: {data: {sources}, status}}));

                if (sources.length > 1) {
                    dispatch(
                        setGSheetActiveDialog({
                            activeDialog: {
                                type: 'dialog-sources',
                                fileId,
                                batch: !gsheet.replacedSourceId,
                            },
                        }),
                    );
                } else {
                    dispatch(gsheetToSourcesInfo(fileId, [sources[0].source_id]));
                }
            });
            break;
        }
        case 'in_progress': {
            if (gsheet.status !== status) {
                dispatch(updateGSheetItem({id: fileId, updates: {status}}));
            }

            setTimeout(() => pollGSheetStatus(args), 1000);
            break;
        }
        case 'failed': {
            dispatch(updateGSheetItem({id: fileId, updates: {status, error}}));
        }
    }
}

export const pollGSheetSourceStatus = async (
    args: PollingHandlerArgs & {sourceId: string; initialPolling?: boolean},
) => {
    const {fileId, sourceId, initialPolling, dispatch, getState} = args;
    const {status, error} = await api.checkFileSourceStatus(fileId, sourceId);
    const items = get(getState().connections, ['gsheet', 'items']);
    const index = getGSheetItemIndex(items, sourceId);

    if (index === -1) {
        return;
    }

    switch (status) {
        case 'ready': {
            dispatch(updateGSheetSource({fileId, sourceId, initialPolling}));
            break;
        }
        case 'in_progress': {
            if (items[index].status !== status) {
                dispatch(updateGSheetItem({id: sourceId, updates: {status}}));
            }

            setTimeout(() => pollGSheetSourceStatus(args), 1000);
            break;
        }
        case 'failed': {
            dispatch(updateGSheetItem({id: sourceId, updates: {status, error}}));
        }
    }
};
