import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import {ArrowUpRightFromSquare} from '@gravity-ui/icons';
import {Dialog, Icon, Link, RadioButton, TextInput} from '@gravity-ui/uikit';
import type {ButtonProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Interpolate} from 'ui/components/Interpolate';

import DialogManager from '../../../../../../../components/DialogManager/DialogManager';
import {DataLensApiError} from '../../../../../../../typings';

import './DialogAddDocument.scss';

const b = block('conn-form-yadocs');
const i18n = I18n.keyset('connections.yadocs.view');
const FILE_MODE = {
    PUBLIC: 'public',
    PRIVATE: 'private',
};

type DataWithError<T> = T & {error?: DataLensApiError};

type DialogAddYadocProps<T> = {
    caption?: string;
    onApply: (args: {publicLink?: string; privatePath?: string}) => Promise<DataWithError<T>>;
    onClose: () => void;
    onError: (error: DataLensApiError) => void;
    onSuccess: (data: T) => void;
};

export const DIALOG_CONN_ADD_YADOC = Symbol('DIALOG_CONN_ADD_YADOC');

export type OpenDialogConnAddYadocArgs<T = unknown> = {
    id: typeof DIALOG_CONN_ADD_YADOC;
    props: DialogAddYadocProps<T>;
};

const DialogAddYadoc = <T extends unknown>(props: DialogAddYadocProps<T>) => {
    const {caption, onApply, onClose, onError, onSuccess} = props;
    const mounted = React.useRef(false);
    const [value, setValue] = React.useState('');
    const [mode, setMode] = React.useState(FILE_MODE.PUBLIC);
    const [loading, setLoading] = React.useState(false);
    const propsButtonApply: Partial<ButtonProps> = {disabled: !value, loading};
    const applyDisabled = !value || loading;
    const inputLabel =
        mode === 'private' ? i18n('label_add-input-private') : i18n('label_add-input-public');
    const inputNote =
        mode === 'private'
            ? i18n('label_add-input-private-note')
            : i18n('label_add-input-public-note');

    const handleInputUpdate = (nextPath: string) => {
        setValue(nextPath);
    };

    const handleRadioButtonUpdate = (nextMode: string) => {
        setMode(nextMode);
    };

    const handleApply = async () => {
        if (applyDisabled) {
            return;
        }

        setLoading(true);
        const data = await onApply(
            mode === FILE_MODE.PRIVATE ? {privatePath: value} : {publicLink: value},
        );

        if (!mounted.current) {
            return;
        }

        setLoading(false);

        if (data.error) {
            onError?.(data.error);
        } else {
            onSuccess?.(data);
        }
    };

    React.useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;
        };
    }, []);

    return (
        <Dialog open={true} onClose={onClose} size="m" onEnterKeyDown={handleApply}>
            <Dialog.Header caption={caption || i18n('label_add-document')} />
            <Dialog.Body className={b('add-dialog-body')}>
                <div className={b('add-dialog-row')}>
                    <label className={b('add-dialog-row-label')}>{i18n('label_access-type')}</label>
                    <RadioButton
                        style={{width: 'fit-content'}}
                        value={mode}
                        onUpdate={handleRadioButtonUpdate}
                    >
                        <RadioButton.Option value={FILE_MODE.PUBLIC}>
                            {i18n('label_radio-value-public')}
                        </RadioButton.Option>
                        <RadioButton.Option value={FILE_MODE.PRIVATE}>
                            {i18n('label_radio-value-private')}
                        </RadioButton.Option>
                    </RadioButton>
                </div>
                <div className={b('add-dialog-row')}>
                    <label className={b('add-dialog-row-label')}>
                        {inputLabel}
                        <HelpPopover
                            className={b('help-btn')}
                            content={i18n('label_add-input-help')}
                        />
                    </label>
                    <div>
                        <TextInput
                            value={value}
                            autoFocus={true}
                            disabled={loading}
                            onUpdate={handleInputUpdate}
                        />
                        <div className={b('add-dialog-row-input-note')}>
                            {inputNote}
                            <br />
                            <Interpolate
                                text={i18n('label_add-input-link')}
                                matches={{
                                    link: (match) => (
                                        <React.Fragment>
                                            <Link href="https://docs.yandex.ru" target="_blank">
                                                {match}
                                                <Icon data={ArrowUpRightFromSquare} />
                                            </Link>
                                        </React.Fragment>
                                    ),
                                }}
                            />
                            <br />
                        </div>
                    </div>
                </div>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                onClickButtonApply={handleApply}
                textButtonApply={i18n('button_apply')}
                textButtonCancel={i18n('button_cancel')}
                propsButtonApply={propsButtonApply}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_CONN_ADD_YADOC, DialogAddYadoc);
