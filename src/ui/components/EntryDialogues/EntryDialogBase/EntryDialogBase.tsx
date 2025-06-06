import React from 'react';

import {Alert, Dialog} from '@gravity-ui/uikit';
import type {ButtonView} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DataLensApiError} from 'typings';

import {EntryDialogQA, normalizeDestination} from '../../../../shared';
import logger from '../../../libs/logger';
import Utils from '../../../utils';
import type {PathSelectProps} from '../../PathSelect/PathSelect';
import PathSelect from '../../PathSelect/PathSelect';

import './EntryDialogBase.scss';

const b = block('dl-entry-dialog-base');

type OnErrorReturn = null | {
    inputError: PathSelectProps['inputError'];
};

interface EntryDialogBaseGeneralProps<T> {
    onClose: () => void;
    onApply: (key: string, name: string, path: string) => Promise<T>;
    onSuccess: (data: T) => void;
    onError: (error: DataLensApiError) => OnErrorReturn;
    visible: boolean;
    caption: string;
    textButtonCancel: string;
    textButtonApply: string;
    placeholder?: string;
    inactiveEntryKeys?: string[];
    warningMessage?: React.ReactNode;
    confirmButtonView?: ButtonView;
}

interface EntryDialogBaseDefaultProps {
    name: string;
    defaultName: string;
    path: string;
    withInput: boolean;
    confirmButtonView: ButtonView;
}

export interface EntryDialogBaseProps<T>
    extends EntryDialogBaseGeneralProps<T>,
        Partial<EntryDialogBaseDefaultProps> {}

type EntryDialogBaseInnerProps<T> = EntryDialogBaseGeneralProps<T> & EntryDialogBaseDefaultProps;

interface EntryDialogBaseState {
    name: string;
    path: string;
    progress: boolean;
    visible: boolean;
    inputError: PathSelectProps['inputError'];
}

const i18n = I18n.keyset('validation');

export class EntryDialogBase<T> extends React.Component<
    EntryDialogBaseInnerProps<T>,
    EntryDialogBaseState
> {
    static defaultProps: EntryDialogBaseDefaultProps = {
        name: '',
        defaultName: '',
        path: '/',
        withInput: true,
        confirmButtonView: 'action',
    };

    static getDerivedStateFromProps<T>(
        props: EntryDialogBaseInnerProps<T>,
        state: EntryDialogBaseState,
    ) {
        if (props.visible !== state.visible) {
            return {
                visible: props.visible,
                name: props.name,
                path: props.path,
                progress: false,
            };
        }
        return null;
    }

    state: EntryDialogBaseState = {
        visible: this.props.visible,
        name: this.props.name,
        path: this.props.path,
        progress: false,
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
        }
    }

    componentWillUnmount() {
        this.isUnmounted = true;
    }

    render() {
        const {
            caption,
            withInput,
            visible,
            placeholder,
            textButtonApply,
            textButtonCancel,
            inactiveEntryKeys,
            children,
            warningMessage,
            confirmButtonView,
        } = this.props;

        return (
            <Dialog size="s" open={visible} onClose={this.onClose} onEnterKeyDown={this.onApply}>
                <Dialog.Header caption={caption} />
                <Dialog.Body>
                    <div data-qa={EntryDialogQA.Content}>
                        {children ? (
                            children
                        ) : (
                            <PathSelect
                                size="l"
                                defaultPath={this.state.path}
                                withInput={withInput}
                                onChoosePath={this.onChoosePath}
                                inputRef={this.textInputRef}
                                inputValue={this.state.name}
                                inputError={this.state.inputError}
                                onChangeInput={this.onChangeInput}
                                placeholder={placeholder}
                                inactiveEntryKeys={inactiveEntryKeys}
                            />
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
                    propsButtonApply={{qa: EntryDialogQA.Apply, view: confirmButtonView}}
                    textButtonApply={textButtonApply}
                    textButtonCancel={textButtonCancel}
                    loading={this.state.progress}
                />
            </Dialog>
        );
    }

    private onApply = async () => {
        this.setState({progress: true});
        const {name: stateName} = this.state;
        const path = normalizeDestination(this.state.path);
        const name = (stateName === '' ? this.props.defaultName : stateName).trim();
        let key = path;
        if (this.props.withInput) {
            key = path === '/' ? name : path + name;
        }

        if (name.includes('/')) {
            const errorMsg = i18n('label_validation-slash_error');

            logger.logError('EntryDialogBase: onApply failed', {
                name: 'Validation error',
                message: errorMsg,
            });

            this.setState({progress: false, inputError: errorMsg});

            return;
        }

        try {
            const data = await this.props.onApply(
                key,
                name,
                name === '' ? path : Utils.getPathBefore({path: key}),
            );
            this.props.onSuccess(data);
            if (this.isUnmounted) {
                return;
            }
            this.setState({progress: false});
        } catch (error) {
            logger.logError('EntryDialogBase: onApply failed', error);
            const errorReturn = this.props.onError(error);
            const inputError = errorReturn?.inputError || false;
            if (this.isUnmounted) {
                return;
            }
            this.setState({progress: false, inputError});
        }
    };

    private onClose = () => {
        if (this.state.progress) {
            return;
        }
        this.props.onClose();
    };

    private onChoosePath = (value: string) => {
        this.setState({path: normalizeDestination(value), inputError: false});
        if (!this.isUnmounted) {
            this.textInputRef.current?.focus();
        }
    };

    private onChangeInput = (value: string) => {
        this.setState({name: value, inputError: false});
    };
}
