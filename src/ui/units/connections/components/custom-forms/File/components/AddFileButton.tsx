import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {ButtonAttach} from 'components/ButtonAttach/ButtonAttach';
import {I18n} from 'i18n';
import {Feature} from 'shared';

import Utils from '../../../../../../utils';
import {useFileContext} from '../context';

import iconPlus from '../../../../../../assets/icons/plus.svg';

const b = block('conn-form-file');
const i18n = I18n.keyset('connections.file.view');
const ICON_SIZE = 14;
const ACCEPTED_EXTENTIONS = '.csv,.txt';

export const getAcceptedExtensions = () => {
    let acceptedExtensions = ACCEPTED_EXTENTIONS;

    if (Utils.isEnabledFeature(Feature.XlsxFilesEnabled)) {
        acceptedExtensions += ',.xlsx';
    }

    return acceptedExtensions;
};

export const AddFileButton = () => {
    const {handleFilesUpload} = useFileContext();
    const acceptedExtensions = getAcceptedExtensions();
    const content = i18n('button_add-file-hint', {
        formats: acceptedExtensions.replace(/\./g, ' ').toUpperCase(),
    });

    return (
        <div className={b('add-file-button-wrap')}>
            <ButtonAttach
                className={b('add-file-button')}
                view={'outlined'}
                accept={acceptedExtensions}
                onUpdate={handleFilesUpload}
            >
                <div className={b('add-file-button-content')}>
                    <Icon className={b('add-file-button-icon')} data={iconPlus} size={ICON_SIZE} />
                    <span>{i18n('button_add-file')}</span>
                </div>
            </ButtonAttach>
            <HelpPopover content={content} />
        </div>
    );
};
