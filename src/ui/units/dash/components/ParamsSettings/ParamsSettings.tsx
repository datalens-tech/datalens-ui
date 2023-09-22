import React from 'react';

import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {ParamsSettingsQA} from 'shared';

import {ParamsRow} from './ParamsRow';
import type {ParamsSettingData, ParamsSettingsProps} from './types';

import iconAdd from '@gravity-ui/icons/svgs/plus.svg';
import iconDelete from '@gravity-ui/icons/svgs/trash-bin.svg';

import './ParamsSettings.scss';

const b = block('params-settings');
const i18n = I18n.keyset('dash.params-setting.view');

const getInitParamTitleOrder = (data: ParamsSettingData) => {
    const titleOrder: string[] = Object.keys(data).filter((title) => title !== '');

    if (titleOrder.length < 1) {
        titleOrder.push('');
    }
    return titleOrder;
};

export function ParamsSettings({
    tagLabelClassName,
    data,
    group,
    validator,
    onRemoveParam,
    onRemoveAllParams,
    onEditParamTitle,
    onEditParamValue,
}: ParamsSettingsProps) {
    const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);
    const [paramsTitleOrder, setParamsTitleOrder] = React.useState<string[]>([]);

    const handleBlurRow = React.useCallback(() => setFocusedIndex(null), []);

    const handleEditTitle = React.useCallback(
        (orderIndex: number, newTitle: string) => {
            const trimmedTitle = newTitle.trim();

            if (trimmedTitle !== '' && paramsTitleOrder.includes(trimmedTitle)) {
                // param with title already exist, ignore changes
                return false;
            }

            let oldTitle = '';
            const newTitleOrder = paramsTitleOrder.map((title, index) => {
                if (index === orderIndex) {
                    oldTitle = title;
                    return trimmedTitle;
                }
                return title;
            });

            setParamsTitleOrder(newTitleOrder);
            if (trimmedTitle === '') {
                onRemoveParam(oldTitle);
            } else {
                onEditParamTitle(oldTitle, trimmedTitle);
            }
            return true;
        },
        [paramsTitleOrder, setParamsTitleOrder, onEditParamTitle, onRemoveParam],
    );

    const handleAddRow = React.useCallback(() => {
        const firstEmptyIndex = paramsTitleOrder.findIndex((title) => title === '');

        if (firstEmptyIndex > -1) {
            setFocusedIndex(firstEmptyIndex);
        } else {
            setParamsTitleOrder([...paramsTitleOrder, '']);
            setFocusedIndex(paramsTitleOrder.length);
        }
    }, [paramsTitleOrder, setParamsTitleOrder]);

    const handleRemoveRow = React.useCallback(
        (index: number) => {
            const removedTitle = paramsTitleOrder[index];

            const newParamsTitleOrder = [...paramsTitleOrder];
            newParamsTitleOrder.splice(index, 1);
            if (newParamsTitleOrder.length < 1) {
                newParamsTitleOrder.push('');
            }

            setParamsTitleOrder(newParamsTitleOrder);
            onRemoveParam(removedTitle);
        },
        [paramsTitleOrder, onRemoveParam],
    );

    const handleRemoveAll = React.useCallback(() => {
        onRemoveAllParams();
        setParamsTitleOrder(getInitParamTitleOrder({}));
    }, [onRemoveAllParams]);

    React.useEffect(() => {
        setParamsTitleOrder(getInitParamTitleOrder(data));
    }, [group]);

    const content = paramsTitleOrder.map((paramTitle, index) => (
        <ParamsRow
            tagLabelClassName={tagLabelClassName}
            paramTitle={paramTitle}
            paramValue={data[paramTitle]}
            key={`params-row-${index}`}
            index={index}
            focused={index === focusedIndex}
            validator={validator}
            onRemove={() => handleRemoveRow(index)}
            onEditTitle={(title) => handleEditTitle(index, title)}
            onEditValue={onEditParamValue}
            onBlur={handleBlurRow}
        />
    ));

    return (
        <div className={b()} data-qa={ParamsSettingsQA.Settings}>
            <div className={b('row', 'top')}>
                <div className={b('left', 'top')}>{i18n('label_name')}</div>
                <div className={b('center', 'top')}>{i18n('label_value')}</div>
                <div className={b('right', 'top')} />
            </div>
            {content}
            <div className={b('controls')}>
                <Button
                    view="flat-secondary"
                    onClick={handleAddRow}
                    className={b('button-add')}
                    qa={ParamsSettingsQA.Add}
                >
                    <Icon data={iconAdd} size={16} className={b('icon-add')} />
                    {i18n('button_add-param')}
                </Button>
                <Button
                    view="flat-danger"
                    onClick={handleRemoveAll}
                    className={b('button-remove-all')}
                    qa={ParamsSettingsQA.RemoveAll}
                >
                    <Icon data={iconDelete} size={16} className={b('icon-remove')} />
                    {i18n('button_remove-all')}
                </Button>
            </div>
        </div>
    );
}
