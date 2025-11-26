import React from 'react';

import type {AlertProps} from '@gravity-ui/uikit';
import {Alert, Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {CollectionItemEntities} from 'shared';
import type {GetEntryResponse, SharedEntryBindingsItem} from 'shared/schema';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';
import {WORKBOOKS_PATH} from 'ui/units/collections-navigation/constants';

import navigateHelper from '../../libs/navigateHelper';
import DialogManager from '../DialogManager/DialogManager';
import {EntitiesList} from '../EntitiesList/EntitiesList';
import {EntityLink} from '../EntityLink/EntityLink';

import {
    AlertEntryPluralizedTitles,
    AlertEntryTitles,
    AlertRelationTitles,
    AlertRelationsText,
    EntityTitles,
} from './constants';

import './DialogSharedEntryUnbind.scss';

type DialogSharedEntryUnbindProps = {
    open: boolean;
    onClose: () => void;
    entry: Partial<GetEntryResponse> & {scope: string};
    relation?: SharedEntryBindingsItem;
    onApply: () => Promise<void> | void;
};

export const DIALOG_SHARED_ENTRY_UNBIND = Symbol('DIALOG_SHARED_ENTRY_UNBIND');

export interface OpenDialogSharedEntryUnbindArgs {
    id: typeof DIALOG_SHARED_ENTRY_UNBIND;
    props: DialogSharedEntryUnbindProps;
}

const b = block('dialog-shared-entries-unbind');

type EntyInstance = 'dataset' | 'connection';

type RelationInstance<T extends EntyInstance> = T extends 'connection'
    ? 'dataset' | 'workbook'
    : 'workbook';

const getMessage = <T extends EntyInstance>(
    entryInstance: T,
    relationInstance?: RelationInstance<T>,
) => {
    const relationsText =
        AlertRelationsText[
            entryInstance === 'dataset' ? 'dataset' : relationInstance ?? 'workbook'
        ];
    return getSharedEntryMockText('message-alert-unbind-dialog', {
        entry: AlertEntryPluralizedTitles[entryInstance],
        relation: relationsText,
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
    const entryInstance: EntyInstance = entry.scope === 'dataset' ? 'dataset' : 'connection';

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
            const relationInstance: RelationInstance<typeof entryInstance> =
                relation.entity === CollectionItemEntities.WORKBOOK ? relation.entity : 'dataset';

            title = getSharedEntryMockText('title-alert-unbind-dialog', {
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
                        {getSharedEntryMockText('open-relation-unbind-dialog', {
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
                caption={getSharedEntryMockText('title-unbind-dialog', {
                    entry: AlertEntryTitles[entryInstance].toLowerCase(),
                })}
            />
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
                {renderAlert()}
            </Dialog.Body>
            <Dialog.Footer
                textButtonApply={getSharedEntryMockText('apply-unbind-dialog')}
                propsButtonApply={{
                    view: 'outlined-danger',
                }}
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

DialogManager.registerDialog(DIALOG_SHARED_ENTRY_UNBIND, DialogSharedEntryUnbind);
