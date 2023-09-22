import React from 'react';

type State = {
    value: number;
};

type ExampleProps = {
    value: number;
};

export class Example extends React.Component<ExampleProps, State> {
    state: State = {
        value: this.props.value,
    };

    render() {
        return <div>{this.state.value}</div>;
    }
}
