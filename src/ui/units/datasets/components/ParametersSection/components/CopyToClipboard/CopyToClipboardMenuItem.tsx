import React from 'react';

import {CopyToClipboard} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import type {DatasetField} from 'shared';

const i18n = I18n.keyset('dataset.dataset-editor.modify');

type CopyToClipboardMenuItemProps = {
    field: DatasetField;
};

const CopyToClipboardMenuItem: React.FC<CopyToClipboardMenuItemProps> = (
    props: CopyToClipboardMenuItemProps,
) => {
    const {field} = props;
    return (
        <CopyToClipboard text={field.guid} timeout={0}>
            {() => <span>{i18n('button_copy-id')}</span>}
        </CopyToClipboard>
    );
};

export function renderClipboardButton(field: DatasetField) {
    return <CopyToClipboardMenuItem field={field} />;
}
