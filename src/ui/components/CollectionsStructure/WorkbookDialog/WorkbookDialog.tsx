import React from 'react';

import {Dialog, TextArea, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import type {GetDialogFooterPropsOverride} from './types';

import './WorkbookDialog.scss';

const i18n = I18n.keyset('component.collections-structure');

const b = block('dl-workbook-dialog');

export type Props = {
    title: string;
    textButtonApply: string;
    open: boolean;
    isLoading: boolean;
    titleValue?: string;
    descriptionValue?: string;
    isHiddenDescription?: boolean;
    titleAutoFocus?: boolean;
    onApply: (args: {title: string; description?: string; onClose: () => void}) => void;
    onClose: () => void;
    customActions?: React.ReactNode;
    customBody?: React.ReactNode;
    getDialogFooterPropsOverride?: GetDialogFooterPropsOverride;
};

export const WorkbookDialog = React.memo<Props>(
    ({
        title,
        textButtonApply,
        open,
        isLoading,
        titleValue = '',
        descriptionValue = '',
        isHiddenDescription = false,
        titleAutoFocus = false,
        onApply,
        onClose,
        customActions,
        customBody,
        getDialogFooterPropsOverride,
    }) => {
        const [innerTitleValue, setInnerTitleValue] = React.useState(titleValue);
        const [innerDescriptionValue, setInnerDescriptionValue] = React.useState(descriptionValue);

        React.useEffect(() => {
            if (open) {
                setInnerTitleValue(titleValue);
                setInnerDescriptionValue(descriptionValue);
            }
        }, [open, titleValue, descriptionValue]);

        const handleApply = React.useCallback(() => {
            onApply({
                title: innerTitleValue,
                description: isHiddenDescription ? undefined : innerDescriptionValue,
                onClose,
            });
        }, [innerTitleValue, isHiddenDescription, innerDescriptionValue, onApply, onClose]);

        const dialogFooterProps = React.useMemo(() => {
            const defaultDialogFooterProps = {
                onClickButtonCancel: onClose,
                onClickButtonApply: handleApply,
                textButtonApply: textButtonApply,
                propsButtonApply: {
                    disabled: !innerTitleValue,
                },
                textButtonCancel: i18n('action_cancel'),
                loading: isLoading,
            };
            return getDialogFooterPropsOverride
                ? getDialogFooterPropsOverride(defaultDialogFooterProps)
                : defaultDialogFooterProps;
        }, [
            getDialogFooterPropsOverride,
            handleApply,
            innerTitleValue,
            isLoading,
            onClose,
            textButtonApply,
        ]);

        const renderBody = () => {
            if (customBody) {
                return customBody;
            }

            return (
                <React.Fragment>
                    <div className={b('field')}>
                        <div className={b('title')}>{i18n('label_title')}</div>
                        <TextInput
                            value={innerTitleValue}
                            onUpdate={setInnerTitleValue}
                            autoFocus={titleAutoFocus}
                        />
                    </div>
                    {!isHiddenDescription && (
                        <div className={b('field')}>
                            <div className={b('title')}>{i18n('label_description')}</div>
                            <TextArea
                                value={innerDescriptionValue}
                                onUpdate={setInnerDescriptionValue}
                                minRows={2}
                            />
                        </div>
                    )}
                    {customActions}
                </React.Fragment>
            );
        };

        return (
            <Dialog
                className={b()}
                size="s"
                open={open}
                onClose={onClose}
                onEnterKeyDown={handleApply}
            >
                <Dialog.Header caption={title} />
                <Dialog.Body>{renderBody()}</Dialog.Body>
                <Dialog.Footer {...dialogFooterProps} loading={isLoading} />
            </Dialog>
        );
    },
);

WorkbookDialog.displayName = 'WorkbookDialog';
