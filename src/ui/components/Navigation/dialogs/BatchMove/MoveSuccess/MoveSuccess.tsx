import React from 'react';

import {Button, Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';

import './MoveSuccess.scss';

const b = block('dl-nav-move-success');
const i18n = I18n.keyset('component.navigation.view');

type Props = {
    onOpenFolder: () => void;
    onClose: () => void;
};

export const MoveSuccess = ({onClose, onOpenFolder}: Props) => {
    const renderAction = () => {
        return (
            <Button className={b('action')} size="l" view="action" onClick={onOpenFolder}>
                {i18n('button_goto-folder')}
            </Button>
        );
    };

    return (
        <Dialog className={b()} open={true} onClose={onClose}>
            <Dialog.Body>
                <PlaceholderIllustration
                    name="successOperation"
                    description={i18n('label_batch-move-success-description')}
                    direction="column"
                    renderAction={renderAction}
                />
            </Dialog.Body>
        </Dialog>
    );
};
