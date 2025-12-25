import React from 'react';

import {Button, CopyToClipboard, TextInput} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {CLIPBOARD_TIMEOUT, DL} from 'ui/constants/common';

import type {EntryData} from '../types';

import './SharedLink.scss';

const b = block('dl-dialog-public-shared-link');
const i18n = I18n.keyset('component.dialog-switch-public.view');

type Props = {
    className?: string;
    entry: EntryData;
    disabled: boolean;
};

function SharedLink({className, entry, disabled}: Props) {
    const text = disabled
        ? i18n('label_placeholder-publishing-not-enabled')
        : `${DL.ENDPOINTS.public || 'https://stub'}/${entry.entryId}`;

    const onCopyLink = () => {
        toaster.add({
            name: 'successSharedLinkCopied',
            theme: 'success',
            title: i18n('toast_link-copied'),
        });
    };

    return (
        <div className={b(null, className)}>
            <div className={b('input-place')}>
                <TextInput
                    className={b('input-link', {active: !disabled})}
                    disabled={true}
                    value={text}
                />
            </div>
            {!disabled && (
                <div className={b('clipboard-button')}>
                    <CopyToClipboard text={text} timeout={CLIPBOARD_TIMEOUT} onCopy={onCopyLink}>
                        {() => <Button view="outlined">{i18n('button_copy')}</Button>}
                    </CopyToClipboard>
                </div>
            )}
        </div>
    );
}

export default SharedLink;
