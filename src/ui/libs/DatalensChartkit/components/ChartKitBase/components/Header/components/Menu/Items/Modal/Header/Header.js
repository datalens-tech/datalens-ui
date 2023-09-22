import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import PropTypes from 'prop-types';

import {Context} from '../Context/Context';

import './Header.scss';

const b = block('chartkit-modal-header');

class Header extends React.PureComponent {
    static contextType = Context;

    static propTypes = {
        caption: PropTypes.string.isRequired,
    };

    render() {
        return (
            <div className={b()}>
                {this.props.caption}
                <Button view="flat-secondary" size="l" onClick={this.context.onClose}>
                    <Icon data={Xmark} size={16} />
                </Button>
            </div>
        );
    }
}

export default Header;
