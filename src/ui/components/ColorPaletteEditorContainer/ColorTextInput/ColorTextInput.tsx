import React from 'react';

import {Button, Icon, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {PaletteItem} from 'units/wizard/components/Palette/components/PaletteItem/PaletteItem';

import {PaletteEditorQA} from '../../../../shared';

import trashIcon from '@gravity-ui/icons/svgs/trash-bin.svg';

import './ColorTextInput.scss';

const b = block('color-text-input');

type ColorTextInputProps = {
    value: string;
    error?: string | boolean;
    showRemove?: boolean;
    maxWidth?: boolean;
    onUpdate: (value: string) => void;
    onRemove?: () => void;
};

const ColorTextInput = (props: ColorTextInputProps) => {
    const {error, value, onUpdate, onRemove, showRemove = true, maxWidth = false} = props;

    const handleOnUpdate = React.useCallback((nextValue) => onUpdate(`#${nextValue}`), [onUpdate]);

    return (
        <div className={b({'max-width': maxWidth})}>
            <PaletteItem className={b('color-preview')} color={value} isSelectable={false} />
            <TextInput
                className={b('color-input')}
                value={value.slice(1)}
                error={error}
                controlProps={{size: 1}}
                onUpdate={handleOnUpdate}
                qa={PaletteEditorQA.ColorTextInput}
            />
            {showRemove ? (
                <Button
                    className={b('color-remove')}
                    view="flat"
                    onClick={onRemove}
                    qa={PaletteEditorQA.RemoveColorButton}
                >
                    <Icon className={b('icon')} data={trashIcon} size={14} />
                </Button>
            ) : null}
        </div>
    );
};

export default ColorTextInput;
