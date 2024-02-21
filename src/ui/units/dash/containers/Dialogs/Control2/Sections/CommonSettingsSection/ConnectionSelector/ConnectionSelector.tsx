import React from 'react';

import {useSelector} from 'react-redux';
import {EntryScope} from 'shared';

import {selectSelectorDialog} from '../../../../../../store/selectors/dashTypedSelectors';
import {EntrySelector} from '../EntrySelector/EntrySelector';

const i18nConnectionBasedControlFake = (str: string) => str;
const getConnectionLink = (connectionId: string) => `/connections/${connectionId}`;
export const ConnectionSelector = () => {
    const {connectionId} = useSelector(selectSelectorDialog);

    const handleEntryChange = () => {};

    return (
        <React.Fragment>
            <EntrySelector
                label={i18nConnectionBasedControlFake('field_connection')}
                entryId={connectionId}
                scope={EntryScope.Connection}
                handleEntryChange={handleEntryChange}
                isValidEntry={true}
                getEntryLink={getConnectionLink}
            />
        </React.Fragment>
    );
};
