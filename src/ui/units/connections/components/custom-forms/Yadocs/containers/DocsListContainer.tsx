import React from 'react';

import get from 'lodash/get';
import {batch, useDispatch, useSelector} from 'react-redux';

import {
    addYandexDocument,
    extractYadocItemId,
    findUploadedYadoc,
    getYadocItemIndex,
    setYadocsActiveDialog,
    setYadocsAddSectionState,
    setYadocsSelectedItemId,
    yadocsActiveDialogSelector,
    yadocsAddSectionStateSelector,
    yadocsItemsSelector,
    yadocsSelectedItemIdSelector,
} from '../../../../store';
import {DocsList} from '../components';
import {HandleItemClick, UpdateAddSectionState} from '../types';

import {useYadocsDialogs} from './useGSheetDialogs';

export const DocsListContainer = () => {
    const dispatch = useDispatch();
    const {openSourcesDialog} = useYadocsDialogs();
    const activeDialog = useSelector(yadocsActiveDialogSelector);
    const addSectionState = useSelector(yadocsAddSectionStateSelector);
    const items = useSelector(yadocsItemsSelector);
    const selectedItemId = useSelector(yadocsSelectedItemIdSelector);
    const selectedItemIndex = React.useMemo(() => {
        return getYadocItemIndex(items, selectedItemId);
    }, [selectedItemId, items]);

    const addYandexDoc = React.useCallback(() => {
        dispatch(addYandexDocument());
    }, [dispatch]);

    const updateAddSectionState = React.useCallback<UpdateAddSectionState>(
        (updates) => {
            dispatch(setYadocsAddSectionState(updates));
        },
        [dispatch],
    );

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

    React.useEffect(() => {
        if (activeDialog) {
            switch (activeDialog.type) {
                case 'dialog-sources': {
                    const yadoc = findUploadedYadoc(items, activeDialog.fileId);

                    if (yadoc) {
                        openSourcesDialog({yadoc, batch: activeDialog.batch});
                    }

                    break;
                }
            }
        }
    }, [items, activeDialog, openSourcesDialog]);

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
            addSectionState={addSectionState}
            selectedItemIndex={selectedItemIndex}
            addYandexDoc={addYandexDoc}
            clickListItem={clickListItem}
            updateAddSectionState={updateAddSectionState}
        />
    );
};
