import React from 'react';

import {Button, Icon, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useHover} from 'hooks/useHover';
import {ParamsSettingsQA} from 'shared';
import {TagInput} from 'ui/components/TagInput/TagInput';

import {ParamsSettingsProps} from './types';

import iconAdd from '@gravity-ui/icons/svgs/plus.svg';
import iconDelete from '@gravity-ui/icons/svgs/trash-bin.svg';

import './ParamsSettings.scss';

const b = block('params-settings');

type ParamsRowProps = {
    tagLabelClassName?: string;
    paramTitle: string;
    paramValue?: string | string[];
    index: number;
    focused?: boolean;
    validator?: ParamsSettingsProps['validator'];
    onRemove: () => void;
    onEditTitle: (title: string) => boolean;
    onEditValue: ParamsSettingsProps['onEditParamValue'];
    onBlur: () => void;
};

export const ParamsRow = ({
    tagLabelClassName,
    paramTitle,
    paramValue,
    focused,
    index,
    validator,
    onEditTitle,
    onEditValue,
    onRemove,
    onBlur,
}: ParamsRowProps) => {
    const titleRef: React.LegacyRef<HTMLInputElement> = React.useRef(null);
    const {isHovered, eventHandlers} = useHover();
    const [isFocused, setFocused] = React.useState<boolean>(Boolean(focused));
    const [title, setTitle] = React.useState(paramTitle);
    const [value, setValue] = React.useState<string[]>([]);
    const [titleError, setTitleError] = React.useState<Error | null>(null);

    const isActiveRow = React.useMemo(
        () => Boolean(isFocused || isHovered),
        [isFocused, isHovered],
    );
    const isHideAddParamBtn = React.useMemo(() => !title || !isActiveRow, [title, isActiveRow]);
    const inputViewType = React.useMemo(
        () => (isActiveRow || titleError ? 'normal' : 'clear'),
        [isActiveRow, titleError],
    );

    const handleValidateTitle = React.useCallback(
        (checkTitle: string) => {
            if (validator?.title) {
                const error = validator.title(checkTitle);
                setTitleError(error);
            }
        },
        [validator],
    );

    const handleOnFocus = React.useCallback(() => setFocused(true), []);

    const handleOnBlur = React.useCallback(() => {
        setFocused(false);
        onBlur();
        if (onEditTitle(title)) {
            setTitle(title.trim());
        } else {
            setTitle(paramTitle);
            handleValidateTitle(paramTitle);
        }
    }, [title, paramTitle, setTitle, onBlur, onEditTitle, handleValidateTitle]);

    const handleAddValue = React.useCallback(() => {
        setValue([...value, '']);
    }, [value]);

    const handleUpdateValue = React.useCallback(
        (oldValue: string, newValue: string) => {
            let valueArray = [...value];

            let valueIndex = -1;
            let alreadyExist = false;
            for (let i = 0; i < valueArray.length; i += 1) {
                if (valueArray[i] === oldValue) {
                    valueIndex = i;
                }
                if (valueArray[i] === newValue) {
                    alreadyExist = true;
                }
            }

            if (valueIndex > -1 && !alreadyExist) {
                valueArray[valueIndex] = newValue;
            }
            if (alreadyExist && oldValue === '') {
                valueArray = valueArray.filter((item) => item !== '');
            }

            onEditValue(title, valueArray);
        },
        [title, value, onEditValue],
    );

    const handleRemoveValue = React.useCallback(
        (removedValue: string) => {
            onEditValue(
                title,
                value.filter((item) => item !== removedValue),
            );
        },
        [title, value, onEditValue],
    );

    const handleKeyUp: React.KeyboardEventHandler<HTMLInputElement> = React.useCallback(
        (event) => {
            if (event.key !== 'Enter') {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            titleRef.current?.blur();

            handleOnBlur();
        },
        [handleOnBlur],
    );

    const handleUpdateTitle = React.useCallback(
        (newTitle: string) => {
            handleValidateTitle(newTitle);
            setTitle(newTitle);
        },
        [handleValidateTitle],
    );

    React.useEffect(() => {
        setFocused(Boolean(focused));
        if (focused) {
            titleRef.current?.focus();
        }
    }, [focused]);

    React.useEffect(() => {
        setTitle(paramTitle);
        handleValidateTitle(paramTitle);
    }, [paramTitle, handleValidateTitle]);

    React.useEffect(() => {
        if (paramValue === undefined || paramValue === '') {
            setValue([]);
        } else if (Array.isArray(paramValue)) {
            setValue(paramValue.filter((val) => val.trim() !== ''));
        } else {
            setValue([paramValue]);
        }
    }, [paramValue]);

    return (
        <div
            className={b('row', {hover: isFocused})}
            {...eventHandlers}
            data-qa={ParamsSettingsQA.ParamRow}
        >
            <div className={b('left')}>
                <TextInput
                    qa={titleError === null ? ParamsSettingsQA.ParamTitle : undefined}
                    controlRef={titleRef}
                    view={inputViewType}
                    value={title}
                    error={titleError?.message}
                    autoComplete="off"
                    onFocus={handleOnFocus}
                    onBlur={handleOnBlur}
                    className={b('input', inputViewType)}
                    onUpdate={handleUpdateTitle}
                    onKeyUp={handleKeyUp}
                />
            </div>
            <div className={b('center')}>
                {value.map((tagValue, tagIndex) => (
                    <TagInput
                        qa={ParamsSettingsQA.ParamValue}
                        key={`params-row-tag-${index}-${tagIndex}`}
                        className={b('tag-item', {error: Boolean(titleError)})}
                        labelClassName={tagLabelClassName}
                        size="m"
                        value={tagValue}
                        onUpdate={(newTagValue) => handleUpdateValue(tagValue, newTagValue)}
                        onRemove={handleRemoveValue}
                        defaultEditMode={(tagValue || '').trim() === ''}
                        applyOnBlur={true}
                    />
                ))}
                <Button
                    qa={ParamsSettingsQA.ParamAddValue}
                    onClick={handleAddValue}
                    className={b('button-add', {hidden: isHideAddParamBtn})}
                >
                    <Icon data={iconAdd} size={16} className={b('icon-add')} />
                </Button>
            </div>
            <div className={b('right')}>
                <Button
                    qa={ParamsSettingsQA.Remove}
                    view="flat"
                    onClick={onRemove}
                    className={b('button-remove', {hidden: !isActiveRow})}
                >
                    <Icon data={iconDelete} size={16} className={b('icon-delete')} />
                </Button>
            </div>
        </div>
    );
};
