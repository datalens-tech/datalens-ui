import clone from 'lodash/clone';
import get from 'lodash/get';
import merge from 'lodash/merge';
import {batch} from 'react-redux';
import type {RecursivePartial} from 'shared';

import logger from '../../../../../libs/logger';
import {FieldKey} from '../../../constants';
import type {ConnectionsReduxDispatch, GetState, YadocItem, YadocSourceInfo} from '../../typings';
import {api} from '../api';
import {
    handleReplacedSources,
    setForm,
    setYadocsActiveDialog,
    setYadocsItems,
    setYadocsSelectedItemId,
} from '../base';

import {
    findUploadedYadoc,
    getFilteredYadocItems,
    getYadocItemIndex,
    mapYadocItemsToAPIFormat,
    shapeUploadedYadocSourceInfoItem,
    shapeYadocEditableSourceItem,
    shapeYadocReadonlySourceItemAfterUpdate,
} from './utils';

export type UpdateYadocItemArgs = {
    id: string;
    updates: Partial<Omit<YadocItem, 'type' | 'data'>> & {
        data?: RecursivePartial<YadocItem['data']>;
    };
    shouldUpdateForm?: boolean;
};

type PollingHandlerArgs = {
    fileId: string;
    dispatch: ConnectionsReduxDispatch;
    getState: GetState;
};

type UpdateYadocSourceArgs = {
    fileId: string;
    sourceId: string;
    initialPolling?: boolean;
};

export const setYadocItemsAndFormSources = (items: YadocItem[]) => {
    return (dispatch: ConnectionsReduxDispatch) => {
        batch(() => {
            const sources = mapYadocItemsToAPIFormat(items);
            dispatch(setYadocsItems({items}));
            dispatch(setForm({updates: {[FieldKey.Sources]: sources}}));
        });
    };
};

export const updateYadocItem = (args: UpdateYadocItemArgs) => {
    return (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const {id, updates, shouldUpdateForm} = args;
        const prevItems = get(getState().connections, ['yadocs', 'items']);
        const updatedItemIndex = getYadocItemIndex(prevItems, id);
        const updatedItem = merge(clone(prevItems[updatedItemIndex]), updates);
        const items = [...prevItems];
        items.splice(updatedItemIndex, 1, updatedItem);

        if (shouldUpdateForm) {
            dispatch(setYadocItemsAndFormSources(items));
        } else {
            dispatch(setYadocsItems({items}));
        }
    };
};

export const updateYadocSource = (args: UpdateYadocSourceArgs) => {
    return async (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const {fileId, sourceId, initialPolling} = args;
        let prevItems = get(getState().connections, ['yadocs', 'items']);
        let index = getYadocItemIndex(prevItems, sourceId);

        if (prevItems[index]?.status !== 'in_progress') {
            dispatch(
                updateYadocItem({id: sourceId, updates: {status: 'in_progress', error: null}}),
            );
        }

        const response = await api.updateFileSource(fileId, sourceId);

        if ('source' in response) {
            prevItems = get(getState().connections, ['yadocs', 'items']);
            index = getYadocItemIndex(prevItems, sourceId);
            const items = [...prevItems];
            const editableSource = initialPolling
                ? shapeYadocReadonlySourceItemAfterUpdate({data: response.source})
                : shapeYadocEditableSourceItem({data: response.source});
            items.splice(index, 1, editableSource);
            dispatch(setYadocItemsAndFormSources(items));
        }

        if ('sourceId' in response) {
            dispatch(
                updateYadocItem({
                    id: sourceId,
                    updates: {status: 'failed', error: response.error},
                }),
            );
        }
    };
};

export const yadocToSourcesInfo = (fileId: string, sourcesId: string[]) => {
    return (dispatch: ConnectionsReduxDispatch, getState: GetState) => {
        const prevItems = get(getState().connections, ['yadocs', 'items']);
        const yadoc = findUploadedYadoc(prevItems, fileId);

        if (!yadoc) {
            logger.logError('Redux actions (conn): yadocToSourcesInfo failed');
            return;
        }

        const newSources = sourcesId.reduce((acc, sourceId) => {
            const data = yadoc.data.sources?.find((source) => source.source_id === sourceId);

            if (data) {
                acc.push(shapeUploadedYadocSourceInfoItem({data, fileId}));
            }

            return acc;
        }, [] as YadocSourceInfo[]);

        batch(() => {
            const selectedItemId = newSources[0].data.source_id;

            if (yadoc.replacedSourceId) {
                dispatch(
                    handleReplacedSources({
                        action: 'add',
                        replaceSource: {
                            old_source_id: yadoc.replacedSourceId,
                            new_source_id: selectedItemId,
                        },
                    }),
                );
            } else {
                const filteredPrevItems = getFilteredYadocItems(prevItems, fileId);
                dispatch(setYadocsItems({items: [...filteredPrevItems, ...newSources]}));
            }

            dispatch(setYadocsSelectedItemId({selectedItemId}));
            sourcesId.forEach((sourceId) => {
                dispatch(updateYadocSource({fileId, sourceId}));
            });
        });
    };
};

export const pollYadocStatus = async (args: PollingHandlerArgs) => {
    const {fileId, dispatch, getState} = args;
    const {status, error} = await api.checkFileStatus(fileId);
    const items = get(getState().connections, ['yadocs', 'items']);
    const yadoc = findUploadedYadoc(items, fileId);

    if (!yadoc) {
        return;
    }

    switch (status) {
        case 'ready': {
            const {sources} = await api.fetchFileSources(fileId);
            batch(() => {
                dispatch(updateYadocItem({id: fileId, updates: {data: {sources}, status}}));

                if (sources.length > 1) {
                    dispatch(
                        setYadocsActiveDialog({
                            activeDialog: {
                                type: 'dialog-sources',
                                fileId,
                                batch: !yadoc.replacedSourceId,
                            },
                        }),
                    );
                } else {
                    dispatch(yadocToSourcesInfo(fileId, [sources[0].source_id]));
                }
            });
            break;
        }
        case 'in_progress': {
            if (yadoc.status !== status) {
                dispatch(updateYadocItem({id: fileId, updates: {status}}));
            }

            setTimeout(() => pollYadocStatus(args), 1000);
            break;
        }
        case 'failed': {
            dispatch(updateYadocItem({id: fileId, updates: {status, error}}));
        }
    }
};

export const pollYadocSourceStatus = async (
    args: PollingHandlerArgs & {sourceId: string; initialPolling?: boolean},
) => {
    const {fileId, sourceId, initialPolling, dispatch, getState} = args;
    const {status, error} = await api.checkFileSourceStatus(fileId, sourceId);
    const items = get(getState().connections, ['yadocs', 'items']);
    const index = getYadocItemIndex(items, sourceId);

    if (index === -1) {
        return;
    }

    switch (status) {
        case 'ready': {
            dispatch(updateYadocSource({fileId, sourceId, initialPolling}));
            break;
        }
        case 'in_progress': {
            if (items[index].status !== status) {
                dispatch(updateYadocItem({id: sourceId, updates: {status}}));
            }

            setTimeout(() => pollYadocSourceStatus(args), 1000);
            break;
        }
        case 'failed': {
            dispatch(updateYadocItem({id: sourceId, updates: {status, error}}));
        }
    }
};
