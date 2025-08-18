import React from 'react';

import {ChevronRight, Pencil, TrashBin} from '@gravity-ui/icons';
import {Button, Dialog, Icon, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {DialogEntryDescriptionQa} from 'shared';
import {useMountedState} from 'ui/hooks';
import {MarkdownProvider} from 'ui/modules';
import type {DialogEntryDescriptionProps} from 'ui/registry/units/common/types/components/DialogEntryDescription';
import {closeDialog} from 'ui/store/actions/dialog';

import logger from '../../libs/logger';
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

    const handleSupport = React.useCallback(() => {
        dispatch(closeDialog());
    }, [dispatch]);

    const handleClear = React.useCallback(() => {
        setText('');
    }, []);

    const renderSymbolsCounter = maxLength
        ? `${text.length.toLocaleString('ru-RU')} / ${maxLength.toLocaleString('ru-RU')}`
        : null;
    const isExceedLimit = maxLength ? text.length > maxLength : false;

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
                        {Boolean(maxLength) && (
                            <div
                                className={b('length-counter', {
                                    error: isExceedLimit,
                                })}
                            >
                                <span>{renderSymbolsCounter}</span>
                            </div>
                        )}
                    </Dialog.Body>
                    <Dialog.Footer
                        onClickButtonApply={handleApply}
                        textButtonApply={i18n('button_save')}
                        propsButtonApply={{
                            disabled: isExceedLimit,
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
                        <div className={b('content')}>
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
                        {!loading && (
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
