import React from 'react';

import {useDispatch, useSelector} from 'react-redux';

import type {ApplySourceSettings} from '../../../../store';
import {
    applyYadocSourceSettings,
    getYadocItemIndex,
    setYadocsColumnFilter,
    yadocsColumnFilterSelector,
    yadocsItemsSelector,
    yadocsSelectedItemIdSelector,
} from '../../../../store';
import {Workspace} from '../components';

export const WorkspaceContainer = () => {
    const dispatch = useDispatch();
    const columnFilter = useSelector(yadocsColumnFilterSelector);
    const items = useSelector(yadocsItemsSelector);
    const selectedItemId = useSelector(yadocsSelectedItemIdSelector);
    const selectedItemIndex = getYadocItemIndex(items, selectedItemId);
    const selectedItem = items[selectedItemIndex];

    const updateColumnFilter = React.useCallback(
        (value: string) => {
            dispatch(setYadocsColumnFilter({columnFilter: value}));
        },
        [dispatch],
    );

    const updateSourceSettings = React.useCallback<ApplySourceSettings>(
        (fileId, sourceId, updates) => {
            dispatch(applyYadocSourceSettings(fileId, sourceId, updates));
        },
        [dispatch],
    );

    return (
        <Workspace
            columnFilter={columnFilter}
            selectedItem={selectedItem}
            updateColumnFilter={updateColumnFilter}
            updateSourceSettings={updateSourceSettings}
        />
    );
};
