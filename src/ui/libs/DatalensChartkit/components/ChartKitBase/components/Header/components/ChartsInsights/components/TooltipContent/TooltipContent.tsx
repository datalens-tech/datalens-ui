import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {isEmpty} from 'lodash';
import type {ChartsInsightsItem} from 'shared';

import {ChartsInsightsIcon} from '../ChartsInsightsIcon/ChartsInsightsIcon';

import './TooltipContent.scss';

const b = block('chartkit-charts-insights');

type TooltipContentProps = {
    items: ChartsInsightsItem[];
    messages: Record<string, {result: string}>;
    onButtonClick: (locator: string) => void;
};

export const TooltipContent = ({items, messages, onButtonClick}: TooltipContentProps) => {
    if (isEmpty(messages)) {
        return null;
    }

    return (
        <div className={b()}>
            {items.map((item) => {
                return (
                    <div key={item.locator} className={b('tooltip')}>
                        <div className={b('tooltip-title')}>
                            <div className={b('tooltip-icon')}>
                                <ChartsInsightsIcon level={item.level} />
                            </div>
                            {item.title}
                        </div>
                        {messages[item.locator] && (
                            <div
                                className={b('tooltip-message')}
                                dangerouslySetInnerHTML={{__html: messages[item.locator].result}}
                            />
                        )}
                        <Button
                            className={b('tooltip-button')}
                            onClick={() => onButtonClick(item.locator)}
                        >
                            {i18n('chartkit.insights', 'ok')}
                        </Button>
                    </div>
                );
            })}
        </div>
    );
};
