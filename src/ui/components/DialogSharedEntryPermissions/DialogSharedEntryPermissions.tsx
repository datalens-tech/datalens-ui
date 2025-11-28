import React from 'react';

import {ShieldCheck, ShieldKeyhole} from '@gravity-ui/icons';
import {Dialog, Divider, Link, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {SharedEntryBindingsItem} from 'shared/schema';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';

import DialogManager from '../DialogManager/DialogManager';
import type {SharedEntry} from '../DialogSharedEntryBindings/types';
import {EntitiesList} from '../EntitiesList/EntitiesList';
import {EntityLink} from '../EntityLink/EntityLink';

import {PermissionButton} from './components/PermissionButton/PermissionButton';

import './DialogSharedEntryPermissions.scss';

type DialogSharedEntryPermissionsProps = {
    open: boolean;
    onClose: () => void;
    entry: SharedEntry;
    relation?: SharedEntryBindingsItem;
    onApply: (delegate: boolean) => Promise<void> | void;
    delegation?: boolean;
};

export const DIALOG_SHARED_ENTRY_PERMISSIONS = Symbol('DIALOG_SHARED_ENTRY_PERMISSIONS');

export interface OpenDialogSharedEntryPermissionsArgs {
    id: typeof DIALOG_SHARED_ENTRY_PERMISSIONS;
    props: DialogSharedEntryPermissionsProps;
}

const b = block('dialog-shared-entries-permissions');

export const DialogSharedEntryPermissions: React.FC<DialogSharedEntryPermissionsProps> = ({
    relation,
    entry,
    open,
    onApply,
    onClose,
    delegation = true,
}) => {
    const [delegate, setDelegate] = React.useState(delegation);
    const [isLoading, setIsLoading] = React.useState(false);

    const onSubmit = async () => {
        setIsLoading(true);
        await onApply(delegate);
        setIsLoading(false);
    };

    return (
        <Dialog size="m" open={open} onClose={onClose} className={b()}>
            <Dialog.Header caption={getSharedEntryMockText('title-permissions-dialog')} />
            <Dialog.Body className={b('body')}>
                <div className={b('objects-wrapper')}>
                    <EntitiesList
                        entities={[entry]}
                        title={getSharedEntryMockText('label-current-entry')}
                    />
                    {relation && (
                        <EntityLink
                            entity={relation}
                            title={getSharedEntryMockText('label-relation-entity')}
                        />
                    )}
                </div>
                <Divider />
                <div className={b('permissions-container')}>
                    <Text variant="body-1">
                        {getSharedEntryMockText('permissions-dialog-notice')}
                        <Link
                            // TODO doc link
                            href="/"
                            target="_blank"
                        >
                            {getSharedEntryMockText('permissions-dialog-documentation-link')}
                        </Link>
                    </Text>
                    <PermissionButton
                        icon={<ShieldCheck />}
                        title={getSharedEntryMockText('delegate-title-permissions-dialog')}
                        message={getSharedEntryMockText('delegate-message-permissions-dialog')}
                        disabled={
                            !entry.fullPermissions?.createEntryBinding &&
                            !entry.permissions?.createEntryBinding
                        }
                        checked={delegate}
                        onCheck={() => setDelegate(true)}
                    />
                    <PermissionButton
                        icon={<ShieldKeyhole />}
                        title={getSharedEntryMockText('not-delegate-title-permissions-dialog')}
                        message={getSharedEntryMockText('not-delegate-message-permissions-dialog')}
                        disabled={
                            !entry.fullPermissions?.createLimitedEntryBinding &&
                            !entry.permissions?.createLimitedEntryBinding
                        }
                        checked={!delegate}
                        onCheck={() => setDelegate(false)}
                    />
                </div>
            </Dialog.Body>
            <Dialog.Footer
                textButtonApply={getSharedEntryMockText('apply-permissions-dialog')}
                propsButtonCancel={{
                    view: 'flat',
                }}
                loading={isLoading}
                textButtonCancel={getSharedEntryMockText('cancel-unbind-dialog')}
                onClickButtonApply={onSubmit}
                onClickButtonCancel={onClose}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_SHARED_ENTRY_PERMISSIONS, DialogSharedEntryPermissions);
