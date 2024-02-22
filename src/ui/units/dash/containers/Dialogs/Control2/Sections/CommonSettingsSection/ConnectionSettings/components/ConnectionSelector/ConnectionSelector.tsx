import React from 'react';

import {useDispatch, useSelector} from 'react-redux';
import {EntryScope} from 'shared';
import type {GetEntryResponse} from 'shared/schema';

import logger from '../../../../../../../../../../libs/logger';
import {getSdk} from '../../../../../../../../../../libs/schematic-sdk';
import {
    setLastUsedConnectionId,
    setSelectorDialogItem,
} from '../../../../../../../../store/actions/dashTyped';
import {
    selectDashWorkbookId,
    selectSelectorDialog,
} from '../../../../../../../../store/selectors/dashTypedSelectors';
import {ELEMENT_TYPE} from '../../../../../../Control/constants';
import {EntrySelector} from '../../../EntrySelector/EntrySelector';

import {prepareConnectionData} from './helpers';

const i18nConnectionBasedControlFake = (str: string) => str;
const getConnectionLink = (connectionId: string) => `/connections/${connectionId}`;
export const ConnectionSelector = () => {
    const dispatch = useDispatch();
    const {connectionId} = useSelector(selectSelectorDialog);
    const workbookId = useSelector(selectDashWorkbookId);

    const [isValidConnection, setIsValidConnection] = React.useState(false);
    const [unsupportedConnectionError, setUnsupportedConnectionError] = React.useState<
        string | undefined
    >();

    const fetchConnection = React.useCallback(
        async (updatedConnectionId: string) => {
            return getSdk()
                .bi.getConnection({
                    connectionId: updatedConnectionId,
                    workbookId,
                })
                .then((connection) => {
                    const {error, queryTypes} = prepareConnectionData(connection);

                    setUnsupportedConnectionError(error);
                    setIsValidConnection(true);
                    return queryTypes;
                })
                .catch((error) => {
                    setIsValidConnection(false);
                    logger.logError('Connection selector: load connection failed', error);
                    return undefined;
                });
        },
        [workbookId],
    );

    React.useEffect(() => {
        if (connectionId) {
            fetchConnection(connectionId).then((connectionQueryTypes) => {
                dispatch(setSelectorDialogItem({connectionQueryTypes}));
            });
        }
    }, []);
    const handleEntryChange = (data: {entry: GetEntryResponse}) => {
        const updatedConnectionId = data.entry.entryId;
        if (updatedConnectionId === connectionId) {
            return;
        }

        dispatch(setLastUsedConnectionId(updatedConnectionId));

        fetchConnection(updatedConnectionId).then((connectionQueryTypes) => {
            const defaultQueryType = connectionQueryTypes?.[0]?.query_type;
            dispatch(
                setSelectorDialogItem({
                    connectionId: data.entry.entryId,
                    elementType: ELEMENT_TYPE.SELECT,
                    defaultValue: undefined,
                    useDefaultValue: false,
                    connectionQueryType: undefined,
                    connectionQueryContent: undefined,
                    connectionQueryTypes,
                    connectionQueryType: defaultQueryType,
                }),
            );
        });
    };

    return (
        <EntrySelector
            label={i18nConnectionBasedControlFake('field_connection')}
            entryId={connectionId}
            scope={EntryScope.Connection}
            handleEntryChange={handleEntryChange}
            isValidEntry={isValidConnection}
            getEntryLink={getConnectionLink}
            error={Boolean(unsupportedConnectionError)}
            errorText={unsupportedConnectionError}
        />
    );
};
