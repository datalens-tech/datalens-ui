import React from 'react';

import {Modal} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import Body from './Body/Body';
import {Provider} from './Context/Context';
import Footer from './Footer/Footer';
import Header from './Header/Header';

import './Modal.scss';

const b = block('chartkit-modal');

class ModalComponent extends React.PureComponent {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)])
            .isRequired,
    };

    static Header = Header;
    static Body = Body;
    static Footer = Footer;

    render() {
        return (
            <Modal open={true} onClose={this.props.onClose}>
                <div className={b()}>
                    <Provider onClose={this.props.onClose}>{this.props.children}</Provider>
                </div>
            </Modal>
        );
    }
}

export default ModalComponent;
