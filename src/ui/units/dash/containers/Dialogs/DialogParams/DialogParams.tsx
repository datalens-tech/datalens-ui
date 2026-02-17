import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';

import {ParamsSettings} from '../../../components/ParamsSettings/ParamsSettings';
import type {ParamsSettingData} from '../../../components/ParamsSettings/types';

import './DialogParams.scss';

const b = block('dialog-params');

export type DialogParamsProps = {
    visible: boolean;
    onClose: () => void;
    paramsData: ParamsSettingData;
    isParamsError: boolean;
    onEditParamTitle: (paramTitleOld: string, paramTitle: string) => void;
    onEditParamValue: (paramTitle: string, paramValue: string[]) => void;
    onRemoveParam: (paramTitle: string) => void;
    onRemoveAllParams: () => void;
    validateParamTitle: (paramTitle: string) => Error | null;
    onSave: () => void;
};

export const DialogParams = ({
    visible,
    onClose,
    paramsData,
    isParamsError,
    onEditParamTitle,
    onEditParamValue,
    onRemoveParam,
    onRemoveAllParams,
    validateParamTitle,
    onSave,
}: DialogParamsProps) => {
    return (
        <Dialog
            className={b()}
            open={visible}
            onClose={onClose}
            disableEscapeKeyDown={true}
            disableHeightTransition={true}
        >
            <Dialog.Header caption={i18n('dash.settings-dialog.edit', 'label_global-params')} />
            <Dialog.Body className={b('body')}>
                {visible && (
                    <ParamsSettings
                        tagLabelClassName={b('tag')}
                        data={paramsData}
                        validator={{title: validateParamTitle}}
                        onEditParamTitle={onEditParamTitle}
                        onEditParamValue={onEditParamValue}
                        onRemoveParam={onRemoveParam}
                        onRemoveAllParams={onRemoveAllParams}
                    />
                )}
            </Dialog.Body>
            <Dialog.Footer
                textButtonApply={i18n('dash.settings-dialog.edit', 'button_save')}
                onClickButtonApply={onSave}
                textButtonCancel={i18n('dash.settings-dialog.edit', 'button_cancel')}
                onClickButtonCancel={onClose}
                propsButtonApply={{
                    disabled: isParamsError,
                }}
            />
        </Dialog>
    );
};
