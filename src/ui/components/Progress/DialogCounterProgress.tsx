import React from 'react';

import {Dialog, Progress} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './DialogCounterProgress.scss';

const b = block('dl-dialog-counter-progress');

export type DialogCounterProgressProps = {
    count: number;
    value: number;
    hasError: boolean;
    onClose: () => void;
    textButtonCancel: string;
    caption: string;
    open?: boolean;
};

export const DialogCounterProgress = ({
    onClose,
    hasError,
    value,
    count,
    textButtonCancel,
    caption,
    open = true,
}: DialogCounterProgressProps) => {
    const totalUnknown = count === 0;

    const progress = totalUnknown ? 100 : Math.floor((100 * value) / count);
    const textProgress = totalUnknown ? value : `${value} / ${count}`;

    return (
        <Dialog
            size="s"
            open={open}
            onClose={onClose}
            hasCloseButton={false}
            disableOutsideClick={true}
            disableEscapeKeyDown={true}
        >
            <Dialog.Header caption={caption} />
            <Dialog.Body>
                <div className={b('content')}>
                    <Progress
                        className={b('progress')}
                        theme={hasError ? 'danger' : 'info'}
                        size="s"
                        value={progress}
                        loading={totalUnknown}
                    />
                    <div className={b('text-progress')}>{textProgress}</div>
                </div>
            </Dialog.Body>
            <Dialog.Footer onClickButtonCancel={onClose} textButtonCancel={textButtonCancel} />
        </Dialog>
    );
};
