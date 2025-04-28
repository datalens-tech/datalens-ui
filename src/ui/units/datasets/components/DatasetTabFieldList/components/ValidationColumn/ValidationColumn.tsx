import React from 'react';

import {CircleCheck, CircleXmark} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';

import './ValidationColumn.scss';

export interface ValidationColumnProps {
    templateEnabled?: boolean;
}

const b = block('ds-param-tab-validation-column');

export function ValidationColumn(props: ValidationColumnProps) {
    const {templateEnabled} = props;

    return (
        <div className={b({'template-disabled': !templateEnabled})}>
            <Icon className={b('icon')} data={templateEnabled ? CircleCheck : CircleXmark} />
            {templateEnabled
                ? i18n('dataset.dataset-editor.modify', 'label_templating-enabled')
                : i18n('dataset.dataset-editor.modify', 'label_templating-disabled')}
        </div>
    );
}
