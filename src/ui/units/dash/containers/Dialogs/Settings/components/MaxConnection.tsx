import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import type {SelectProps} from '@gravity-ui/uikit';
import {Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';

import {Row} from './Row';
import {Title} from './Title';

const b = block('dialog-settings');

const MAX_CONCURRENT_REQUESTS = 6;

type MaxConnectionProps = {
    maxValue: number;
    onUpdate: SelectProps['onUpdate'];
};

export const MaxConnection = ({maxValue, onUpdate}: MaxConnectionProps) => {
    const getMaxConnectionItems = () => {
        const items = [
            {
                content: i18n(
                    'dash.settings-dialog.edit',
                    'label_max-concurrent-requests-placeholder',
                ),
                value: '-1',
            },
        ];
        for (let i = 1; i <= MAX_CONCURRENT_REQUESTS; i++) {
            items.push({content: String(i), value: String(i)});
        }

        return items;
    };

    return (
        <Row alignTop={true}>
            <Title text={i18n('dash.settings-dialog.edit', 'label_max-concurrent-requests')}>
                <HelpPopover
                    htmlContent={i18n(
                        'dash.settings-dialog.edit',
                        'context_max-concurrent-requests-hint',
                    )}
                />
            </Title>
            <div>
                <div className={b('sub-row')}>
                    <Select
                        width="max"
                        value={[String(maxValue)]}
                        options={getMaxConnectionItems()}
                        onUpdate={onUpdate}
                    />
                </div>
            </div>
        </Row>
    );
};
