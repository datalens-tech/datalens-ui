import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import PropTypes from 'prop-types';

import {Context} from '../Context/Context';

import './Footer.scss';

const b = block('chartkit-modal-footer');

class Footer extends React.PureComponent {
    static contextType = Context;

    static propTypes = {
        applyText: PropTypes.string,
        onApply: PropTypes.func.isRequired,
    };

    static defaultProps = {
        applyText: i18n('chartkit.menu', 'button_apply'),
    };

    onApply = async () => {
        await this.props.onApply();
        this.context.onClose();
    };

    render() {
        return (
            <div className={b()}>
                <Button view="outlined" width="max" size="l" onClick={this.context.onClose}>
                    {i18n('chartkit.menu', 'button_cancel')}
                </Button>
                <Button
                    view="action"
                    width="max"
                    size="l"
                    onClick={this.onApply}
                    {...this.props.applyButtonProps}
                >
                    {this.props.applyText}
                </Button>
            </div>
        );
    }
}

export default Footer;
