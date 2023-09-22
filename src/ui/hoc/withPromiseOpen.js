import React from 'react';

function getInitState() {
    return {
        resolve: null,
        visible: false,
        props: {},
    };
}

export const withPromiseOpen = (Component) =>
    class WithPromiseOpen extends React.Component {
        state = getInitState();

        // public via ref
        open(props = {}) {
            return new Promise((resolve) => {
                this.setState({
                    resolve,
                    props,
                    visible: true,
                });
            });
        }

        _onClose = (data) => {
            const {resolve} = this.state;
            this.setState(getInitState());
            resolve(data);
        };

        render() {
            const {visible, props} = this.state;
            return visible ? (
                <Component {...props} visible={visible} onClose={this._onClose} />
            ) : null;
        }
    };
