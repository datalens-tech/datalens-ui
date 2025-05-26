import React from 'react';

import {HelpMark, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {DashLoadPrioritySettings} from 'shared';

import {DashLoadPriority} from '../../../../../../../shared';

import {Row} from './Row';
import {Title} from './Title';

const b = block('dialog-settings');

const items = Object.values(DashLoadPriority).map((value) => ({
    content: i18n('dash.settings-dialog.edit', `value_load-priority-${value}`),
    value,
    qa: DashLoadPrioritySettings[value],
}));

type LoadPriorityProps = {
    value: DashLoadPriority;
    onUpdate: (value: DashLoadPriority) => void;
};

export const LoadPriority = ({value, onUpdate}: LoadPriorityProps) => {
    return (
        <Row>
            <Title text={i18n('dash.settings-dialog.edit', 'label_load-priority')}>
                <HelpMark>{i18n('dash.settings-dialog.edit', 'label_load-priority-hint')}</HelpMark>
            </Title>
            <div>
                <div className={b('sub-row')}>
                    <Select
                        value={[value]}
                        width={'max'}
                        options={items}
                        onUpdate={(newValue: string[]) => onUpdate(newValue[0] as DashLoadPriority)}
                    />
                </div>
            </div>
        </Row>
    );
};
