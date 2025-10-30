import React, {useCallback, useMemo} from 'react';

import {Card, Label, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './MultiSelectInput.scss';

const b = block('dl-multi-select-input');

export type MultiSelectInputProps = {
    className?: string | undefined;
    onUpdate?: (value: string) => void;
    value?: string[];
    width?: string | number;
    placeholder?: string;
    endContent?: React.ReactNode;
    onClickValue?: RenderValueArg['onClick'];
    onDeleteValue?: RenderValueArg['onDelete'];
    renderValue?: (arg: RenderValueArg, i: number) => React.ReactNode;
};

type RenderValueArg = {
    value: string;
    onClick: (value: string) => void;
    onDelete?: (value: string) => void;
};

export const MultiSelectInput: React.FC<MultiSelectInputProps> = ({
    className,
    onUpdate,
    value = [],
    placeholder,
    endContent,
    onDeleteValue = (_: string) => {},
    onClickValue = (_: string) => {},
    renderValue,
    width,
}) => {
    const [valueList, setValueList] = React.useState(value);

    const onDelete = useCallback(
        (currentValue: string) => {
            onDeleteValue(currentValue);
            setValueList((prevValueList) => prevValueList.filter((v) => v !== currentValue));
        },
        [onDeleteValue],
    );
    const filteredValueList = useMemo(() => valueList, [valueList]);

    const renderValueComponent = (currentValue: string, i: number) => {
        if (renderValue) {
            return renderValue({value: currentValue, onDelete, onClick: onClickValue}, i);
        }
        return (
            <Label
                key={currentValue}
                theme="info"
                size="xs"
                type="close"
                className={b('item')}
                onClick={() => onClickValue(currentValue)}
                onCloseClick={() => onDelete(currentValue)}
            >
                {currentValue}
            </Label>
        );
    };
    return (
        <Card
            className={b(null, className)}
            style={{'--multi-select-width': width} as React.CSSProperties}
        >
            <div className={b('item-list')}>
                {filteredValueList.map(renderValueComponent)}

                <div className={b('input-wrapper')}>
                    <TextInput
                        className={b('text-input')}
                        onUpdate={onUpdate}
                        placeholder={placeholder}
                        view="clear"
                        type="search"
                    />
                </div>
            </div>
            {endContent && <div className={b('end-content-wrapper')}>{endContent}</div>}
        </Card>
    );
};
