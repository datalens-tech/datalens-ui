import React from 'react';

import {Button, Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';

import './DialogSuccessWithAction.scss';

const b = block('dialog-success-with-action');

type Props = {
    onClose: () => void;
    onClick: () => void;
    title: string;
    buttonText: string;
};

export const DialogSuccessWithAction = ({onClose, onClick, title, buttonText}: Props) => {
    const renderAction = () => {
        return (
            <Button className={b('action')} size="l" view="action" onClick={onClick}>
                {buttonText}
            </Button>
        );
    };

    return (
        <Dialog className={b()} open={true} onClose={onClose}>
            <Dialog.Body>
                <PlaceholderIllustration
                    name="successOperation"
                    title={title}
                    direction="column"
                    renderAction={renderAction}
                    className={b('illustration')}
                />
            </Dialog.Body>
        </Dialog>
    );
};
