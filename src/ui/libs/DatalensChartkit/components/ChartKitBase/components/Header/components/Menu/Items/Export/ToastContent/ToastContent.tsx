import React from 'react';

import {CircleCheckFill} from '@gravity-ui/icons';
import {Icon, Loader, Toast, Toaster} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import type {ExportChartArgs} from '../types';
import {truncateTextWithEllipsis} from '../utils';

import './ToastContent.scss';

const toaster = new Toaster();

const b = block('export-loading');

const SUCCESS_ICON_SIZE = 20;
const AUTOHIDING_TIMEOUT = 3000;
const UPDATE_TOAST_DELAY = 500;
const REFERENCE_TOAST_NAME = 'referenceToast';

const ToastContent = ({text}: {text?: string}) => {
    return (
        <div className={b('content')}>
            <div className={b('text')}>{text}</div>
        </div>
    );
};

const SuccessIcon = () => {
    return (
        <div className={b('success-icon')}>
            <Icon data={CircleCheckFill} size={SUCCESS_ICON_SIZE} />
        </div>
    );
};

const ReferenceToast = () => {
    return (
        <Toast
            className={b({reference: true})}
            name={REFERENCE_TOAST_NAME}
            content={<ToastContent />}
            removeCallback={() => {}}
            autoHiding={false}
            renderIcon={() => <SuccessIcon />}
        />
    );
};

export const setLoadingToast = (fileName: string, format: string) => {
    const displayedText =
        truncateTextWithEllipsis(fileName, <ReferenceToast />, b('content')) + format;

    if (!toaster.has(fileName)) {
        toaster.add({
            autoHiding: false,
            name: fileName,
            content: <ToastContent text={displayedText} />,
            renderIcon: () => <Loader />,
            isClosable: false,
            className: b(),
        });
    }
};

export const updateLoadingToast = (
    fileName: string,
    onExportLoading?: ExportChartArgs['onExportLoading'],
) => {
    // timeout is needed for work of toast's animation when the update happens too fast
    setTimeout(() => {
        onExportLoading?.(false);
        toaster.update(fileName, {
            autoHiding: AUTOHIDING_TIMEOUT,
            renderIcon: () => <SuccessIcon />,
            className: b({success: true}),
        });
    }, UPDATE_TOAST_DELAY);
};
