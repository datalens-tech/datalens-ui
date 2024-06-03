import React from 'react';

import {Dialog, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {withHiddenUnmount} from 'ui';

import type {GeolayerSettings} from '../../../typings';

import './DialogGeolayer.scss';

const b = block('dialog-geolayer');
const i18n = I18n.keyset('wizard');

interface DialogGeolayerProps {
    layer: GeolayerSettings;
    visible: boolean;
    onApply: (updatedGeolayer: GeolayerSettings) => void;
    onClose: () => void;
}

interface DialogGeolayerState {
    name: string;
}

class DialogGeolayer extends React.Component<DialogGeolayerProps, DialogGeolayerState> {
    state: DialogGeolayerState = {
        name: this.props.layer.name,
    };

    render() {
        const {visible, onClose} = this.props;
        const {name} = this.state;

        return (
            <Dialog open={visible} onClose={onClose}>
                <Dialog.Header caption={i18n('label_layer-settings')} />
                <Dialog.Body className={b()}>
                    <div className={b('row')}>
                        <span className={b('label')}>{i18n('label_title')}</span>
                        <div className={b('title-input')}>
                            <TextInput
                                size="s"
                                value={name}
                                onUpdate={this.onNameTextInputChange}
                                qa="layer-name-input"
                                autoFocus
                            />
                        </div>
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    preset="default"
                    propsButtonApply={{
                        disabled: this.isButtonApplyDisabled(),
                        qa: 'apply-layer-settings-button',
                    }}
                    onClickButtonCancel={onClose}
                    onClickButtonApply={this.onApply}
                    textButtonApply={i18n('button_apply')}
                    textButtonCancel={i18n('button_cancel')}
                />
            </Dialog>
        );
    }

    private isButtonApplyDisabled = () => {
        const {layer} = this.props;
        const {name} = this.state;

        return !name || name === layer.name;
    };

    private onNameTextInputChange = (newName: string) => {
        this.setState({name: newName});
    };

    private onApply = () => {
        const {layer, onApply} = this.props;
        const {name} = this.state;

        const updatedGeolayer = {...layer, name};

        onApply(updatedGeolayer);
    };
}

export default withHiddenUnmount(DialogGeolayer);
