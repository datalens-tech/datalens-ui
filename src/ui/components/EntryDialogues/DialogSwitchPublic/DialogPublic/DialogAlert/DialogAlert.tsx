import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {withPromiseOpen} from '../../../../../hoc/withPromiseOpen';
import {RESOLVE_STATUS} from '../constants';

import './DialogAlert.scss';

const b = block('dl-public-alert-dialog');
const i18n = I18n.keyset('component.dialog-switch-public.view');

type Props = {
    onClose: (value: {status: (typeof RESOLVE_STATUS)[keyof typeof RESOLVE_STATUS]}) => void;
    visible: boolean;
    publish?: boolean;
    many?: boolean;
};

function DialogAlert({visible, onClose, publish, many}: Props) {
    function onCloseDialog() {
        onClose({status: RESOLVE_STATUS.CLOSE});
    }

    function onApplyDialog() {
        onClose({status: RESOLVE_STATUS.APPLY});
    }

    let caption;
    let text;

    if (many) {
        caption = publish
            ? i18n('section_alert-publish-title-many')
            : i18n('section_alert-unpublish-title-many');
        text = publish
            ? i18n('label_alert-publish-text-many')
            : i18n('label_alert-unpublish-text-many');
    } else {
        caption = publish
            ? i18n('section_alert-publish-title')
            : i18n('section_alert-unpublish-title');
        text = publish ? i18n('label_alert-publish-text') : i18n('label_alert-unpublish-text');
    }

    return (
        <Dialog hasCloseButton={false} open={visible} onClose={onCloseDialog}>
            <div className={b()}>
                <Dialog.Header caption={caption} />
                <Dialog.Body className={b('body')}>{text}</Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={onCloseDialog}
                    onClickButtonApply={onApplyDialog}
                    textButtonApply={i18n('button_continue')}
                    textButtonCancel={i18n('button_cancel')}
                />
            </div>
        </Dialog>
    );
}

export default withPromiseOpen(DialogAlert);
