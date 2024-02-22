import React from 'react';

import {useDispatch, useSelector} from 'react-redux';
import {EntryScope} from 'shared';
import type {GetEntryResponse} from 'shared/schema';

import {setSelectorDialogItem} from '../../../../../../../../store/actions/dashTyped';
import {selectSelectorDialog} from '../../../../../../../../store/selectors/dashTypedSelectors';
import {EntrySelector} from '../../../EntrySelector/EntrySelector';

const i18nConnectionBasedControlFake = (str: string) => str;
const getConnectionLink = (connectionId: string) => `/connections/${connectionId}`;
export const ConnectionSelector = () => {
    const dispatch = useDispatch();
    const {connectionId} = useSelector(selectSelectorDialog);

    const handleEntryChange = (data: {entry: GetEntryResponse}) => {
        dispatch(setSelectorDialogItem({connectionId: data.entry.entryId}));
    };

    return (
        <EntrySelector
            label={i18nConnectionBasedControlFake('field_connection')}
            entryId={connectionId}
            scope={EntryScope.Connection}
            handleEntryChange={handleEntryChange}
            isValidEntry={true}
            getEntryLink={getConnectionLink}
            errorText={i18nConnectionBasedControlFake('error_unsupported-connection')}
        />
    );
};
