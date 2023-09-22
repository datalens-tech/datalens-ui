import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Button, Icon, Modal} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

import './ChartsModal.scss';

const b = block('charts-modal');

export default class ChartsModal extends React.PureComponent {
    static propTypes = {
        element: PropTypes.object, // The DOM element on which mountComponent was called
        onOutsideClick: PropTypes.func,
        mix: PropTypes.string,
    };

    static defaultProps = {
        mix: '',
    };

    static onClickClose = (event, element) => {
        if (event) {
            event.stopPropagation(); // github.com/facebook/react/issues/6232
        }
        ReactDOM.unmountComponentAtNode(element);
    };

    state = {visible: false};

    constructor(props) {
        super(props);

        // TODO: because of the old version of the islands on the Traf / ISL-3849
        setTimeout(this.setState.bind(this, {visible: true}), 0);
    }

    render() {
        return (
            <Modal open={this.state.visible} onClose={this._onClickClose}>
                <div className={b(false, this.props.mix)}>
                    {this.props.children}
                    <Button
                        view="flat-secondary"
                        size="l"
                        onClick={this._onClickClose}
                        className={b('cross')}
                    >
                        <Icon data={Xmark} height={16} width={16} />
                    </Button>
                </div>
            </Modal>
        );
    }

    _onClickClose = (event) => {
        if (this.props.onOutsideClick) {
            this.props.onOutsideClick();
        } else {
            ChartsModal.onClickClose(event, this.props.element);
        }
    };
}

// eslint-disable-next-line react/display-name
ChartsModal.Section = (props) => <div className={b('section', props.mix)}>{props.children}</div>;
ChartsModal.Section.propTypes = {
    children: (props, propName) => {
        React.Children.forEach(props[propName], (child) => {
            if (
                child.type !== ChartsModal.Body &&
                child.type !== ChartsModal.Header &&
                child.type !== ChartsModal.Footer
            ) {
                console.warn(
                    "children should be of type 'ChartsModal.Header', 'ChartsModal.Body', 'ChartsModal.Footer'.",
                );
            }
        });
    },
    mix: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
};
ChartsModal.Section.defaultProps = {
    mix: '',
};

// eslint-disable-next-line react/display-name
ChartsModal.Header = (props) => <div className={b('header', props.mix)}>{props.children}</div>;
ChartsModal.Header.propTypes = {
    mix: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
};
ChartsModal.Header.defaultProps = {
    mix: '',
};

// eslint-disable-next-line react/display-name
ChartsModal.Body = (props) => <div className={b('body', props.mix)}>{props.children}</div>;
ChartsModal.Body.propTypes = {
    mix: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
};
ChartsModal.Body.defaultProps = {
    mix: '',
};

// eslint-disable-next-line react/display-name
ChartsModal.Footer = (props) => <div className={b('footer')}>{props.children}</div>;
