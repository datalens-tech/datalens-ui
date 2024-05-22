import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {EntryScope} from 'shared';

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

const i18n = I18n.keyset('dash.control-dialog.edit');
export const ConnectionSelector = () => {
    const dispatch = useDispatch();
    const {connectionId} = useSelector(selectSelectorDialog);
    const workbookId = useSelector(selectDashWorkbookId);

    const [isInvalid, setIsInvalid] = React.useState(false);
    const [unsupportedConnectionError, setUnsupportedConnectionError] = React.useState<
        string | undefined
    >();

    const fetchConnection = React.useCallback(
        async (updatedConnectionId: string) => {
            setIsInvalid(false);

            return getSdk()
                .bi.getConnection({
                    connectionId: updatedConnectionId,
                    workbookId,
                })
                .then((connection) => {
                    const {error, queryTypes} = prepareConnectionData(connection);

                    setUnsupportedConnectionError(error);
                    return queryTypes;
                })
                .catch((error) => {
                    setIsInvalid(true);
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
    const handleEntryChange = ({entryId}: {entryId: string}) => {
        const updatedConnectionId = entryId;
        if (updatedConnectionId === connectionId) {
            return;
        }

        dispatch(setLastUsedConnectionId(updatedConnectionId));

        fetchConnection(updatedConnectionId).then((connectionQueryTypes) => {
            dispatch(
                setSelectorDialogItem({
                    connectionId: entryId,
                    elementType: ELEMENT_TYPE.SELECT,
                    defaultValue: undefined,
                    useDefaultValue: false,
                    connectionQueryType: undefined,
                    connectionQueryContent: undefined,
                    connectionQueryTypes,
                }),
            );
        });
    };

    const isEntryInvalid = !isInvalid || Boolean(unsupportedConnectionError);

    return (
        <EntrySelector
            label={i18n('field_connection')}
            entryId={connectionId}
            scope={EntryScope.Connection}
            onChange={handleEntryChange}
            isInvalid={isEntryInvalid}
            errorText={unsupportedConnectionError}
            workbookId={workbookId}
        />
    );
};
