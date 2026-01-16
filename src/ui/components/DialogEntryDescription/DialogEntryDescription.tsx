import React from 'react';

import {Pencil, TrashBin} from '@gravity-ui/icons';
import {Button, Icon, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {DialogEntryDescriptionQa} from 'shared';
import {DL, SHEET_IDS} from 'ui/constants';
import {useMountedState} from 'ui/hooks';
import {MarkdownProvider} from 'ui/modules';
import type {DialogEntryDescriptionProps} from 'ui/registry/units/common/types/components/DialogEntryDescription';
import {closeDialog} from 'ui/store/actions/dialog';

import logger from '../../libs/logger';
import {AdaptiveDialog} from '../AdaptiveDialog/AdaptiveDialog';
import {TextEditor} from '../TextEditor/TextEditor';
import {YfmWrapper} from '../YfmWrapper/YfmWrapper';

import './DialogEntryDescription.scss';

const b = block('dialog-entry-description');
const i18n = I18n.keyset('component.dialog-entry-description');

export const DialogEntryDescription: React.FC<DialogEntryDescriptionProps> = (props) => {
    const {
        title,
        canEdit,
        isEditMode,
        description,
        maxLength,
        onEdit,
        onApply,
        onCancel,
        onCloseCallback,
    } = props;

    const isMounted = useMountedState();
    const dispatch = useDispatch();

    const isEditable = canEdit && isEditMode;

    const [text, setText] = React.useState(description || '');
    const [markdown, setMarkdown] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (!isEditable) {
            (async () => {
                setLoading(true);
                try {
                    const {result} = await MarkdownProvider.getMarkdown({text});
                    if (isMounted()) {
                        setMarkdown(result);
                    }
                } catch (error) {
                    logger.logError('DialogEntryDescription: getMarkdown failed', error);
                }
                if (isMounted()) {
                    setLoading(false);
                }
            })();
        }
    }, [isEditable, text]);

    const handleClose = React.useCallback(() => {
        onCancel?.();
        dispatch(closeDialog());
        onCloseCallback?.();
    }, [dispatch, onCancel, onCloseCallback]);

    const handleApply = React.useCallback(() => {
        onApply?.(text);
        dispatch(closeDialog());
    }, [dispatch, onApply, text]);

    const handleEdit = React.useCallback(() => {
        onEdit?.(text);
    }, [onEdit, text]);

    const handleClear = React.useCallback(() => {
        setText('');
    }, []);

    const renderSymbolsCounter = maxLength
        ? `${text.length.toLocaleString('ru-RU')} / ${maxLength.toLocaleString('ru-RU')}`
        : null;
    const isExceedLimit = maxLength ? text.length > maxLength : false;

    const dialogFooterProps = isEditable
        ? {
              onClickButtonApply: handleApply,
              textButtonApply: i18n('button_save'),
              propsButtonApply: {
                  disabled: isExceedLimit,
                  qa: DialogEntryDescriptionQa.SaveButton,
              },
              onClickButtonCancel: handleClose,
              textButtonCancel: i18n('button_cancel'),
          }
        : undefined;

    const renderDialogFooter = () => {
        if (isEditable) {
            return (
                <Button view="flat-danger" onClick={handleClear}>
                    <Icon data={TrashBin} size={16} />
                    {i18n('button_clear')}
                </Button>
            );
        }

        if (!loading && canEdit) {
            return (
                <Button
                    view="flat-secondary"
                    onClick={handleEdit}
                    qa={DialogEntryDescriptionQa.EditButton}
                >
                    <Icon data={Pencil} size={16} />
                    {i18n('button_edit')}
                </Button>
            );
        }
        return null;
    };

    return (
        <AdaptiveDialog
            visible={true}
            onClose={handleClose}
            id={SHEET_IDS.DIALOG_ENTRY_DESCRIPTION}
            dialogProps={{
                disableOutsideClick: true,
                // TODO: remove after https://github.com/gravity-ui/uikit/issues/2361
                disableHeightTransition: true,
            }}
            dialogBodyClassName={b()}
            sheetContentClassName={b({mobile: DL.IS_MOBILE})}
            title={title}
            dialogFooterProps={dialogFooterProps}
            renderDialogFooter={renderDialogFooter}
            qa={DialogEntryDescriptionQa.Root}
        >
            {isEditable ? (
                <React.Fragment>
                    {props.subTitle && <div className={b('subtitle')}>{props.subTitle}</div>}
                    <TextEditor autofocus onTextUpdate={setText} text={text} />
                    {Boolean(maxLength) && (
                        <div
                            className={b('length-counter', {
                                error: isExceedLimit,
                            })}
                        >
                            <span>{renderSymbolsCounter}</span>
                        </div>
                    )}
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <div className={b('content')}>
                        {loading ? (
                            <div className={b('yfm-loader')}>
                                <Loader size="m" />
                            </div>
                        ) : (
                            <YfmWrapper className={b()} content={markdown} setByInnerHtml />
                        )}
                    </div>
                </React.Fragment>
            )}
        </AdaptiveDialog>
    );
};
