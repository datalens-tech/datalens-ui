import React from 'react';

import {TriangleExclamationFill} from '@gravity-ui/icons';
import type {ButtonButtonProps as ButtonProps} from '@gravity-ui/uikit';
import {Alert, Button, Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {withHiddenUnmount} from '../../hoc/withHiddenUnmount';

import './DialogCommon.scss';

const b = block('dl-dialog-common');

export type DialogCommonButton = {
    text: React.ReactNode;
    containerClassName?: string;
} & Omit<ButtonProps, 'children'>;

export type DialogCommonProps = {
    qa?: string;
    visible: boolean;
    onClose: () => void;

    headerText?: string;
    actions?: DialogCommonButton[];

    widthType?: 'medium'; // dialog width presets
    isWarning?: boolean;
    showAlert?: boolean;
    showIcon?: boolean;

    closeOnEnterPress?: boolean;

    className?: string;
};

const DialogCommon: React.FC<DialogCommonProps> = (props) => {
    const {
        qa,
        visible,
        children,
        actions,
        closeOnEnterPress,
        onClose,
        isWarning,
        headerText,
        widthType,
        showIcon = true,
        showAlert,
        className,
    } = props;

    const enterPressHandler = React.useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                onClose();
            }
        },
        [onClose],
    );

    React.useEffect(() => {
        if (closeOnEnterPress && visible) {
            document.addEventListener('keydown', enterPressHandler);
        }

        return () => {
            if (closeOnEnterPress) {
                document.removeEventListener('keydown', enterPressHandler);
            }
        };
    }, [closeOnEnterPress, visible, enterPressHandler]);

    const buttonWidth = isWarning ? 'auto' : 'max';
    return (
        <Dialog
            open={visible}
            onClose={() => onClose()}
            hasCloseButton={Boolean(headerText)}
            className={b(
                {warning: isWarning, [widthType as string]: Boolean(widthType)},
                className,
            )}
            qa={qa}
        >
            {headerText && (
                <Dialog.Header className={b('header', {warning: isWarning})} caption={headerText} />
            )}
            <Dialog.Body className={b('body-container', {warning: isWarning})}>
                {showAlert ? (
                    <Alert theme="warning" message={children} view="outlined" />
                ) : (
                    <div className={b('body', {warning: isWarning})}>
                        {showIcon && (
                            <div className={b('icon', {warning: isWarning})}>
                                <Icon data={TriangleExclamationFill} size={32} />
                            </div>
                        )}
                        <div
                            className={b('message', {
                                warning: isWarning,
                                'no-icon': !showIcon,
                            })}
                        >
                            {children}
                        </div>
                    </div>
                )}
            </Dialog.Body>
            {actions && actions.length > 0 && (
                <div className={b('footer', {warning: isWarning})}>
                    {actions.map(({containerClassName, text, ...buttonProps}, i) => (
                        <div
                            key={`common-button-${i}`}
                            className={b(
                                'button',
                                {
                                    warning: isWarning,
                                    first: i === 0,
                                    last: i === actions.length - 1,
                                },
                                containerClassName,
                            )}
                        >
                            <Button width={buttonWidth} size="l" {...buttonProps}>
                                {text}
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </Dialog>
    );
};

export default withHiddenUnmount(DialogCommon);
