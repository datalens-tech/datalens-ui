import React from 'react';

import {ShieldCheck, ShieldKeyhole} from '@gravity-ui/icons';
import {Dialog, Divider, Link, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {SharedEntryBindingsItem} from 'shared/schema';

import DialogManager from '../DialogManager/DialogManager';
import type {SharedEntry} from '../DialogSharedEntryBindings/types';
import {EntitiesList} from '../EntitiesList/EntitiesList';
import {EntityLink} from '../EntityLink/EntityLink';
import {SharedEntryIcon} from '../SharedEntryIcon/SharedEntryIcon';

import {PermissionButton} from './components/PermissionButton/PermissionButton';

import './DialogSharedEntryPermissions.scss';

type DialogSharedEntryPermissionsProps = {
    open: boolean;
    onClose: (delegate: boolean) => void;
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

const i18n = I18n.keyset('component.dialog-shared-entry-permissions.view');
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

    const onCloseHandler = () => {
        onClose(delegate);
    };

    return (
        <Dialog size="m" open={open} onClose={onCloseHandler} className={b()}>
            <Dialog.Header caption={i18n('title-dialog')} />
            <Dialog.Body className={b('body')}>
                <div className={b('objects-wrapper')}>
                    <EntitiesList
                        entities={[entry]}
                        rightSectionSlot={() => <SharedEntryIcon isDelegated={entry.isDelegated} />}
                        title={i18n('label-current-entry')}
                    />
                    {relation && (
                        <EntityLink entity={relation} title={i18n('label-relation-entity')} />
                    )}
                </div>
                <Divider />
                <div className={b('permissions-container')}>
                    <Text variant="body-1">
                        {i18n('notice-text')}
                        {' '}
                        <Link
                            // TODO doc link
                            href="/"
                            target="_blank"
                        >
                            {i18n('documentation-link-text')}
                        </Link>
                    </Text>
                    <PermissionButton
                        icon={<ShieldCheck />}
                        title={i18n('delegate-title')}
                        message={i18n('delegate-message')}
                        disabled={
                            !entry.fullPermissions?.createEntryBinding &&
                            !entry.permissions?.createEntryBinding
                        }
                        checked={delegate}
                        onCheck={() => setDelegate(true)}
                    />
                    <PermissionButton
                        icon={<ShieldKeyhole />}
                        title={i18n('not-delegate-title')}
                        message={i18n('not-delegate-message')}
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
                textButtonApply={i18n('apply-text')}
                propsButtonCancel={{
                    view: 'flat',
                }}
                loading={isLoading}
                textButtonCancel={i18n('cancel-text')}
                onClickButtonApply={onSubmit}
                onClickButtonCancel={onCloseHandler}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_SHARED_ENTRY_PERMISSIONS, DialogSharedEntryPermissions);
