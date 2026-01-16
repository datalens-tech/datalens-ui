import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {DialogQLParameterQA, QLParamType} from '../../../shared';
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
    type: QLParamType;
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
        const {visible, type} = this.props;

        const {value} = this.state;

        const valueIsInterval =
            type === QLParamType.DatetimeInterval || type === QLParamType.DateInterval;

        const valueHasTime = type === QLParamType.Datetime || type === QLParamType.DatetimeInterval;

        return (
            <Dialog
                open={visible}
                onClose={this.onClose}
                onEnterKeyDown={this.onApply}
                qa={DialogQLParameterQA.Dialog}
            >
                <div className={b()}>
                    <Dialog.Header caption={i18n('label_header-title')} />
                    <Dialog.Body className={b('body')}>
                        <div className={b('filter-date')} data-qa={DialogQLParameterQA.DialogBody}>
                            <RelativeDatesPicker
                                range={valueIsInterval}
                                value={value}
                                withTime={valueHasTime}
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
                    <Dialog.Divider className={b('divider')} />
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
