import React from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {InnerFieldKey} from '../../../../constants';
import type {ApplySourceSettings} from '../../../../store';
import {
    applyGSheetSourceSettings,
    getGSheetItemIndex,
    gsheetColumnFilterSelector,
    gsheetItemsSelector,
    gsheetSelectedItemIdSelector,
    innerFormSelector,
    setGSheetColumnFilter,
} from '../../../../store';
import {Workspace} from '../components';
import type {UpdateColumnFilter} from '../types';

import {useGoogleAuth} from './useGoogleAuth';

export const WorkspaceContainer = () => {
    const dispatch = useDispatch();
    const {clickGoogleLoginButton} = useGoogleAuth();
    const items = useSelector(gsheetItemsSelector);
    const columnFilter = useSelector(gsheetColumnFilterSelector);
    const selectedItemId = useSelector(gsheetSelectedItemIdSelector);
    const innerForm = useSelector(innerFormSelector);
    const selectedItem = React.useMemo(() => {
        const selectedItemIndex = getGSheetItemIndex(items, selectedItemId);
        return items[selectedItemIndex];
    }, [items, selectedItemId]);
    const authorized = innerForm[InnerFieldKey.Authorized] as boolean;

    const updateColumnFilter = React.useCallback<UpdateColumnFilter>(
        (value) => {
            dispatch(setGSheetColumnFilter({columnFilter: value}));
        },
        [dispatch],
    );

    const updateSourceSettings = React.useCallback<ApplySourceSettings>(
        (fileId, sourceId, updates) => {
            dispatch(applyGSheetSourceSettings(fileId, sourceId, updates));
        },
        [dispatch],
    );

    return (
        <Workspace
            columnFilter={columnFilter}
            selectedItem={selectedItem}
            authorized={authorized}
            updateColumnFilter={updateColumnFilter}
            updateSourceSettings={updateSourceSettings}
            clickGoogleLoginButton={clickGoogleLoginButton}
        />
    );
};
