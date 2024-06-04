import React from 'react';

import {Button, Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {connect} from 'react-redux';
import type {DatalensGlobalState, EntryDialogProps} from 'ui';
import {EntryDialogResolveStatus, Interpolate} from 'ui';

import Utils from '../../../utils';

import './DialogEditWarning.scss';

const i18n = I18n.keyset('component.dialog-edit-warning.view');
const b = block('dialog-dash-edit-warning');

interface OwnProps {
    onEditClick: () => void;
    onShowHistoryClick: () => void;
}

type StateProps = ReturnType<typeof mapStateToProps>;

export type DialogEditWarningProps = Partial<StateProps> & OwnProps & EntryDialogProps;

class DialogEditWarning extends React.PureComponent<DialogEditWarningProps> {
    render() {
        const {visible, entryName = ''} = this.props;

        return (
            <Dialog open={visible || false} onClose={this.handlerClose} qa="dialog-draft-warning">
                <div className={b()}>
                    <Dialog.Header caption={i18n('label_dash-warning-title')} />
                    <Dialog.Body>
                        <div>
                            <Interpolate
                                text={i18n('label_dash-warning-text', {
                                    name: Utils.getEntryNameFromKey(entryName),
                                })}
                                matches={{
                                    b(match) {
                                        return <span className={b('text-selected')}>{match}</span>;
                                    },
                                }}
                            />
                        </div>
                    </Dialog.Body>
                    <Dialog.Footer preset="default">
                        <Button
                            view="normal"
                            size="l"
                            className={b('button')}
                            onClick={this.handlerEditEntryClick}
                            qa="dialog-draft-warning-edit-btn"
                        >
                            {i18n('button_edit')}
                        </Button>
                        <Button
                            view="action"
                            size="l"
                            className={b('button')}
                            onClick={this.handlerShowClick}
                        >
                            {i18n('button_show-in-history')}
                        </Button>
                    </Dialog.Footer>
                </div>
            </Dialog>
        );
    }

    private handlerShowClick = () => {
        this.handlerClose();
        this.props.onShowHistoryClick();
    };

    private handlerEditEntryClick = () => {
        this.handlerClose();
        this.props.onEditClick();
    };

    private handlerClose = () => this.props.onClose({status: EntryDialogResolveStatus.Close});
}

const mapStateToProps = (state: DatalensGlobalState) => ({
    entryName: state.dash.entry?.key,
});

export default connect(mapStateToProps)(DialogEditWarning);
