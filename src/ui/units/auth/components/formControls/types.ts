import type {SelectProps, TextInputProps} from '@gravity-ui/uikit';

type FormOwnProps = {
    rowClassName?: string;
    autoComplete?: boolean;
};

export type UserFormInputProps = Omit<
    TextInputProps,
    'value' | 'onUpdate' | 'autoComplete' | 'validationState'
> &
    FormOwnProps;
export type UserFormSelectProps = Omit<SelectProps, 'value' | 'onUpdate' | 'options' | 'width'> &
    FormOwnProps;
