import React from 'react';

import {ClipboardButton, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import PropTypes from 'prop-types';

import ButtonSpin from '../ButtonSpin/ButtonSpin';
import PopupMessage from '../PopupMessage/PopupMessage';

import './ButtonSpinInput.scss';

const STATUSES = {
    INITIAL: 'initial',
    DONE: 'done',
    FAIL: 'fail',
};

const b = block('button-spin-input');

export default class ButtonSpinInput extends React.PureComponent {
    static propTypes = {
        text: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
        popup: PropTypes.shape({
            to: PropTypes.string,
            toSide: PropTypes.string,
        }),
        button: PropTypes.shape({
            theme: PropTypes.string,
            size: PropTypes.string,
        }),
    };

    static defaultProps = {
        popup: {},
        button: {theme: 'pseudo', size: 's'},
    };

    state = {status: STATUSES.INITIAL};
    _buttonComponent = React.createRef();

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillReceiveProps() {
        this.setState({status: STATUSES.INITIAL});
    }

    _onClick = () => {
        return this.props
            .onClick()
            .then((text) => {
                this._text = text;
                this.setState({status: STATUSES.DONE});
            })
            .catch(() => this.setState({status: STATUSES.FAIL}));
    };

    _buttonSpin = () => (
        <div ref={this._buttonComponent} className={b({'button-spin': true})}>
            <ButtonSpin
                theme={this.props.button.theme}
                size={this.props.button.size}
                text={this.props.text}
                onClick={this._onClick}
            />
            <PopupMessage
                autoclosable
                key="message"
                theme="error"
                size="s"
                anchor={this._buttonComponent}
                to={this.props.popup.to}
                toSide={this.props.popup.toSide}
                visible={this.state.status === STATUSES.FAIL}
                onOutsideClick={() => this.setState({status: STATUSES.INITIAL})}
            >
                {' '}
                {/* TODO: does not work inside the modal window / ISL-4096*/}
                {i18n('chartkit.button-spin-input', 'error')}
            </PopupMessage>
        </div>
    );

    _textInput = () => (
        <div className={b({'text-input': true})}>
            <TextInput className={b('item')} value={this._text} />
            <ClipboardButton className={b('item')} size={20} text={this._text} />
        </div>
    );

    render() {
        const content =
            this.state.status === STATUSES.DONE ? this._textInput() : this._buttonSpin();
        return content;
    }
}
