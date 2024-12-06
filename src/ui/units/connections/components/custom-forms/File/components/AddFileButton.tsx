import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {Plus} from '@gravity-ui/icons';
import {Button, Icon, useFileInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {ConnectionsBaseQA} from 'shared';

import {useFileContext} from '../context';
import {getAcceptedExtensions} from '../utils';

const b = block('conn-form-file');
const i18n = I18n.keyset('connections.file.view');
const ICON_SIZE = 14;

export const AddFileButton = () => {
    const {handleFilesUpload} = useFileContext();
    const {controlProps, triggerProps} = useFileInput({onUpdate: handleFilesUpload});
    const accept = getAcceptedExtensions();
    const hintContent = i18n('button_add-file-hint', {
        formats: accept.replace(/\./g, ' ').toUpperCase(),
    });

    return (
        <div className={b('add-file-button-wrap')} data-qa={ConnectionsBaseQA.S3_UPLOAD_BUTTON}>
            <input {...controlProps} accept={accept} />
            <Button {...triggerProps} className={b('add-file-button')} view={'outlined'}>
                <Icon data={Plus} size={ICON_SIZE} />
                <span>{i18n('button_add-file')}</span>
            </Button>
            <HelpPopover content={hintContent} />
        </div>
    );
};
