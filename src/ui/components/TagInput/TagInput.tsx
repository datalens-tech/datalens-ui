import React from 'react';

import {Label, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './TagInput.scss';

const b = block('tag-input');

const INPUT_MIN_WIDTH = 100;

export interface TagInputProps {
    className?: string;
    labelClassName?: string;
    value: string;
    size?: 's' | 'm';
    defaultEditMode?: boolean;
    applyOnBlur?: boolean;
    qa?: string;
    onUpdate?: (value: string) => void;
    onRemove?: (value: string) => void;
}

export const TagInput: React.FC<TagInputProps> = ({
    className,
    labelClassName,
    value,
    size,
    defaultEditMode,
    applyOnBlur,
    qa,
    onUpdate,
    onRemove,
}: TagInputProps) => {
    const [isEdit, setIsEdit] = React.useState(() => {
        // default edit mode by prop
        if (defaultEditMode !== undefined) {
            return Boolean(defaultEditMode);
        }
        // or by empty value
        return value === '';
    });
    const [tagValue, setTagValue] = React.useState(value);
    const [labelRect, setLabelRect] = React.useState<DOMRect>();
    const labelRef: React.Ref<HTMLDivElement> = React.useRef(null);
    const inputRef: React.Ref<HTMLInputElement> = React.useRef(null);

    const handleApply = React.useCallback(() => {
        const trimmedValue = tagValue.trim();
        if (trimmedValue === '') {
            onRemove?.(value);
        } else {
            onUpdate?.(trimmedValue);
        }

        setIsEdit(false);
    }, [value, tagValue, onUpdate, onRemove]);

    const handleReset = React.useCallback(() => {
        setTagValue(value);
        setIsEdit(false);
    }, [value]);

    const handleRemove = React.useCallback(
        (event?: React.MouseEvent<HTMLElement, MouseEvent>) => {
            event?.stopPropagation();

            setIsEdit(false);
            onRemove?.(value);
        },
        [value, onRemove],
    );

    const handleUpdate = React.useCallback((updatedValue: string) => {
        setTagValue(updatedValue);
    }, []);

    const handleKeyUp: React.KeyboardEventHandler<HTMLInputElement> = React.useCallback(
        (event) => {
            if (event.key !== 'Enter' && event.key !== 'Escape') {
                return;
            }

            event.preventDefault();

            if (event.key === 'Escape') {
                handleReset();
                return;
            }

            handleApply();
        },
        [handleApply, handleReset],
    );

    const handleEnterEditMode = () => {
        if (!isEdit) {
            setIsEdit(true);
        }
    };

    const handleOnBlur = React.useCallback(() => {
        if (applyOnBlur) {
            handleApply();
        } else {
            handleReset();
        }
    }, [applyOnBlur, handleApply, handleReset]);

    // override input value from external change
    React.useEffect(() => {
        setTagValue(value);
    }, [value]);

    // label width for same input width when exit edit mode or external change value
    React.useEffect(() => {
        if (isEdit) {
            inputRef?.current?.focus();
            inputRef?.current?.select();
        } else {
            const rect = labelRef?.current?.getBoundingClientRect();
            if (rect) {
                setLabelRect(rect);
            }
        }
    }, [isEdit, value]);

    const renderInput = React.useCallback(() => {
        const width = labelRect?.width
            ? Math.max(labelRect?.width, INPUT_MIN_WIDTH)
            : INPUT_MIN_WIDTH;

        return (
            <TextInput
                className={b('input')}
                controlRef={inputRef}
                controlProps={{
                    className: b('input-control'),
                    style: {width},
                }}
                size={size}
                value={tagValue}
                autoComplete="off"
                onUpdate={handleUpdate}
                onKeyUp={handleKeyUp}
                onBlur={handleOnBlur}
                hasClear={true}
            />
        );
    }, [labelRect, tagValue, size, handleKeyUp, handleUpdate, handleOnBlur]);

    const renderLabel = React.useCallback(() => {
        return (
            <Label
                ref={labelRef}
                className={b('label', labelClassName)}
                size={size}
                theme="unknown"
                type="close"
                onCloseClick={handleRemove}
                interactive={true}
            >
                {value}
            </Label>
        );
    }, [size, value, labelClassName, handleRemove]);

    const elementComponent: React.ReactNode = isEdit ? renderInput() : renderLabel();

    return (
        <div
            title={value}
            onClick={handleEnterEditMode}
            className={b(null, className)}
            data-qa={qa}
        >
            {elementComponent}
        </div>
    );
};
