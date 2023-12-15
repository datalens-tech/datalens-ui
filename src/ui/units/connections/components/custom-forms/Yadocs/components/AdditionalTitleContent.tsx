import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {Button, Checkbox, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {i18n8857} from '../constants';

import iconSync from '../../../../../../assets/icons/sync.svg';

const b = block('conn-form-yadocs');
const ICON_SIZE = 18;

export const AdditionalTitleContent = () => {
    return (
        <div className={b('title-add')}>
            <div className={b('title-add-content')}>
                <Button>{i18n8857.button_auth}</Button>
            </div>
            <div className={b('title-add-content')}>
                <Checkbox>{i18n8857['label_auto-update']}</Checkbox>
                <HelpPopover
                    className={b('help-btn', {'with-margin-right': true})}
                    content={i18n8857['label_auto-update-help']}
                />
                <Button>
                    <Icon data={iconSync} size={ICON_SIZE} />
                    {i18n8857.button_update}
                </Button>
            </div>
        </div>
    );
};
