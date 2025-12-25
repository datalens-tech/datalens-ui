import React from 'react';

import type {ButtonView, TextInputProps} from '@gravity-ui/uikit';
import {Alert, Dialog, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {DialogCreateWorkbookEntryQa} from 'shared';

import {I18n} from '../../../../i18n';
import logger from '../../../libs/logger';
import type {DataLensApiError} from '../../../typings';

import './DialogCreateWorkbookEntry.scss';

const b = block('dl-dialog-create-workbook-entry');
const i18n = I18n.keyset('component.dialog-create-workbook-entry.view');

type OnErrorReturn = null | {
    inputError: TextInputProps['error'];
};

interface DialogCreateWorkbookEntryGeneralProps<T> {
    onClose: () => void;
    onApply: (data: {name: string; workbookId?: string; collectionId?: string}) => Promise<T>;
    onSuccess: (data: T) => void;
    onError?: (error: DataLensApiError) => OnErrorReturn;
    visible: boolean;
    caption: string;
    textButtonCancel: string;
    textButtonApply: string;
    placeholder?: string;
    warningMessage?: React.ReactNode;
    workbookId?: string;
    collectionId?: string;
}

interface DialogCreateWorkbookEntryDefaultProps {
    name: string;
    defaultName: string;
    confirmButtonView?: ButtonView;
}

export interface DialogCreateWorkbookEntryProps<T = unknown>
    extends DialogCreateWorkbookEntryGeneralProps<T>,
        Partial<DialogCreateWorkbookEntryDefaultProps> {}

type EntryDialogBaseInnerProps<T> = DialogCreateWorkbookEntryGeneralProps<T> &
    DialogCreateWorkbookEntryDefaultProps;

interface DialogCreateWorkbookEntryState {
    name: string;
    loading: boolean;
    inputError: TextInputProps['error'];
}

export class DialogCreateWorkbookEntry<T> extends React.Component<
    EntryDialogBaseInnerProps<T>,
    DialogCreateWorkbookEntryState
> {
    static defaultProps: DialogCreateWorkbookEntryDefaultProps = {
        name: '',
        defaultName: '',
        confirmButtonView: 'action',
    };

    state: DialogCreateWorkbookEntryState = {
        name: this.props.name,
        loading: false,
        inputError: false,
    };

    private textInputRef: React.RefObject<HTMLInputElement> = React.createRef();
    private isUnmounted = false;

    componentDidMount() {
        // This solution works when a dialog is opened using DialogManager,
        // because for each opening components mount takes place.
        this.textInputRef.current?.focus();
    }

    componentDidUpdate({visible: prevVisible}: EntryDialogBaseInnerProps<T>) {
        const {visible} = this.props;

        // This solution works when the dialog is opened by manipulating the visible prop,
        // and the component itself is mounted once
        if (visible && visible !== prevVisible) {
            this.textInputRef.current?.focus();

            if (this.state.inputError) {
                this.setState({inputError: false});
            }
        }
    }

    componentWillUnmount() {
        this.isUnmounted = true;
    }

    render() {
        const {
            caption,
            visible,
            placeholder,
            textButtonApply,
            textButtonCancel,
            children,
            warningMessage,
            confirmButtonView,
        } = this.props;
        const {name, loading, inputError} = this.state;

        return (
            <Dialog
                qa={DialogCreateWorkbookEntryQa.Root}
                size="s"
                open={visible}
                onClose={this.onClose}
                onEnterKeyDown={this.onApply}
            >
                <Dialog.Header caption={caption} />
                <Dialog.Body>
                    <div className={b('content')} data-qa="dialog-create-workbook-entry">
                        {children ? (
                            children
                        ) : (
                            <div className={b('row')}>
                                <span className={b('row-label')}>{i18n('label_name')}</span>
                                <TextInput
                                    qa={DialogCreateWorkbookEntryQa.Input}
                                    controlRef={this.textInputRef}
                                    value={name}
                                    placeholder={placeholder}
                                    onUpdate={this.onUpdateInput}
                                    error={inputError}
                                />
                            </div>
                        )}
                        {warningMessage && (
                            <div className={b('warning')}>
                                <Alert theme="warning" message={warningMessage} view="outlined" />
                            </div>
                        )}
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={this.onClose}
                    onClickButtonApply={this.onApply}
                    propsButtonApply={{
                        qa: DialogCreateWorkbookEntryQa.ApplyButton,
                        view: confirmButtonView,
                    }}
                    textButtonApply={textButtonApply}
                    textButtonCancel={textButtonCancel}
                    loading={loading}
                />
            </Dialog>
        );
    }

    private onApply = async () => {
        this.setState({loading: true});
        const {name: stateName} = this.state;
        const name = (stateName === '' ? this.props.defaultName : stateName).trim();

        try {
            const data = await this.props.onApply({
                name,
                workbookId: this.props.workbookId,
                collectionId: this.props.collectionId,
            });
            this.props.onSuccess(data);
            if (this.isUnmounted) {
                return;
            }
            this.setState({loading: false});
        } catch (error) {
            logger.logError('DialogCreateWorkbookEntry: onApply failed', error);
            const errorReturn = this.props.onError?.(error);
            const inputError = errorReturn?.inputError || false;
            if (this.isUnmounted) {
                return;
            }
            this.setState({loading: false, inputError});
        }
    };

    private onClose = () => {
        if (this.state.loading) {
            return;
        }

        this.props.onClose();
    };

    private onUpdateInput = (name: string) => this.setState({name, inputError: false});
}
