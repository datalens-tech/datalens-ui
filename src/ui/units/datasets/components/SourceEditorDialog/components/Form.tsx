import React from 'react';

import block from 'bem-cn-lite';
import _get from 'lodash/get';
import {Feature} from 'shared';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {FormValidationError} from '../../../helpers/validation';
import type {FreeformSource} from '../../../store/types';
import type {EditedSource, OnSourceUpdate} from '../types';
import {TITLE_INPUT, getErrorText} from '../utils';

import {EditorFormItem} from './EditorFormItem';
import {InputFormItem} from './InputFormItem';
import type {RenderParamSelector} from './ParamSelector';
import {SelectFormItem} from './SelectFormItem';

const b = block('source-editor-dialog');

type FormProps = {
    onUpdate: OnSourceUpdate;
    freeformSource: FreeformSource;
    source: EditedSource;
    validationErrors: FormValidationError[];
    renderParamSelector: RenderParamSelector;
};

const getFormItemValue = (opt: {
    source: EditedSource;
    freeformSource: FreeformSource;
    key: string;
}) => {
    const {source, freeformSource, key} = opt;

    if (key === TITLE_INPUT) {
        return source.title || freeformSource.title;
    } else {
        const defaultValue = freeformSource.form.find(({name}) => name === key)?.default;
        const value = source.parameters[key];
        return typeof value === 'string' ? value : defaultValue;
    }
};

export const Form: React.FC<FormProps> = ({
    onUpdate,
    freeformSource,
    source,
    validationErrors,
    renderParamSelector,
}) => {
    // TODO: remove after BI-6211
    const isTemplateParamsFeatureEnabled = isEnabledFeature(Feature.EnableDsTemplateParams);
    const formItems = React.useMemo(() => {
        return freeformSource.form.map((formOptions) => {
            const key = formOptions.name;
            const value = getFormItemValue({source, freeformSource, key});
            const errorText = getErrorText(validationErrors, key);

            switch (formOptions.input_type) {
                case 'text':
                case 'textarea': {
                    return (
                        <InputFormItem
                            qa="source-editor-path"
                            key={key}
                            value={value}
                            sourceType={source.source_type}
                            error={errorText}
                            onUpdate={onUpdate}
                            // TODO: we should set renderParamSelector in case of:
                            // - dataset.template_enabled === true (after BI-6211)
                            // - formOptions.template_enabled === true (after BI-6190)
                            renderParamSelector={
                                isTemplateParamsFeatureEnabled ? renderParamSelector : undefined
                            }
                            {...formOptions}
                        />
                    );
                }
                case 'select': {
                    return (
                        <SelectFormItem
                            key={key}
                            value={value}
                            error={errorText}
                            onUpdate={onUpdate}
                            {...formOptions}
                        />
                    );
                }
                case 'sql': {
                    return (
                        <EditorFormItem
                            key={key}
                            value={value}
                            error={errorText}
                            onUpdate={onUpdate}
                            // TODO: we should set renderParamSelector in case of:
                            // - dataset.template_enabled === true (after BI-6211)
                            // - formOptions.template_enabled === true (after BI-6190)
                            renderParamSelector={
                                isTemplateParamsFeatureEnabled ? renderParamSelector : undefined
                            }
                            {...formOptions}
                        />
                    );
                }
                default: {
                    return null;
                }
            }
        });
    }, [
        onUpdate,
        renderParamSelector,
        freeformSource,
        source,
        validationErrors,
        isTemplateParamsFeatureEnabled,
    ]);

    return <div className={b('params')}>{formItems}</div>;
};
