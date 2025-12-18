import React from 'react';

import type {AlertProps} from '@gravity-ui/uikit';
import {Alert, Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {SharedScope} from 'shared';
import {CollectionItemEntities, EntryScope} from 'shared';
import type {SharedEntryBindingsItem} from 'shared/schema';
import {WORKBOOKS_PATH} from 'ui/units/collections-navigation/constants';

import navigateHelper from '../../libs/navigateHelper';
import DialogManager from '../DialogManager/DialogManager';
import type {SharedEntry} from '../DialogSharedEntryBindings/types';
import {EntitiesList} from '../EntitiesList/EntitiesList';
import {EntityLink} from '../EntityLink/EntityLink';

import './DialogSharedEntryUnbind.scss';

type DialogSharedEntryUnbindProps = {
    open: boolean;
    onClose: () => void;
    entry: SharedEntry;
    relation?: SharedEntryBindingsItem;
    onApply: () => Promise<void> | void;
};

export const DIALOG_SHARED_ENTRY_UNBIND = Symbol('DIALOG_SHARED_ENTRY_UNBIND');

export interface OpenDialogSharedEntryUnbindArgs {
    id: typeof DIALOG_SHARED_ENTRY_UNBIND;
    props: DialogSharedEntryUnbindProps;
}

const i18n = I18n.keyset('component.dialog-shared-entry-unbind.view');
const b = block('dialog-shared-entries-unbind');

export const AlertEntryTitles = {
    connection: i18n('label-shared-connection'),
    dataset: i18n('label-shared-dataset'),
};

export const AlertEntryPluralizedTitles = {
    connection: i18n('entries-list-title-connection').toLowerCase(),
    dataset: i18n('label-of-shared-dataset').toLowerCase(),
};

export const AlertRelationsText = {
    dataset: i18n('message-relation-alert'),
    workbook: i18n('message-relations-alert'),
};

export const AlertRelationTitles = {
    dataset: i18n('label-relation-dataset'),
    workbook: i18n('label-relation-workbook'),
};

export const EntityTitles = {
    dataset: i18n('label-shared-dataset').toLowerCase(),
    workbook: i18n('label-workbook').toLowerCase(),
    connection: i18n('label-shared-connection').toLowerCase(),
};

type RelationInstance = 'dataset' | 'workbook';

const getMessage = (entry: SharedScope, relation: RelationInstance = 'workbook') => {
    const relationKey = entry === 'dataset' ? 'dataset' : relation;

    return i18n('message-alert', {
        entry: AlertEntryPluralizedTitles[entry],
        relation: AlertRelationsText[relationKey],
    });
};

export const DialogSharedEntryUnbind: React.FC<DialogSharedEntryUnbindProps> = ({
    relation,
    entry,
    open,
    onApply,
    onClose,
}) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const entryInstance: SharedScope =
        entry.scope === EntryScope.Dataset ? EntryScope.Dataset : EntryScope.Connection;

    const onSubmit = async () => {
        setIsLoading(true);
        await onApply();
        setIsLoading(false);
    };

    const renderAlert = () => {
        let title: string | undefined;
        let message: string | undefined;
        let actions: AlertProps['actions'] | undefined;

        if (relation) {
            const relationInstance: RelationInstance =
                relation.entity === CollectionItemEntities.WORKBOOK ? relation.entity : 'dataset';

            title = i18n('title-alert', {
                entry: AlertEntryTitles[entryInstance],
                relation: AlertRelationTitles[relationInstance],
            });
            message = getMessage(entryInstance, relationInstance);
            const link =
                relation.entity === CollectionItemEntities.WORKBOOK
                    ? `${WORKBOOKS_PATH}/${relation.workbookId}`
                    : navigateHelper.redirectUrlSwitcher(relation);
            actions = (
                <Alert.Actions>
                    <Alert.Action href={link} target="_blank">
                        {i18n('open-relation', {
                            relation: EntityTitles[relationInstance],
                        })}
                    </Alert.Action>
                </Alert.Actions>
            );
        } else {
            message = getMessage(entryInstance);
        }

        return <Alert theme="warning" title={title} message={message} actions={actions} />;
    };

    return (
        <Dialog size="m" open={open} onClose={onClose} className={b()}>
            <Dialog.Header
                caption={i18n('dialog-title', {
                    entry: AlertEntryTitles[entryInstance].toLowerCase(),
                })}
            />
            <Dialog.Body className={b('body')}>
                <div className={b('objects-wrapper')}>
                    <EntitiesList entities={[entry]} title={i18n('label-current-entry')} />
                    {relation && (
                        <EntityLink entity={relation} title={i18n('label-relation-entity')} />
                    )}
                </div>
                {renderAlert()}
            </Dialog.Body>
            <Dialog.Footer
                textButtonApply={i18n('apply-btn')}
                propsButtonApply={{
                    view: 'outlined-danger',
                }}
                propsButtonCancel={{
                    view: 'flat',
                }}
                loading={isLoading}
                textButtonCancel={i18n('cancel-btn')}
                onClickButtonApply={onSubmit}
                onClickButtonCancel={onClose}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_SHARED_ENTRY_UNBIND, DialogSharedEntryUnbind);
