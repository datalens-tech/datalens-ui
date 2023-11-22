import React from 'react';

import {TextInput, useOutsideClick} from '@gravity-ui/uikit';

type WrappedTextInputProps = {
    text: string;
    isEdit: boolean;
    setIsEdit: (v: boolean) => void;
    onInputApply: EditableTextProps['onInputApply'];
};
const WrappedTextInput: React.FC<WrappedTextInputProps> = (props: WrappedTextInputProps) => {
    const ref = React.useRef(null);
    const [editableText, setEditableText] = React.useState<string>(props.text);

    const handleOnOutsideClick = () => {
        if (props.isEdit) {
            props.setIsEdit(false);
            props.onInputApply(editableText.trim() || props.text);
        }
    };

    const handleOnEnterClick = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            props.setIsEdit(false);
            props.onInputApply(editableText.trim() || props.text);
        }
    };

    const handleOnInputUpdate = (v: string) => {
        setEditableText(v);
    };

    const handleOnInputClick = (event: React.MouseEvent<HTMLInputElement>) => {
        event.stopPropagation();
    };

    useOutsideClick({ref, handler: handleOnOutsideClick});

    return (
        <TextInput
            controlProps={{onClick: handleOnInputClick}}
            onUpdate={handleOnInputUpdate}
            onKeyPress={handleOnEnterClick}
            controlRef={ref}
            size="s"
            value={editableText}
        />
    );
};

type EditableTextProps = {
    text: string;
    textClassName: string;
    onInputApply: (v: string) => void;
};
export const EditableText: React.FC<EditableTextProps> = (props: EditableTextProps) => {
    const [isEdit, setIsEdit] = React.useState(false);

    const handleOnTextClick = (event: React.MouseEvent<HTMLSpanElement>) => {
        event.stopPropagation();
        setIsEdit(true);
    };

    return isEdit ? (
        <WrappedTextInput
            text={props.text}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
            onInputApply={props.onInputApply}
        />
    ) : (
        <div onClick={handleOnTextClick} className={props.textClassName}>
            {props.text}
        </div>
    );
};
