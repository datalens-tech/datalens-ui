import React from 'react';

import {ChevronRight, Pencil, TrashBin} from '@gravity-ui/icons';
import {Button, Dialog, Icon, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {TextEditor} from 'ui/components/TextEditor/TextEditor';
import type {DialogDashMetaProps} from 'ui/registry/units/dash/types/DialogDashMeta';

import {DashMetaQa} from '../../../../shared/constants/qa/dash';
import logger from '../../../libs/logger';
import {MarkdownProvider} from '../../../modules';
import {YfmWrapper} from '../../YfmWrapper/YfmWrapper';
import {EntryDialogResolveStatus} from '../constants';

import './DialogDashMeta.scss';

const b = block('dialog-dash-meta');
const i18n = I18n.keyset('component.dialog-dash-meta');

export const DialogDashMeta = (props: DialogDashMetaProps) => {
    const {
        onEdit,
        onApply,
        onClose,
        onCancel,
        onContactService,
        canEdit,
        isEditMode,
        onCloseCallback,
    } = props;

    const isMounted = React.useRef<boolean>(false);

    const isEditable = canEdit && isEditMode;

    const [text, setText] = React.useState(props.text || '');
    const [markdown, setMarkdown] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const renderSymbolsCounter = `${text.length}/${props.maxLength}`;

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
                    logger.logError('DialogDashMeta: getMarkdown failed', error);
                }
                if (isMounted.current) {
                    setLoading(false);
                }
            })();
        }
    }, [isEditable, text]);

    const handleTextUpdate = React.useCallback((value: string) => {
        setText(value);
    }, []);

    const handleClose = React.useCallback(() => {
        onCancel?.();
        onClose({status: EntryDialogResolveStatus.Close});
        onCloseCallback?.();
    }, [onCancel, onClose, onCloseCallback]);

    const handleApply = React.useCallback(() => {
        onApply?.(text);
        onClose({status: EntryDialogResolveStatus.Success});
    }, [onApply, onClose, text]);

    const handleEdit = React.useCallback(() => {
        onEdit?.(text);
    }, [onEdit, text]);

    const handleSupport = React.useCallback(() => {
        onContactService?.();
        onClose({status: EntryDialogResolveStatus.Success});
    }, [onContactService, onClose]);

    const handleClear = React.useCallback(() => {
        setText('');
    }, []);

    return (
        <Dialog
            open={props.visible}
            onClose={handleClose}
            disableOutsideClick={true}
            qa={DashMetaQa.Dialog}
        >
            <Dialog.Header caption={props.title} />
            {isEditable ? (
                <React.Fragment>
                    <Dialog.Body className={b()}>
                        {props.subTitle && <div className={b('subtitle')}>{props.subTitle}</div>}
                        <TextEditor autofocus onTextUpdate={handleTextUpdate} text={text} />
                        {props.maxLength && props.maxLength >= (props.text || '').length ? (
                            <div
                                className={b('length-counter', {
                                    error: props.maxLength ? text.length > props.maxLength : false,
                                })}
                            >
                                <span>{renderSymbolsCounter}</span>
                            </div>
                        ) : null}
                    </Dialog.Body>
                    <Dialog.Footer
                        onClickButtonApply={handleApply}
                        textButtonApply={i18n('button_save')}
                        propsButtonApply={{
                            disabled: props.maxLength ? text.length > props.maxLength : false,
                            qa: DashMetaQa.SaveButton,
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
                                qa={DashMetaQa.EditButton}
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
