import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Button, Icon, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';

import type {QlConfigParam} from '../../../../../../../shared';
import {QLParamType, TabParamsQA} from '../../../../../../../shared';
import {getDatesFromValue} from '../../../../../../components/RelativeDatesPicker/utils';

import {resolveAndFormatDate, valueIsValidIntervalValue} from './utils';

const b = block('ql-tab-params');

interface DefaultValueProps {
    param: QlConfigParam;
    paramIndex: number;
    onClickButtonEditParamValue: ({
        value,
        type,
        onApply,
    }: {
        value: string;
        type: QLParamType;
        onApply: ({value}: {value: string}) => void;
    }) => void;
    onEditParam: ({param, paramIndex}: {param: QlConfigParam; paramIndex: number}) => void;
    onClickButtonAddParamValue: ({paramIndex}: {paramIndex: number}) => void;
    onClickButtonRemoveParamValue: ({
        paramIndex,
        valueIndex,
    }: {
        paramIndex: number;
        valueIndex: number;
    }) => void;
}

export const DefaultValue = ({
    param,
    paramIndex,
    onClickButtonEditParamValue,
    onEditParam,
    onClickButtonAddParamValue,
    onClickButtonRemoveParamValue,
}: DefaultValueProps) => {
    const paramIsInterval =
        param.type === QLParamType.DateInterval || param.type === QLParamType.DatetimeInterval;

    const paramIsDate = param.type === QLParamType.Date || param.type === QLParamType.Datetime;

    if (paramIsInterval && valueIsValidIntervalValue(param.defaultValue)) {
        const formattedFrom = resolveAndFormatDate(
            param.defaultValue.from,
            param.type as QLParamType,
        );

        const formattedTo = resolveAndFormatDate(param.defaultValue.to, param.type as QLParamType);

        const preparedValue = `__interval_${param.defaultValue.from}_${param.defaultValue.to}`;

        return (
            <Button
                view="outlined"
                size="m"
                onClick={() => {
                    onClickButtonEditParamValue({
                        value: preparedValue,
                        type: param.type as QLParamType,
                        onApply: ({value}) => {
                            const [fromDate, toDate] = getDatesFromValue(value);

                            if (fromDate && toDate) {
                                const updatedParam = {...param};

                                updatedParam.defaultValue = {
                                    from: fromDate,
                                    to: toDate,
                                };

                                onEditParam({param: updatedParam, paramIndex});
                            }
                        },
                    });
                }}
                key="button-open-param-dialog"
                className={b('default-value-text')}
                qa={TabParamsQA.OpenParamDialogBtn}
            >
                {param.defaultValue
                    ? `${formattedFrom} — ${formattedTo}`
                    : i18n('sql', 'label_placeholder-default-value')}
            </Button>
        );
    } else if (paramIsDate && typeof param.defaultValue === 'string') {
        const formattedDate = resolveAndFormatDate(param.defaultValue, param.type as QLParamType);

        return (
            <Button
                view="outlined"
                size="m"
                onClick={() => {
                    onClickButtonEditParamValue({
                        value: param.defaultValue as string,
                        type: param.type as QLParamType,
                        onApply: ({value}) => {
                            const newParam = {...param};

                            if (value !== null) {
                                newParam.defaultValue = value;
                            }

                            onEditParam({param: newParam, paramIndex});
                        },
                    });
                }}
                key="button-add-param-value"
                className={b('default-value-text')}
                qa={TabParamsQA.OpenParamDialogBtn}
            >
                {param.defaultValue
                    ? formattedDate
                    : i18n('sql', 'label_placeholder-default-value')}
            </Button>
        );
    } else if (typeof param.defaultValue === 'string') {
        return (
            <div className={b('default-value-array')}>
                <div key={`default-value-0`}>
                    <TextInput
                        className={b('default-value-text')}
                        placeholder={i18n('sql', 'label_placeholder-default-value')}
                        value={param.defaultValue}
                        onUpdate={(defaultValue) => {
                            const newParam = {...param};

                            newParam.defaultValue = defaultValue;

                            onEditParam({param: newParam, paramIndex});
                        }}
                        autoFocus={true}
                    />
                </div>
                <div className={b('default-value-add', 'initial')}>
                    <Button
                        view="normal-contrast"
                        size="s"
                        onClick={() => onClickButtonAddParamValue({paramIndex})}
                        key="button-add-param-value"
                        className={b('default-value-add-btn')}
                    >
                        {i18n('sql', 'button_add-param-value')}
                    </Button>
                </div>
            </div>
        );
    } else if (Array.isArray(param.defaultValue)) {
        return (
            <div className={b('default-value-array')}>
                {param.defaultValue.map((defaultValue, i) => (
                    <div
                        key={`default-value-${i}`}
                        className={b('default-value-entry', {'not-first': i > 0})}
                    >
                        <TextInput
                            className={b('default-value-text', {'not-first': i > 0})}
                            placeholder={i18n('sql', 'label_placeholder-default-value')}
                            value={defaultValue}
                            onUpdate={(newDefaultValue) => {
                                const newParam = {...param};

                                newParam.defaultValue = (param.defaultValue as string[]).map(
                                    (item, index) => (i === index ? newDefaultValue : item),
                                );

                                onEditParam({param: newParam, paramIndex});
                            }}
                            autoFocus={true}
                        />
                        <Button
                            view="flat-secondary"
                            size="m"
                            onClick={() =>
                                onClickButtonRemoveParamValue({
                                    paramIndex,
                                    valueIndex: i,
                                })
                            }
                            key="button-remove-param-value"
                            className={b('remove-param-value-btn')}
                            title={i18n('sql', 'label_delete-param-value')}
                        >
                            <Icon data={Xmark} />
                        </Button>
                    </div>
                ))}
                <div className={b('default-value-add')}>
                    <Button
                        view="normal-contrast"
                        size="s"
                        onClick={() => onClickButtonAddParamValue({paramIndex})}
                        key="button-add-param-value"
                        className={b('default-value-add-btn')}
                    >
                        {i18n('sql', 'button_add-param-value')}
                    </Button>
                </div>
            </div>
        );
    } else {
        return null;
    }
};
