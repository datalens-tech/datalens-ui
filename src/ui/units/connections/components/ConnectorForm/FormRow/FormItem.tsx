import React from 'react';

import type {ConnectorFormItem} from 'shared/schema/types';

import logger from '../../../../../libs/logger';
import {
    Checkbox,
    Datepicker,
    Description,
    FileInput,
    Input,
    Label,
    PlainText,
    RadioButton,
    RadioGroup,
    Select,
} from '../components';

export const FormItem = ({item, disabled}: {item: ConnectorFormItem; disabled?: boolean}) => {
    switch (item.id) {
        case 'checkbox': {
            const {id: _id, controlProps, ...itemProps} = item;
            const extendedControlProps = {...controlProps, disabled};
            return <Checkbox {...itemProps} controlProps={extendedControlProps} />;
        }
        case 'datepicker': {
            const {id: _id, controlProps, ...itemProps} = item;
            const extendedControlProps = {...controlProps, disabled};
            return <Datepicker {...itemProps} controlProps={extendedControlProps} />;
        }
        case 'description': {
            const {id: _id, ...itemProps} = item;
            return <Description {...itemProps} />;
        }
        case 'label': {
            const {id: _id, ...itemProps} = item;
            return <Label {...itemProps} />;
        }
        case 'input': {
            const {id: _id, controlProps, ...itemProps} = item;
            const extendedControlProps = {...controlProps, disabled};
            return <Input {...itemProps} controlProps={extendedControlProps} />;
        }
        case 'file-input': {
            const {id: _id, controlProps, ...itemProps} = item;
            const extendedControlProps = {...controlProps, disabled};
            return <FileInput {...itemProps} controlProps={extendedControlProps} />;
        }
        case 'select': {
            const {id: _id, controlProps, ...itemProps} = item;
            const extendedControlProps = {...controlProps, disabled};
            return <Select {...itemProps} controlProps={extendedControlProps} />;
        }
        case 'radio_button': {
            const {id: _id, controlProps, ...itemProps} = item;
            const extendedControlProps = {...controlProps, disabled};
            return <RadioButton {...itemProps} controlProps={extendedControlProps} />;
        }
        case 'radio_group': {
            const {id: _id, controlProps, ...itemProps} = item;
            const extendedControlProps = {...controlProps, disabled};
            return <RadioGroup {...itemProps} controlProps={extendedControlProps} />;
        }
        case 'plain_text': {
            const {id: _id, ...itemProps} = item;
            return <PlainText {...itemProps} />;
        }
        case 'hidden': {
            return null;
        }
        default: {
            logger.logError(`FormItem (conn): unknown item id "${(item as ConnectorFormItem).id}"`);
            return null;
        }
    }
};
