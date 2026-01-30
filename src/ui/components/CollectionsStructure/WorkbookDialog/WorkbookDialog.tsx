import React from 'react';

import {Dialog, TextArea, TextInput} from '@gravity-ui/uikit';
import type {QAProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {WorkbookDialogQA} from 'shared/constants/qa';

import type {GetDialogFooterPropsOverride} from './types';

import './WorkbookDialog.scss';

const i18n = I18n.keyset('component.collections-structure');

const b = block('dl-workbook-dialog');

export type WorkbookDialogValues = {
    title: string;
    description: string;
};

type WorkbookDialogErrors = Partial<Record<keyof WorkbookDialogValues, string>>;

export type Props = {
    values: WorkbookDialogValues;
    errors?: WorkbookDialogErrors;
    title: string;
    textButtonApply: string;
    open: boolean;
    isLoading: boolean;
    isHiddenDescription?: boolean;
    titleAutoFocus?: boolean;
    onChange: (values: WorkbookDialogValues) => void;
    onApply: (values: WorkbookDialogValues, onClose: () => void) => void;
    onClose: () => void;
    customActions?: React.ReactNode;
    customBody?: React.ReactNode;
    getDialogFooterPropsOverride?: GetDialogFooterPropsOverride;
} & QAProps;

export const WorkbookDialog = React.memo<Props>(
    ({
        values,
        errors,
        title,
        textButtonApply,
        open,
        isLoading,
        isHiddenDescription = false,
        titleAutoFocus = false,
        onChange,
        onApply,
        onClose,
        customActions,
        customBody,
        getDialogFooterPropsOverride,
        qa,
    }) => {
        const handleChange = React.useCallback(
            (params) => {
                const {target} = params;

                onChange({
                    ...values,
                    [target.name]: target.value,
                });
            },
            [onChange, values],
        );

        const handleApply = React.useCallback(() => {
            onApply(values, onClose);
        }, [onApply, values, onClose]);

        const dialogFooterProps = React.useMemo(() => {
            const defaultDialogFooterProps = {
                onClickButtonCancel: onClose,
                onClickButtonApply: handleApply,
                textButtonApply: textButtonApply,
                propsButtonApply: {
                    disabled: !values.title,
                    qa: WorkbookDialogQA.APPLY_BUTTON,
                },
                textButtonCancel: i18n('action_cancel'),
                loading: isLoading,
                qaApplyButton: WorkbookDialogQA.APPLY_BUTTON,
            };
            return getDialogFooterPropsOverride
                ? getDialogFooterPropsOverride(defaultDialogFooterProps)
                : defaultDialogFooterProps;
        }, [
            getDialogFooterPropsOverride,
            handleApply,
            isLoading,
            onClose,
            textButtonApply,
            values.title,
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
                            name="title"
                            error={errors?.title}
                            value={values.title}
                            onChange={handleChange}
                            autoFocus={titleAutoFocus}
                            qa={WorkbookDialogQA.TITLE_INPUT}
                        />
                    </div>
                    {!isHiddenDescription && (
                        <div className={b('field')}>
                            <div className={b('title')}>{i18n('label_description')}</div>
                            <TextArea
                                name="description"
                                error={errors?.description}
                                value={values.description}
                                onChange={handleChange}
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
                qa={qa}
            >
                <Dialog.Header caption={title} />
                <Dialog.Body>{renderBody()}</Dialog.Body>
                <Dialog.Footer {...dialogFooterProps} loading={isLoading} />
            </Dialog>
        );
    },
);

WorkbookDialog.displayName = 'WorkbookDialog';
