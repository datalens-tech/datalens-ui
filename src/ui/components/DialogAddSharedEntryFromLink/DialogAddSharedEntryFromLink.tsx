import React from 'react';

import {Alert, Dialog, Link, Text, TextInput, spacing} from '@gravity-ui/uikit';
import {useDispatch} from 'react-redux';
import {CollectionItemEntities} from 'shared';
import type {GetEntryResponse, StructureItem} from 'shared/schema';
import {getSdk} from 'ui/libs/schematic-sdk';
import {registry} from 'ui/registry';
import {showToast} from 'ui/store/actions/toaster';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';
import * as yup from 'yup';

import DialogManager from '../DialogManager/DialogManager';

type DialogAddSharedEntryFromLinkProps = {
    open: boolean;
    isValidEntry: (entry: Partial<StructureItem>) => boolean;
    onClose: () => void;
    onSuccess: (entry: Partial<StructureItem>) => void;
};

export const DIALOG_ADD_SHARED_ENTRY_FROM_LINK = Symbol('DIALOG_ADD_SHARED_ENTRY_FROM_LINK');

export interface OpenDialogAddSharedEntryFromLinkArgs {
    id: typeof DIALOG_ADD_SHARED_ENTRY_FROM_LINK;
    props: DialogAddSharedEntryFromLinkProps;
}

const getIsSharedEntry = (
    entry: Partial<GetEntryResponse>,
): entry is GetEntryResponse & {collectionId: string} => {
    return typeof entry.collectionId === 'string';
};
const urlSchema = yup
    .string()
    .url(getSharedEntryMockText('add-shared-connection-from-link-dialog-error'))
    .required(getSharedEntryMockText('add-shared-connection-from-link-dialog-required'));

export const DialogAddSharedEntryFromLink: React.FC<DialogAddSharedEntryFromLinkProps> = ({
    open,
    isValidEntry,
    onSuccess,
    onClose,
}) => {
    const dispatch = useDispatch();
    const [textValue, setTextValue] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string>();

    const onSubmit = async () => {
        setIsLoading(true);

        const showError = (title: string) => dispatch(showToast({type: 'danger', title}));

        try {
            const url = new URL(textValue);
            const {extractEntryId} = registry.common.functions.getAll();
            const extractedId = extractEntryId(url.pathname);

            if (!extractedId) {
                showError(getSharedEntryMockText('add-shared-connection-from-link-dialog-error'));
                return;
            }

            const entry = await getSdk().sdk.us.getSharedEntryInfo({
                entryId: extractedId,
                includePermissionsInfo: true,
            });

            const isSharedEntry = getIsSharedEntry(entry);
            const {fullPermissions, ...restEntry} = entry;
            const isCanCreateBinding =
                fullPermissions?.createEntryBinding || fullPermissions?.createLimitedEntryBinding;
            if (!isSharedEntry) {
                showError(
                    getSharedEntryMockText('add-shared-connection-from-link-dialog-entry-error'),
                );
                return;
            }

            if (!isCanCreateBinding) {
                showError(getSharedEntryMockText(`no-access-for-binding-create`));
                return;
            }

            const extendedEntry: Partial<StructureItem> = {
                ...restEntry,
                permissions: fullPermissions,
                entity: CollectionItemEntities.ENTRY,
            };

            if (!isValidEntry(extendedEntry)) {
                showError(
                    getSharedEntryMockText('add-shared-connection-from-link-dialog-entry-error'),
                );
                return;
            }

            onSuccess(extendedEntry);
        } catch (e) {
            if (e.status === 403) {
                showError(getSharedEntryMockText(`no-access-for-binding-create`));
            } else {
                dispatch(
                    showToast({
                        title: e.message,
                        error: e,
                    }),
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const onCloseHandler = () => {
        onClose();
    };

    const validate = async (value: string) => {
        try {
            await urlSchema.validate(value);
            setError(undefined);
        } catch (e) {
            setError(e.message);
        }
    };

    const onUpdate = (value: string) => {
        setTextValue(value);
        validate(value);
    };

    return (
        <Dialog size="m" open={open} onClose={onCloseHandler}>
            <Dialog.Header
                caption={getSharedEntryMockText('add-shared-connection-from-link-dialog-title')}
            />
            <Dialog.Body>
                <Alert
                    theme="info"
                    message={
                        <Text variant="body-1">
                            {getSharedEntryMockText('add-shared-connection-from-link-info-message')}
                            <Link
                                // TODO doc link
                                href="/"
                                target="_blank"
                            >
                                {getSharedEntryMockText('permissions-dialog-documentation-link')}
                            </Link>
                        </Text>
                    }
                />
                <TextInput
                    value={textValue}
                    onUpdate={onUpdate}
                    className={spacing({mt: 4})}
                    label={getSharedEntryMockText(
                        'add-shared-connection-from-link-dialog-input-label',
                    )}
                    error={error}
                    disabled={isLoading}
                />
            </Dialog.Body>
            <Dialog.Footer
                textButtonApply={getSharedEntryMockText(
                    'add-shared-connection-from-link-dialog-apply',
                )}
                propsButtonCancel={{
                    view: 'flat',
                }}
                loading={isLoading}
                propsButtonApply={{
                    disabled: Boolean(error) || !textValue,
                }}
                textButtonCancel={getSharedEntryMockText('cancel-unbind-dialog')}
                onClickButtonApply={onSubmit}
                onClickButtonCancel={onCloseHandler}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_ADD_SHARED_ENTRY_FROM_LINK, DialogAddSharedEntryFromLink);
