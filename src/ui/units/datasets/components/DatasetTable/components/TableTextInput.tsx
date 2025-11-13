import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import _debounce from 'lodash/debounce';

import type {ColumnItem} from '../types';

const b = block('dataset-table');

type TableTextInputProps = ColumnItem & {
    text: string;
    error?: boolean;
    onUpdate?: (text: string) => void;
    qa?: string;
};

export const TableTextInput = (props: TableTextInputProps) => {
    const {text, index, error, setActiveRow, onUpdate, qa} = props;
    const [localText, setLocalText] = React.useState(text);
    const ref = React.useRef<HTMLInputElement>(null);

    const handleBlur = React.useCallback(() => {
        if (text !== localText) {
            onUpdate?.(localText);
        }

        setActiveRow(undefined);
    }, [text, localText, setActiveRow, onUpdate]);

    const handleFocus = React.useCallback(() => {
        setActiveRow(index);
    }, [index, setActiveRow]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') {
            return;
        }

        ref.current?.blur();
    };

    const handleUpdate = (nextLocalText: string) => setLocalText(nextLocalText);

    React.useEffect(() => setLocalText(text), [text]);

    return (
        <TextInput
            controlRef={ref}
            className={b('table-input', {error})}
            value={localText}
            error={error}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onUpdate={handleUpdate}
            qa={qa}
        />
    );
};
