import React from 'react';

import {Button, Dialog, Divider, SegmentedRadioGroup as RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import debounce from 'lodash/debounce';
import {useDispatch} from 'react-redux';
import {CollectionItemEntities} from 'shared';
import type {GetEntryResponse, SharedEntry, SharedEntryBindingsItem} from 'shared/schema';
import {getSdk} from 'ui/libs/schematic-sdk';
import type {AppDispatch} from 'ui/store';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';

import {closeDialog, openDialog} from '../../store/actions/dialog';
import DialogManager from '../DialogManager/DialogManager';
import {DIALOG_SHARED_ENTRY_PERMISSIONS} from '../DialogSharedEntryPermissions/DialogSharedEntryPermissions';
import {DIALOG_SHARED_ENTRY_UNBIND} from '../DialogSharedEntryUnbind/DialogSharedEntryUnbind';
import {EntitiesList} from '../EntitiesList/EntitiesList';
import {PlaceholderIllustration} from '../PlaceholderIllustration/PlaceholderIllustration';
import {SharedBindingsList} from '../SharedBindingsList/SharedBindingsList';

import type {AttachmentValue} from './constants';
import {Attachment, ObjectsListTitles, SEARCH_DELAY} from './constants';

import './DialogSharedEntryBindings.scss';

type DialogSharedEntryBindingsProps = {
    open: boolean;
    entry: GetEntryResponse;
    onClose: () => void;
};

export const DIALOG_SHARED_ENTRY_BINDINGS = Symbol('DIALOG_SHARED_ENTRY_BINDINGS');

const CONCURRENT_ID = 'shared-entry-bindings';
const cancelConcurrentRequest = () => getSdk().cancelRequest(CONCURRENT_ID);

export interface OpenDialogSharedEntryBindingArgs {
    id: typeof DIALOG_SHARED_ENTRY_BINDINGS;
    props: DialogSharedEntryBindingsProps;
}

const sortEntities = (entities: SharedEntryBindingsItem[]) => {
    return entities.sort((entity) => (entity.entity === CollectionItemEntities.WORKBOOK ? -1 : 1));
};

const b = block('dialog-shared-entries-binding');

const getIsRelationUnbind = (
    currentDirection: AttachmentValue,
    item: SharedEntryBindingsItem,
): item is SharedEntryBindingsItem & SharedEntry => {
    return currentDirection === Attachment.SOURCE && 'scope' in item;
};

export const DialogSharedEntryBindings: React.FC<DialogSharedEntryBindingsProps> = ({
    onClose,
    open,
    entry,
}) => {
    const [currentDirection, setCurrentDirection] = React.useState<AttachmentValue>(
        Attachment.SOURCE,
    );
    const dispatch: AppDispatch = useDispatch();
    const [entities, setEntities] = React.useState<SharedEntryBindingsItem[]>([]);

    const [searchFilter, setSearchFilter] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSearchLoading, setIsSearchLoading] = React.useState(false);
    const [isError, setIsError] = React.useState(false);

    const showDirectionControl = entry.scope === 'dataset';

    const handleDirectionChange = (value: AttachmentValue) => {
        setCurrentDirection(value);
    };

    const fetchEntityBindings = React.useCallback(
        (filter = '') => {
            setIsLoading(true);
            setIsError(false);
            cancelConcurrentRequest();
            getSdk()
                .sdk.us.getSharedEntryBindings({
                    entryId: entry.entryId,
                    entryAs: currentDirection,
                    filterString: filter ? filter : undefined,
                    mode: 'all',
                })
                .then((response) => {
                    setEntities(sortEntities(response.items));
                    setIsLoading(false);
                    setIsSearchLoading(false);
                })
                .catch((error) => {
                    if (error.isCancelled) {
                        return;
                    }
                    setIsError(true);
                    setIsLoading(false);
                    setIsSearchLoading(false);
                });
        },
        [entry, currentDirection],
    );

    const debouncedSearch = React.useMemo(
        () =>
            debounce((value: string) => {
                setIsSearchLoading(true);
                fetchEntityBindings(value);
            }, SEARCH_DELAY),
        [fetchEntityBindings],
    );

    const onSearch = React.useCallback(
        (value: string) => {
            setSearchFilter(value);
            debouncedSearch(value);
        },
        [debouncedSearch],
    );

    React.useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    React.useEffect(() => {
        setSearchFilter('');
        fetchEntityBindings();
    }, [fetchEntityBindings]);

    const getListItemActions = React.useCallback(
        (item: SharedEntryBindingsItem) => {
            return [
                {
                    text: getSharedEntryMockText('shared-bindings-list-action-unbind'),
                    action: () =>
                        dispatch(
                            openDialog({
                                id: DIALOG_SHARED_ENTRY_UNBIND,
                                props: {
                                    entry: getIsRelationUnbind(currentDirection, item)
                                        ? item
                                        : entry,
                                    onClose: () => dispatch(closeDialog()),
                                    onApply: () => {},
                                    open: true,
                                    relation: getIsRelationUnbind(currentDirection, item)
                                        ? undefined
                                        : item,
                                },
                            }),
                        ),
                },
                {
                    text: getSharedEntryMockText('shared-bindings-list-action-change-permissions'),
                    action: () =>
                        dispatch(
                            openDialog({
                                id: DIALOG_SHARED_ENTRY_PERMISSIONS,
                                props: {
                                    entry,
                                    onClose: () => dispatch(closeDialog()),
                                    onApply: () => {},
                                    open: true,
                                    relation: item,
                                },
                            }),
                        ),
                },
            ];
        },
        [currentDirection, dispatch, entry],
    );

    const renderRelations = () => {
        if (isError) {
            const renderRetryAction = () => (
                <Button className={b('button-retry')} size="l" view="action" onClick={() => {}}>
                    {getSharedEntryMockText('bindings-dialog-retry-btn')}
                </Button>
            );

            return (
                <div className={b('error-state')}>
                    <PlaceholderIllustration
                        direction="column"
                        name="error"
                        title={getSharedEntryMockText('bindings-dialog-error')}
                        renderAction={renderRetryAction}
                    />
                </div>
            );
        }

        return (
            <SharedBindingsList
                entities={entities}
                searchProps={{
                    value: searchFilter,
                    onUpdate: onSearch,
                    placeholder: getSharedEntryMockText('entries-list-search-placeholder'),
                    disabled: isLoading || isError,
                    loading: isSearchLoading,
                }}
                title={
                    showDirectionControl
                        ? getSharedEntryMockText(ObjectsListTitles[currentDirection])
                        : undefined
                }
                getListItemActions={getListItemActions}
                isLoading={isLoading}
            />
        );
    };

    return (
        <Dialog open={open} onClose={onClose} className={b()}>
            <Dialog.Header caption={getSharedEntryMockText('title-bindings-dialog')} />
            <Dialog.Body className={b('body')}>
                <EntitiesList
                    entities={[entry]}
                    title={getSharedEntryMockText('label-current-entry')}
                    className={b('current-row')}
                />
                {!showDirectionControl && <Divider className={b('divider')} />}
                {showDirectionControl && (
                    <RadioButton
                        className={b('direction')}
                        value={currentDirection}
                        onUpdate={handleDirectionChange}
                        width="auto"
                    >
                        <RadioButton.Option value={Attachment.SOURCE}>
                            {getSharedEntryMockText('label-attachment-source')}
                        </RadioButton.Option>
                        <RadioButton.Option value={Attachment.TARGET}>
                            {getSharedEntryMockText('label-attachment-target')}
                        </RadioButton.Option>
                    </RadioButton>
                )}
                {renderRelations()}
            </Dialog.Body>
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_SHARED_ENTRY_BINDINGS, DialogSharedEntryBindings);
