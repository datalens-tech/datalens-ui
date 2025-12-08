import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch} from 'react-redux';
import {CollectionItemEntities} from 'shared';
import type {SharedEntryBindingsItem} from 'shared/schema';
import {getSdk} from 'ui/libs/schematic-sdk';
import type {AppDispatch} from 'ui/store';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {showToast} from 'ui/store/actions/toaster';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';

import {DIALOG_SHARED_ENTRY_PERMISSIONS} from '../../DialogSharedEntryPermissions/DialogSharedEntryPermissions';
import {DIALOG_SHARED_ENTRY_UNBIND} from '../../DialogSharedEntryUnbind/DialogSharedEntryUnbind';
import {PlaceholderIllustration} from '../../PlaceholderIllustration/PlaceholderIllustration';
import {SharedBindingsList} from '../../SharedBindingsList/SharedBindingsList';
import type {AttachmentValue} from '../constants';
import {DialogClassName, ObjectsListTitles} from '../constants';
import type {SharedEntry} from '../types';
import {getIsRelationUnbind} from '../utils';

type RelationsProps = {
    isError: boolean;
    isDeleteDialog: boolean;
    entities: SharedEntryBindingsItem[];
    entry: SharedEntry;
    currentDirection: AttachmentValue;
    onSearch: (value: string) => void;
    searchValue: string;
    isLoading: boolean;
    isSearchLoading: boolean;
    showDirectionControl: boolean;
    fetchEntityBindings: (filter?: string) => void;
};

const b = block(DialogClassName);

export const Relations = ({
    isError,
    isDeleteDialog,
    entities,
    entry,
    currentDirection,
    onSearch,
    searchValue,
    isSearchLoading,
    isLoading,
    showDirectionControl,
    fetchEntityBindings,
}: RelationsProps) => {
    const dispatch: AppDispatch = useDispatch();

    const showErrorToast = React.useCallback(
        (error) => {
            dispatch(
                showToast({
                    title: error.message,
                    error,
                }),
            );
        },
        [dispatch],
    );

    const getListItemActions = React.useCallback(
        (item: SharedEntryBindingsItem) => {
            const isRelationUnbind = getIsRelationUnbind(currentDirection, item);
            const relation = isRelationUnbind ? undefined : item;
            const parentEntry = isRelationUnbind ? item : entry;
            const sourceId = isRelationUnbind ? item.entryId : entry.entryId;
            const target = isRelationUnbind ? entry : item;

            let targetId = '';

            if ('entity' in target && target.entity === CollectionItemEntities.WORKBOOK) {
                targetId = target.workbookId!;
            } else if ('entryId' in target) {
                targetId = target.entryId;
            }

            return [
                {
                    text: getSharedEntryMockText('shared-bindings-list-action-unbind'),
                    action: () => {
                        dispatch(
                            openDialog({
                                id: DIALOG_SHARED_ENTRY_UNBIND,
                                props: {
                                    entry: parentEntry,
                                    onClose: () => dispatch(closeDialog()),
                                    onApply: async () => {
                                        try {
                                            await getSdk().sdk.us.deleteSharedEntryBinding({
                                                sourceId,
                                                targetId,
                                            });
                                            dispatch(closeDialog());
                                            fetchEntityBindings(isDeleteDialog ? '' : searchValue);
                                        } catch (error) {
                                            showErrorToast(error);
                                        }
                                    },
                                    open: true,
                                    relation,
                                },
                            }),
                        );
                    },
                },
                {
                    text: getSharedEntryMockText('shared-bindings-list-action-change-permissions'),
                    action: () =>
                        dispatch(
                            openDialog({
                                id: DIALOG_SHARED_ENTRY_PERMISSIONS,
                                props: {
                                    entry: parentEntry,
                                    onClose: () => dispatch(closeDialog()),
                                    onApply: async (delegate) => {
                                        try {
                                            await getSdk().sdk.us.updateSharedEntryBinding({
                                                sourceId,
                                                targetId,
                                                delegation: delegate,
                                            });
                                            dispatch(closeDialog());
                                            fetchEntityBindings(searchValue);
                                        } catch (error) {
                                            showErrorToast(error);
                                        }
                                    },
                                    open: true,
                                    delegation: item.isDelegated,
                                    relation,
                                },
                            }),
                        ),
                },
            ];
        },
        [
            currentDirection,
            dispatch,
            entry,
            fetchEntityBindings,
            showErrorToast,
            searchValue,
            isDeleteDialog,
        ],
    );

    if (isError) {
        const renderRetryAction = () => (
            <Button
                className={b('button-retry')}
                size="l"
                view="action"
                onClick={() => fetchEntityBindings(searchValue)}
            >
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

    if (isDeleteDialog && entities.length === 0) {
        return null;
    }

    return (
        <SharedBindingsList
            entities={entities}
            searchProps={{
                value: searchValue,
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
