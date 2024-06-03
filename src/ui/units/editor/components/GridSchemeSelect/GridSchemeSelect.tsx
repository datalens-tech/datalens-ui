import React from 'react';

import type {SelectOption} from '@gravity-ui/uikit';
import {Icon, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';

import {getGridSchemes} from '../../configs/grid/grid-schemes';

import './GridSchemeSelect.scss';

const b = block('grid-scheme-select');
const gridSchemes = getGridSchemes();

function getOptions(): SelectOption[] {
    return gridSchemes.ids.map((id) => {
        const text = i18n('editor.grid-scheme-select.view', 'value_count-panes', {
            count: gridSchemes.schemes[id].panes.length,
        });

        return {
            value: id,
            content: (
                <React.Fragment>
                    <Icon data={gridSchemes.schemes[id].icon} size="24" className={b('icon')} />
                    <div className={b('text')}>{text}</div>
                </React.Fragment>
            ),
        };
    });
}

type Props = {
    value: string;
    onChange: (value: string) => void;
    className?: string;
};

export const GridSchemeSelect = ({value, onChange, className}: Props) => {
    const handleUpdate = ([newValue]: string[]) => {
        if (value !== newValue) {
            onChange(newValue);
        }
    };

    const renderOption = (option: SelectOption) => (
        <div className={b('item')}>{option.content}</div>
    );

    return (
        <div className={b(null, className)}>
            <Select
                className={b('select')}
                options={getOptions()}
                value={[value]}
                onUpdate={handleUpdate}
                renderOption={renderOption}
                renderSelectedOption={renderOption}
            />
        </div>
    );
};
