import React from 'react';

import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {ParamsSettingsQA} from 'shared';

import {Collapse} from '../../../../../../components/Collapse/Collapse';
import {SectionWrapper} from '../../../../../../components/SectionWrapper/SectionWrapper';
import {ParamsSettings} from '../../../../components/ParamsSettings/ParamsSettings';
import type {ParamsSettingData} from '../../../../components/ParamsSettings/types';

import {Title} from './Title';

import './Params.scss';

const b = block('dialog-settings-params');

type ParamsProps = {
    paramsData: ParamsSettingData;
    onEditParamTitle: (paramTitleOld: string, paramTitle: string) => void;
    onEditParamValue: (paramTitle: string, paramValue: string[]) => void;
    onRemoveParam: (paramTitle: string) => void;
    onRemoveAllParams: () => void;
    validateParamTitle: (paramTitle: string) => Error | null;
};

export const Params = ({
    paramsData,
    onEditParamTitle,
    onEditParamValue,
    onRemoveParam,
    onRemoveAllParams,
    validateParamTitle,
}: ParamsProps) => {
    return (
        <SectionWrapper className={b()}>
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
                <div className={b('content')}>
                    <ParamsSettings
                        tagLabelClassName={b('tag')}
                        data={paramsData}
                        validator={{title: validateParamTitle}}
                        onEditParamTitle={onEditParamTitle}
                        onEditParamValue={onEditParamValue}
                        onRemoveParam={onRemoveParam}
                        onRemoveAllParams={onRemoveAllParams}
                    />
                </div>
            </Collapse>
        </SectionWrapper>
    );
};
