import React from 'react';

import {Button, Spin} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import './ButtonSpin.scss';

const STATUSES = {
    INITIAL: 'initial',
    LOADING: 'loading',
};

const b = block('button-spin-react');

// TODO: switch to _progress_yes / ISL-4026

export default class ButtonSpin extends React.PureComponent {
    static propTypes = {
        text: PropTypes.string,
        onClick: PropTypes.func.isRequired, // click callback, which should return Promise/thenable
    };

    state = {status: STATUSES.INITIAL};

    componentDidMount() {
        this._isMounted = true;
    }

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillReceiveProps() {
        this.setState({status: STATUSES.INITIAL});
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    _onClick = () => {
        this.setState({status: STATUSES.LOADING});
        const handler = () => this._isMounted && this.setState({status: STATUSES.INITIAL});
        this.props.onClick().then(handler, handler);
    };

    render() {
        const isLoading = this.state.status === STATUSES.LOADING;
        const {text, onClick, ..._props} = this.props; // eslint-disable-line no-unused-vars

        return (
            <Button {..._props} disabled={isLoading} onClick={this._onClick}>
                <span className={b('text', {hidden: isLoading})}>{text}</span>
                {isLoading && <Spin size="s" className={b('spin')} />}
            </Button>
        );
    }
}
