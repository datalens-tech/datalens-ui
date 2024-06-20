import React from 'react';

import {ActionTooltip, Button, Icon} from '@gravity-ui/uikit';

import type {AdditionalButtonTemplate} from './types';

type UseAdditionalItemsArgs = {
    items: AdditionalButtonTemplate[] | undefined;
};

const renderItemButton = (itemProps: AdditionalButtonTemplate) => {
    return (
        <Button
            disabled={itemProps.disabled || false}
            qa={itemProps.qa}
            key={itemProps.key}
            className={itemProps.className}
            view={itemProps.view || 'flat'}
            size="m"
            loading={itemProps.loading}
            onClick={() => itemProps.action()}
        >
            {itemProps.icon && <Icon {...itemProps.icon} />}
            {itemProps.text && <span className={itemProps.textClassName}>{itemProps.text}</span>}
        </Button>
    );
};

export const useAdditionalItems = (args: UseAdditionalItemsArgs) => {
    const {items} = args;

    if (!items) {
        return [];
    }

    return items
        .map((itemProps) => {
            if (itemProps.hidden) {
                return null;
            }

            if (itemProps.title) {
                return (
                    <ActionTooltip
                        hotkey={itemProps.hotkey}
                        title={itemProps.title}
                        key={`${itemProps.key}-tooltip`}
                    >
                        {renderItemButton(itemProps)}
                    </ActionTooltip>
                );
            } else {
                return renderItemButton(itemProps);
            }
        })
        .filter(Boolean);
};
