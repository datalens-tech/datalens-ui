import React from 'react';

import {TriangleExclamationFill} from '@gravity-ui/icons';
import {Button, Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {connect} from 'react-redux';
import type {DatalensGlobalState, EntryDialogProps} from 'ui';
import {EntryDialogResolveStatus} from 'ui';

import {DashUpdateStatus} from '../../../units/dash/typings/dash';

import './DialogMakeActualConfirm.scss';

const i18n = I18n.keyset('component.dialog-set-actual-confirm.view');
const b = block('dialog-make-actual-confirm');

interface OwnProps {
    onConfirm: () => void;
}

type StateProps = ReturnType<typeof mapStateToProps>;

export type DialogMakeActualConfirmProps = Partial<StateProps> & OwnProps & EntryDialogProps;

class DialogMakeActualConfirm extends React.PureComponent<DialogMakeActualConfirmProps> {
    componentDidUpdate() {
        if (this.props.updatingStatus === DashUpdateStatus.Successed) {
            this.handlerClose();
        }
    }

    render() {
        const {visible, updatingStatus} = this.props;

        return (
            <Dialog open={visible || false} onClose={this.handlerClose}>
                <div className={b()}>
                    <Dialog.Header caption={i18n('label_title')} />
                    <Dialog.Body className={b('body')}>
                        <div className={b('icon')}>
                            <Icon data={TriangleExclamationFill} size={32} />
                        </div>
                        <div className={b('message')}>{i18n('label_text')}</div>
                    </Dialog.Body>
                    <Dialog.Footer preset="default">
                        <div className={b('controls')}>
                            <Button
                                view="flat"
                                size="l"
                                className={b('button')}
                                onClick={this.handlerClose}
                            >
                                {i18n('button_cancel')}
                            </Button>
                            <Button
                                view="action"
                                size="l"
                                className={b('button')}
                                onClick={this.handlerShowClick}
                                loading={updatingStatus === DashUpdateStatus.Loading}
                            >
                                {i18n('button_confirm')}
                            </Button>
                        </div>
                    </Dialog.Footer>
                </div>
            </Dialog>
        );
    }

    private handlerShowClick = () => this.props.onConfirm();

    private handlerClose = () => this.props.onClose({status: EntryDialogResolveStatus.Close});
}

const mapStateToProps = (state: DatalensGlobalState) => ({
    entry: state.dash.entry,
    updatingStatus: state.dash.updateStatus,
});

export default connect(mapStateToProps)(DialogMakeActualConfirm);
