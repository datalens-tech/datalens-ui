import React from 'react';

import type {TextAreaProps, TextInputProps} from '@gravity-ui/uikit';
import {TextArea, TextInput} from '@gravity-ui/uikit';
import debounce from 'lodash/debounce';

type WithMultiline = {multiline: true} & TextAreaProps;
type WithoutMultiline = {multiline?: undefined} & TextInputProps;
type DebouncedInputProps = {
    delay?: number;
} & (WithMultiline | WithoutMultiline);

interface DebouncedInputState {
    value: string;
    userInput: boolean;
}

export class DebouncedInput extends React.Component<DebouncedInputProps> {
    static defaultProps = {
        delay: 500,
    };

    static getDerivedStateFromProps(
        nextProps: DebouncedInputProps,
        prevState: DebouncedInputState,
    ) {
        if (prevState.userInput) {
            return prevState;
        } else {
            return {
                value: nextProps.value,
            };
        }
    }
    state: DebouncedInputState = {
        value: '',
        userInput: false,
    };

    private onDelayedChange = debounce((value: string) => {
        if (this.props.onUpdate) {
            this.props.onUpdate(value);
            this.setState({userInput: false});
        }
    }, this.props.delay);

    render() {
        const {delay: _delay, ...restProps} = this.props;

        if (restProps.multiline) {
            const {multiline: _m, ...textAreaProps} = restProps;
            return (
                <TextArea {...textAreaProps} value={this.state.value} onUpdate={this.onUpdate} />
            );
        }

        return <TextInput {...restProps} value={this.state.value} onUpdate={this.onUpdate} />;
    }

    private onUpdate = (value: string) => {
        this.setState({value, userInput: true});
        this.onDelayedChange(value);
    };
}
