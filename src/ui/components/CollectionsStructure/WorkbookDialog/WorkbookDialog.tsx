import React from 'react';

import {Dialog, TextArea, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

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
    onApply: (args: {title: string; description?: string}) => Promise<unknown>;
    onClose: () => void;
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
            }).then(() => {
                onClose();
            });
        }, [innerTitleValue, innerDescriptionValue, isHiddenDescription, onApply, onClose]);

        return (
            <Dialog
                className={b()}
                size="s"
                open={open}
                onClose={onClose}
                onEnterKeyDown={handleApply}
            >
                <Dialog.Header caption={title} />
                <Dialog.Body>
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
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={onClose}
                    onClickButtonApply={handleApply}
                    textButtonApply={textButtonApply}
                    propsButtonApply={{
                        disabled: !innerTitleValue,
                    }}
                    textButtonCancel={i18n('action_cancel')}
                    loading={isLoading}
                />
            </Dialog>
        );
    },
);

WorkbookDialog.displayName = 'WorkbookDialog';
