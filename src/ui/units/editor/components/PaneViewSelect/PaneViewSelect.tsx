import React from 'react';

import type {SelectOption} from '@gravity-ui/uikit';
import {Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {PANE_VIEWS} from '../../constants/common';

import './PaneViewSelect.scss';

const b = block('editor-pane-view-select');

const PANE_VIEWS_NAMES = {
    [PANE_VIEWS.EDITOR]: 'Code editor',
    [PANE_VIEWS.PREVIEW]: 'Preview',
    [PANE_VIEWS.CONSOLE]: 'Console',
};

const options = Object.values(PANE_VIEWS).map((view) => ({
    value: view,
    content: PANE_VIEWS_NAMES[view] || view,
}));

type Props = {
    value: string;
    onChange: (val: string) => void;
};

export const PaneViewSelect = ({value, onChange}: Props) => {
    const handleUpdate = ([newValue]: string[]) => {
        if (value !== newValue) {
            onChange(newValue);
        }
    };

    const renderSelectedOption = (option: SelectOption) => (
        <span className={b('selected-option')}>{option.content}</span>
    );

    return (
        <Select
            options={options}
            value={[value]}
            onUpdate={handleUpdate}
            view="clear"
            renderSelectedOption={renderSelectedOption}
        />
    );
};
