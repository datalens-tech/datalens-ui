import React from 'react';

import {DialogCounterProgress} from 'components/Progress/DialogCounterProgress';
import {useEffectOnce} from 'hooks';
import {I18n} from 'i18n';
import {getSdk} from 'libs/schematic-sdk';
import {PLACE} from 'shared';
import {DialogSuccessWithAction} from 'ui/components/DialogSuccessWithAction/DialogSuccessWithAction';

import type {NavigationEntry} from '../../../../../shared/schema';
import type {ChangeLocation} from '../../types';

import {AccessError} from './AccessError/AccessError';
import {MoveError} from './MoveError/MoveError';
import type {SelectDestinationProps} from './SelectDestination/SelectDestination';
import {SelectDestination} from './SelectDestination/SelectDestination';
import type {ErrorItem} from './types';

const CONCURRENT_ID = 'batchMoveEntry';
const i18n = I18n.keyset('component.navigation.view');

type DialogName = 'progress' | 'success' | 'access' | 'error' | 'destination';

export type BatchMoveProps = {
    entries: NavigationEntry[];
    onClose: () => void;
    refreshNavigation: () => void;
    onChangeLocation: ChangeLocation;
};

export const BatchMove = ({
    entries,
    onClose,
    refreshNavigation,
    onChangeLocation,
}: BatchMoveProps) => {
    const [dialogName, setDialogName] = React.useState<DialogName | null>(null);
    const [errors, setErrors] = React.useState<ErrorItem[]>([]);
    const [countMoved, setCountMoved] = React.useState(0);
    const [destination, setDestination] = React.useState('');
    const moveCancelled = React.useRef(false);

    const entriesWithRights = React.useMemo(() => {
        return entries.filter((entry) => entry.permissions.admin === true);
    }, [entries]);

    useEffectOnce(() => {
        const hasAccessError = entriesWithRights.length !== entries.length;
        setDialogName(hasAccessError ? 'access' : 'destination');
    });

    const cancelRequests = () => {
        moveCancelled.current = true;
        getSdk().cancelRequest(CONCURRENT_ID);
    };

    const handleCloseAndRefresh = () => {
        cancelRequests();
        refreshNavigation();
        onClose();
    };

    const handleClose = () => {
        cancelRequests();
        onClose();
    };

    const handleOpenFolder = () => {
        onChangeLocation(PLACE.ROOT, destination);
    };

    const handleSelectDestination: SelectDestinationProps['onSelectDestionation'] = async (
        path,
        hasChanges,
    ) => {
        if (!hasChanges) {
            handleClose();
            return;
        }

        setDialogName('progress');
        setDestination(path);

        let hasErrors = false;

        for (const [index, entry] of entriesWithRights.entries()) {
            try {
                await getSdk().sdk.us.moveEntry(
                    {
                        entryId: entry.entryId,
                        destination: path,
                    },
                    {concurrentId: CONCURRENT_ID},
                );
            } catch (error) {
                if (getSdk().sdk.isCancel(error)) {
                    moveCancelled.current = true;
                    break;
                }
                hasErrors = true;
                setErrors((prevErrors) => [
                    ...prevErrors,
                    {
                        error,
                        itemIndex: index,
                    },
                ]);
            } finally {
                setCountMoved((prevCount) => prevCount + 1);
            }
        }

        if (moveCancelled.current) {
            return;
        }

        setDialogName(hasErrors ? 'error' : 'success');
    };

    const handleNextAfterAccessError = () => setDialogName('destination');

    switch (dialogName) {
        case 'progress':
            return (
                <DialogCounterProgress
                    count={entriesWithRights.length}
                    value={countMoved}
                    onClose={handleCloseAndRefresh}
                    hasError={errors.length > 0}
                    textButtonCancel={i18n('button_cancel')}
                    caption={i18n('section_batch-move-progress')}
                />
            );
        case 'success':
            return (
                <DialogSuccessWithAction
                    onClose={handleCloseAndRefresh}
                    onClick={handleOpenFolder}
                    title={i18n('label_batch-move-success-description')}
                    buttonText={i18n('button_goto-folder')}
                />
            );
        case 'access':
            return (
                <AccessError
                    onClose={handleClose}
                    entries={entries}
                    entriesWithRights={entriesWithRights}
                    onNext={handleNextAfterAccessError}
                />
            );
        case 'error':
            return (
                <MoveError
                    onClose={handleCloseAndRefresh}
                    entries={entriesWithRights}
                    errors={errors}
                />
            );
        case 'destination':
            return (
                <SelectDestination
                    onClose={handleClose}
                    entries={entriesWithRights}
                    onSelectDestionation={handleSelectDestination}
                />
            );
        default:
            return null;
    }
};
