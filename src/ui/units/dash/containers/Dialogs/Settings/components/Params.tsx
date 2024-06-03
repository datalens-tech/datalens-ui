import React from 'react';

import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {DashSettingsGlobalParams, StringParams} from 'shared';
import {ParamsSettingsQA} from 'shared';

import {Collapse} from '../../../../../../components/Collapse/Collapse';
import {SectionWrapper} from '../../../../../../components/SectionWrapper/SectionWrapper';
import {ParamsSettings} from '../../../../components/ParamsSettings/ParamsSettings';
import {
    clearEmptyParams,
    removeParam,
    updateParamTitle,
    updateParamValue,
    validateParamTitle,
} from '../../../../components/ParamsSettings/helpers';

import {Title} from './Title';

import '../Settings.scss';

const b = block('dialog-settings');

type ParamsProps = {
    paramsValue?: StringParams;
    onChangeParamsValue: (params: DashSettingsGlobalParams) => void;
};

export const Params = ({paramsValue, onChangeParamsValue}: ParamsProps) => {
    const localParams = React.useMemo(() => clearEmptyParams(paramsValue), [paramsValue]);

    const handleEditParamTitle = React.useCallback(
        (paramTitleOld, paramTitle) => {
            onChangeParamsValue(updateParamTitle(localParams, paramTitleOld, paramTitle));
        },
        [localParams, onChangeParamsValue],
    );

    const handleEditParamValue = React.useCallback(
        (paramTitle, paramValue) => {
            onChangeParamsValue(updateParamValue(localParams, paramTitle, paramValue));
        },
        [localParams, onChangeParamsValue],
    );

    const handleRemoveParam = React.useCallback(
        (paramTitle) => {
            onChangeParamsValue(removeParam(localParams, paramTitle));
        },
        [localParams, onChangeParamsValue],
    );

    const handleRemoveAllParams = React.useCallback(() => {
        onChangeParamsValue({});
    }, [onChangeParamsValue]);

    const handleValidateParamTitle = React.useCallback((paramTitle: string) => {
        const errorCode = validateParamTitle(paramTitle);

        if (errorCode) {
            return new Error(i18n('dash.params-button-dialog.view', `context_${errorCode}`));
        }

        return null;
    }, []);

    return (
        <SectionWrapper>
            <Collapse
                title={
                    <Title
                        text={i18n('dash.settings-dialog.edit', 'label_global-params')}
                        titleMods="strong"
                    />
                }
                arrowPosition="left"
                arrowQa={ParamsSettingsQA.Open}
            >
                <div className={b('params')}>
                    <ParamsSettings
                        tagLabelClassName={b('params-tag')}
                        data={localParams}
                        validator={{title: handleValidateParamTitle}}
                        onEditParamTitle={handleEditParamTitle}
                        onEditParamValue={handleEditParamValue}
                        onRemoveParam={handleRemoveParam}
                        onRemoveAllParams={handleRemoveAllParams}
                    />
                </div>
            </Collapse>
        </SectionWrapper>
    );
};
