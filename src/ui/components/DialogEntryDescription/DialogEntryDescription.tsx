import React from 'react';

import {ChevronRight, Pencil, TrashBin} from '@gravity-ui/icons';
import {Button, Dialog, Icon, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {DialogEntryDescriptionQa} from 'shared';
import {MarkdownProvider} from 'ui/modules';
import type {DialogEntryDescriptionProps} from 'ui/registry/units/common/types/components/DialogEntryDescription';
import {closeDialog} from 'ui/store/actions/dialog';

import logger from '../../libs/logger';
import {TextEditor} from '../TextEditor/TextEditor';
import {YfmWrapper} from '../YfmWrapper/YfmWrapper';

const b = block('dialog-dash-meta');
const i18n = I18n.keyset('component.dialog-entry-description');

const MAX_DESCRIPTION_LENGTH = 36_000;

export const DialogEntryDescription: React.FC<DialogEntryDescriptionProps> = (props) => {
    const {
        title,
        canEdit,
        isEditMode,
        description,
        onEdit,
        onApply,
        onCancel,
        onCloseCallback,
        onContactService,
    } = props;

    const isMounted = React.useRef<boolean>(false);
    const dispatch = useDispatch();

    const isEditable = canEdit && isEditMode;

    const [text, setText] = React.useState(description || '');
    const [markdown, setMarkdown] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, []);

    React.useEffect(() => {
        if (!isEditable) {
            (async () => {
                setLoading(true);
                try {
                    const {result} = await MarkdownProvider.getMarkdown({text});
                    if (isMounted.current) {
                        setMarkdown(result);
                    }
                } catch (error) {
                    logger.logError('DialogEntryDescription: getMarkdown failed', error);
                }
                if (isMounted.current) {
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

    const handleSupport = React.useCallback(() => {
        onContactService?.();
        dispatch(closeDialog());
    }, [dispatch, onContactService]);

    const handleClear = React.useCallback(() => {
        setText('');
    }, []);

    const renderSymbolsCounter = `${text.length.toLocaleString('ru-RU')} / ${MAX_DESCRIPTION_LENGTH.toLocaleString('ru-RU')}`;
    const isExceedLimit = text.length > MAX_DESCRIPTION_LENGTH;

    return (
        <Dialog
            open={true}
            onClose={handleClose}
            disableOutsideClick={true}
            qa={DialogEntryDescriptionQa.Root}
        >
            <Dialog.Header caption={title} />
            {isEditable ? (
                <React.Fragment>
                    <Dialog.Body className={b()}>
                        {props.subTitle && <div className={b('subtitle')}>{props.subTitle}</div>}
                        <TextEditor autofocus onTextUpdate={setText} text={text} />
                        <div
                            className={b('length-counter', {
                                error: isExceedLimit,
                            })}
                        >
                            <span>{renderSymbolsCounter}</span>
                        </div>
                    </Dialog.Body>
                    <Dialog.Footer
                        onClickButtonApply={handleApply}
                        textButtonApply={i18n('button_save')}
                        propsButtonApply={{
                            disabled: text.length > MAX_DESCRIPTION_LENGTH,
                            qa: DialogEntryDescriptionQa.SaveButton,
                        }}
                        onClickButtonCancel={handleClose}
                        textButtonCancel={i18n('button_cancel')}
                    >
                        <Button view="flat-danger" onClick={handleClear}>
                            <Icon data={TrashBin} size={16} />
                            {i18n('button_clear')}
                        </Button>
                    </Dialog.Footer>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <Dialog.Body className={b()}>
                        <div className={b('content', {narrow: Boolean(onContactService)})}>
                            {loading ? (
                                <div className={b('yfm-loader')}>
                                    <Loader size="m" />
                                </div>
                            ) : (
                                <YfmWrapper className={b()} content={markdown} setByInnerHtml />
                            )}
                        </div>
                    </Dialog.Body>
                    <Dialog.Footer>
                        {!loading && canEdit && (
                            <Button
                                view="flat-secondary"
                                onClick={handleEdit}
                                qa={DialogEntryDescriptionQa.EditButton}
                            >
                                <Icon data={Pencil} size={16} />
                                {i18n('button_edit')}
                            </Button>
                        )}
                        {!loading && onContactService && (
                            <Button view="outlined" onClick={handleSupport}>
                                {i18n('button_contact-service')}
                                <Icon data={ChevronRight} size={16} />
                            </Button>
                        )}
                    </Dialog.Footer>
                </React.Fragment>
            )}
        </Dialog>
    );
};
