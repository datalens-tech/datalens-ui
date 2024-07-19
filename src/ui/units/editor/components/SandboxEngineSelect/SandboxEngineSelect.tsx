import React from 'react';

import type {SelectOption} from '@gravity-ui/uikit';
import {Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch} from 'react-redux';

import {UPDATE_EDITOR_ENTRY} from '../../store/reducers/editor/editor';

import './SandboxEngineSelect.scss';

const b = block('sandbox-engine-select');

function getOptions(): SelectOption[] {
    return [
        {
            value: '0',
            content: 'Default',
        },
        {
            value: '1',
            content: 'V1',
        },
        {
            value: '2',
            content: 'V2',
        },
    ];
}

type Props = {
    value: string;
    entry: Record<string, unknown> & {
        meta?: {sandbox_version: string; is_sandbox_version_changed: boolean};
    };
};

const SandboxEngineSelect = ({entry}: Props) => {
    const dispatch = useDispatch();
    const currentValue = entry.meta?.sandbox_version || '0';
    const handleUpdate = ([newValue]: string[]) => {
        if (currentValue !== newValue) {
            dispatch({
                type: UPDATE_EDITOR_ENTRY,
                payload: {
                    entry: {
                        ...entry,
                        meta: {
                            ...entry.meta,
                            sandbox_version: newValue,
                            is_sandbox_version_changed: true,
                        },
                    },
                },
            });
        }
    };

    const renderOption = (option: SelectOption) => (
        <div className={b('item')}>{option.content}</div>
    );

    return (
        <div className={b()}>
            <p className={b('label')}>Sandbox</p>
            <Select
                className={b('select')}
                options={getOptions()}
                value={[currentValue]}
                onUpdate={handleUpdate}
                renderOption={renderOption}
                renderSelectedOption={renderOption}
            />
        </div>
    );
};

export default SandboxEngineSelect;
