import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import DialogManager from '../DialogManager/DialogManager';

type Props = {};

const b = block('dl-dialog-need-reset');

const i18n = I18n.keyset('component.need-reset-dialog.view');

export const DIALOG_NEED_RESET = Symbol('DIALOG_NEED_RESET');

export type OpenDialogNeedResetArgs = {
    id: typeof DIALOG_NEED_RESET;
    props?: undefined;
};

class DialogNeedReset extends React.Component<Props> {
    render() {
        return (
            <Dialog
                onClose={this.onClose}
                hasCloseButton={false}
                open={true}
                disableEscapeKeyDown={true}
                disableOutsideClick={true}
                className={b()}
            >
                <Dialog.Header caption={i18n('label_title')} />
                <Dialog.Body className={b('content')}>
                    <div>{i18n('label_description')}</div>
                </Dialog.Body>
                <Dialog.Footer
                    preset={'default'}
                    showError={false}
                    onClickButtonApply={this.onApply}
                    textButtonApply={i18n('button_apply')}
                    loading={false}
                ></Dialog.Footer>
            </Dialog>
        );
    }

    private onApply = () => {
        window.location.reload();
    };

    private onClose = () => {};
}

DialogManager.registerDialog(DIALOG_NEED_RESET, DialogNeedReset);
