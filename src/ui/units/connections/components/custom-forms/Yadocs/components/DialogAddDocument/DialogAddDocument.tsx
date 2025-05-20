import React from 'react';

import {Alert, Dialog, HelpMark, Link, RadioButton, TextInput} from '@gravity-ui/uikit';
import type {AlertProps, ButtonProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import uniqId from 'lodash/uniqueId';
import {ConnectorType} from 'shared';
import {Interpolate} from 'ui/components/Interpolate';
import {registry} from 'ui/registry';

import DialogManager from '../../../../../../../components/DialogManager/DialogManager';
import {DL} from '../../../../../../../constants';
import type {DataLensApiError} from '../../../../../../../typings';

import './DialogAddDocument.scss';

const b = block('conn-form-yadocs');
const i18n = I18n.keyset('connections.yadocs.view');
const FILE_MODE = {
    PUBLIC: 'public',
    PRIVATE: 'private',
};

type DataWithError<T> = T & {error?: DataLensApiError};

type DialogAddYadocProps<T> = {
    authorized?: boolean;
    caption?: string;
    onApply: (args: {publicLink?: string; privatePath?: string}) => Promise<DataWithError<T>>;
    onClose: () => void;
    onError: (error: DataLensApiError) => void;
    onSuccess: (data: T) => void;
    onLogin: (oauthToken: string) => void;
};

export const DIALOG_CONN_ADD_YADOC = Symbol('DIALOG_CONN_ADD_YADOC');

export type OpenDialogConnAddYadocArgs<T = unknown> = {
    id: typeof DIALOG_CONN_ADD_YADOC;
    props: DialogAddYadocProps<T>;
};

const PrivateFileAlert = (props: {onLogin: (oauthToken: string) => void; authorized?: boolean}) => {
    const {authorized, onLogin} = props;
    const {OAuthTokenButton} = registry.common.components.getAll();
    let action: AlertProps['actions'] = null;
    let icon: AlertProps['icon'];
    const theme: AlertProps['theme'] = authorized ? 'info' : 'normal';
    const message = authorized
        ? i18n('label_alert-authorized')
        : i18n('label_alert-not-authorized');

    if (authorized) {
        // TODO: change to null after https://github.com/gravity-ui/uikit/issues/1384
        icon = <Alert.Icon theme="normal" />;
    } else {
        action = (
            <OAuthTokenButton
                application={ConnectorType.Yadocs}
                text={i18n('button_auth-dialog')}
                view="normal-contrast"
                style={{margin: 'auto 0'}}
                onTokenChange={onLogin}
            />
        );
    }

    return (
        <Alert layout="horizontal" theme={theme} message={message} actions={action} icon={icon} />
    );
};

const DialogAddYadoc = <T extends unknown>(props: DialogAddYadocProps<T>) => {
    const {authorized, caption, onApply, onClose, onError, onSuccess, onLogin} = props;
    const docsEndpoint = DL.ENDPOINTS.datalensDocs;
    const mounted = React.useRef(false);
    const [value, setValue] = React.useState('');
    const [mode, setMode] = React.useState(FILE_MODE.PUBLIC);
    const [loading, setLoading] = React.useState(false);
    const propsButtonApply: Partial<ButtonProps> = {disabled: !value, loading};
    const applyDisabled = !value || loading;
    const inputLabel = mode === 'private' ? i18n('label_private-path') : i18n('label_public-path');
    const inputHelp =
        mode === 'private'
            ? i18n('label_add-input-private-help')
            : i18n('label_add-input-public-help');
    const inputNote =
        mode === 'private'
            ? i18n('label_add-input-private-note')
            : i18n('label_add-input-public-note');
    const addFileId = uniqId('add-file');

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
        <Dialog open={true} onClose={onClose} size="s" onEnterKeyDown={handleApply}>
            <Dialog.Header caption={caption || i18n('label_add-file')} />
            <Dialog.Body className={b('add-dialog-body')}>
                <div className={b('add-dialog-row')}>
                    <label>{i18n('label_access-type')}</label>
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
                {mode === FILE_MODE.PRIVATE && (
                    <div className={b('add-dialog-row')}>
                        <PrivateFileAlert authorized={authorized} onLogin={onLogin} />
                    </div>
                )}
                <div className={b('add-dialog-row')}>
                    <label htmlFor={addFileId}>
                        <Interpolate
                            text={inputLabel}
                            matches={{
                                link: (match) => (
                                    <Link
                                        href="https://docs.yandex.ru/docs?type=xlsx"
                                        target="_blank"
                                    >
                                        {match}
                                    </Link>
                                ),
                            }}
                        />
                        <HelpMark
                            className={b('add-help-btn')}
                            popoverProps={{
                                content: (
                                    <Interpolate
                                        text={inputHelp}
                                        matches={{
                                            code: (match) => (
                                                <code
                                                    style={{
                                                        color: 'var(--g-color-text-misc)',
                                                        backgroundColor:
                                                            'var(--g-color-base-misc-light)',
                                                        lineHeight: '16px',
                                                        borderRadius: '4px',
                                                        padding: '1px 4px',
                                                    }}
                                                >
                                                    {match}
                                                </code>
                                            ),
                                            link: (match) => (
                                                <Link
                                                    href={`${docsEndpoint}/operations/connection/create-yadocs`}
                                                    target="_blank"
                                                >
                                                    {match}
                                                </Link>
                                            ),
                                        }}
                                    />
                                ),
                            }}
                        />
                    </label>
                    <TextInput
                        value={value}
                        id={addFileId}
                        autoFocus={true}
                        disabled={loading}
                        onUpdate={handleInputUpdate}
                    />
                    <div className={b('add-dialog-row-input-note')}>{inputNote}</div>
                </div>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                onClickButtonApply={handleApply}
                textButtonApply={i18n('button_add')}
                textButtonCancel={i18n('button_cancel')}
                propsButtonApply={propsButtonApply}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_CONN_ADD_YADOC, DialogAddYadoc);
