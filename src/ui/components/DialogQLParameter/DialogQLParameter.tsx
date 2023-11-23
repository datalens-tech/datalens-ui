import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import _ from 'lodash';

import DialogManager from '../DialogManager/DialogManager';
import RelativeDatesPicker from '../RelativeDatesPicker/RelativeDatesPicker';

import './DialogQLParameter.scss';

export const DIALOG_QL_PARAMETER = Symbol('DIALOG_QL_PARAMETER');

const b = block('dl-dialog-ql-parameter');

const i18n = I18n.keyset('component.dl-dialog-ql-parameter.view');

export interface DialogQLApplyData {
    value: string;
}

export interface DialogQLParameterProps {
    onApply: (data: DialogQLApplyData) => void;
    onClose: () => void;
    visible: boolean;
    value: string;
}

interface DialogQLParameterState {
    value: string;
}

export type OpenDialogQLParameterArgs = {
    id: typeof DIALOG_QL_PARAMETER;
    props: DialogQLParameterProps;
};

class DialogQLParameter extends React.Component<DialogQLParameterProps, DialogQLParameterState> {
    constructor(props: DialogQLParameterProps) {
        super(props);

        this.state = {
            value: props.value,
        };
    }

    render() {
        const {visible} = this.props;

        const {value} = this.state;

        return (
            <Dialog open={visible} onClose={this.onClose} onEnterKeyDown={this.onApply}>
                <div className={b()}>
                    <Dialog.Header caption={i18n('label_header-title')} />
                    <Dialog.Body className={b('body')}>
                        <div className={b('filter-date')}>
                            <RelativeDatesPicker
                                range={false}
                                value={value}
                                withTime={false}
                                onChange={(newValue: string, {valid}: {valid: boolean}) => {
                                    if (valid) {
                                        this.setState({
                                            value: newValue,
                                        });
                                    }
                                }}
                            />
                        </div>
                    </Dialog.Body>
                    <Dialog.Divider />
                    <Dialog.Footer
                        onClickButtonCancel={this.onClose}
                        onClickButtonApply={this.onApply}
                        textButtonApply={i18n('button_apply')}
                        textButtonCancel={i18n('button_cancel')}
                    ></Dialog.Footer>
                </div>
            </Dialog>
        );
    }

    onApply = () => {
        this.props.onApply({value: this.state.value});
    };

    onClose = () => {
        this.props.onClose();
    };
}

DialogManager.registerDialog(DIALOG_QL_PARAMETER, DialogQLParameter);

export default DialogQLParameter;
