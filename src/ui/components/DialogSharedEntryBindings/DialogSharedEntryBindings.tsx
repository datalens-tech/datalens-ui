import React from 'react';

import {Dialog, Divider} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';

import DialogManager from '../DialogManager/DialogManager';
import {EntitiesList} from '../EntitiesList/EntitiesList';
import {SmartLoader} from '../SmartLoader/SmartLoader';

import {DeleteAlert} from './components/DeleteAlert';
import {DirectionControl} from './components/DirectionControl';
import {Relations} from './components/Relations';
import {SharedBindingsFooter} from './components/SharedBindingsFooter';
import {SharedBindingsHeader} from './components/SharedBindingsHeader';
import {DialogClassName} from './constants';
import {useSharedEntryBindings} from './hooks/useSharedEntryBindings';
import type {SharedEntry} from './types';

import './DialogSharedEntryBindings.scss';

type DialogSharedEntryBindingsProps = {
    open: boolean;
    entry: SharedEntry;
    onClose: () => void;
    isDeleteDialog?: boolean;
    onDeleteSuccess?: () => void;
};

export const DIALOG_SHARED_ENTRY_BINDINGS = Symbol('DIALOG_SHARED_ENTRY_BINDINGS');

export interface OpenDialogSharedEntryBindingArgs {
    id: typeof DIALOG_SHARED_ENTRY_BINDINGS;
    props: DialogSharedEntryBindingsProps;
}

const b = block(DialogClassName);

export const DialogSharedEntryBindings: React.FC<DialogSharedEntryBindingsProps> = ({
    onClose,
    open,
    entry,
    onDeleteSuccess,
    isDeleteDialog = false,
}) => {
    const {
        isLoading,
        isSearchLoading,
        onSearch,
        isError,
        searchValue,
        entities,
        onDirectionChange,
        currentDirection,
        fetchEntityBindings,
    } = useSharedEntryBindings({
        entry,
    });
    const showDirectionControl = entry.scope === 'dataset';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            className={b({'empty-list': isDeleteDialog && entities.length === 0})}
        >
            <SharedBindingsHeader isDeleteDialog={isDeleteDialog} entry={entry} />
            <Dialog.Body className={b('body')}>
                <EntitiesList
                    entities={[entry]}
                    title={getSharedEntryMockText('label-current-entry')}
                    className={b('current-row')}
                />
                {isLoading && !isSearchLoading ? (
                    <SmartLoader showAfter={0} />
                ) : (
                    <>
                        <DeleteAlert
                            isDeleteDialog={isDeleteDialog}
                            entry={entry}
                            entities={entities}
                            isError={isError}
                        />
                        {!showDirectionControl && !isDeleteDialog && (
                            <Divider className={b('divider')} />
                        )}
                        {showDirectionControl && (
                            <DirectionControl
                                currentDirection={currentDirection}
                                onUpdate={onDirectionChange}
                            />
                        )}
                        <Relations
                            isError={isError}
                            entities={entities}
                            currentDirection={currentDirection}
                            isDeleteDialog={isDeleteDialog}
                            isLoading={isLoading}
                            isSearchLoading={isSearchLoading}
                            onSearch={onSearch}
                            showDirectionControl={showDirectionControl}
                            searchValue={searchValue}
                            entry={entry}
                            fetchEntityBindings={fetchEntityBindings}
                        />
                    </>
                )}
                {isDeleteDialog && (
                    <SharedBindingsFooter
                        onClose={onClose}
                        entry={entry}
                        onRefresh={() => fetchEntityBindings(searchValue)}
                        isLoading={isLoading || isSearchLoading}
                        emptyList={entities.length === 0}
                        onDeleteSuccess={onDeleteSuccess}
                    />
                )}
            </Dialog.Body>
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_SHARED_ENTRY_BINDINGS, DialogSharedEntryBindings);
