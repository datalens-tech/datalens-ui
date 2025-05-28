import React from 'react';

import {Menu, Popup} from '@gravity-ui/uikit';
import type {MenuItemProps, PopupAnchorElement, PopupPlacement} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {ActionPanelEntryContextMenuQa} from 'shared/constants/qa/action-panel';
import type {GetEntryResponse} from 'shared/schema';

import type {EntryContextMenuItem, EntryContextMenuItems, WrapperParams} from '../helpers';

import './EntryContextMenuBase.scss';

const b = block('dl-entry-context-menu-base');
export const ICONS_ENTRY_MENU_DEFAULT_CLASSNAME = b('icon');
export const ICONS_ENTRY_MENU_DEFAULT_SIZE = 16;

const defaultPopupPlacement: PopupPlacement = ['left-start', 'left', 'left-end'];

// Base is used in navigation

type EntryContextMenuBaseItemProps = {
    icon?: React.ReactNode;
    text: string;
    action: EntryContextMenuItem['action'];
    entry?: GetEntryResponse;
    wrapper?: (args: WrapperParams) => JSX.Element;
    onClick: (action: EntryContextMenuBaseItemProps['action']) => void;
    qa?: string;
    theme?: MenuItemProps['theme'];
};

const EntryContextMenuBaseItem = (props: EntryContextMenuBaseItemProps) => {
    const {icon, text, action, entry, wrapper, onClick, theme, qa} = props;

    const handleClick = React.useCallback(() => {
        onClick(action);
    }, [onClick, action]);

    const node = (
        <Menu.Item
            qa={qa}
            onClick={handleClick}
            iconStart={icon}
            className={b('item', {danger: theme === 'danger'})}
            theme={theme}
        >
            {text}
        </Menu.Item>
    );
    return wrapper && entry ? wrapper({entry, children: node}) : node;
};

type EntryContextMenuBaseProps = {
    visible?: boolean;
    hasTail?: boolean;
    anchorElement?: PopupAnchorElement;
    items?: EntryContextMenuItems;
    popupPlacement?: PopupPlacement;
    entry?: GetEntryResponse;
    onMenuClick: (args: {entry?: GetEntryResponse; action: EntryContextMenuItem['action']}) => void;
    onClose: () => void;
};

export const EntryContextMenuBase = (props: EntryContextMenuBaseProps) => {
    const {
        visible,
        anchorElement,
        hasTail,
        entry,
        items = [],
        popupPlacement = defaultPopupPlacement,
        onClose,
        onMenuClick,
    } = props;

    const handleMenuClick = React.useCallback(
        (action: EntryContextMenuItem['action']) => {
            onClose();
            onMenuClick({entry, action});
        },
        [entry, onClose, onMenuClick],
    );

    return (
        <Popup
            hasArrow={hasTail}
            placement={popupPlacement}
            open={visible}
            anchorElement={anchorElement}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <Menu
                qa={ActionPanelEntryContextMenuQa.Menu}
                className={b('menu', 'data-qa-entry-context-menu')}
                size="l"
            >
                {items.map((row, index) => {
                    if (Array.isArray(row)) {
                        return (
                            <Menu.Group key={`group-${index}`}>
                                {row.map((item) => (
                                    <EntryContextMenuBaseItem
                                        key={`${index}-${item.id}`}
                                        {...item}
                                        entry={entry}
                                        onClick={handleMenuClick}
                                    />
                                ))}
                            </Menu.Group>
                        );
                    }
                    return (
                        <EntryContextMenuBaseItem
                            key={index}
                            {...row}
                            entry={entry}
                            onClick={handleMenuClick}
                        />
                    );
                })}
            </Menu>
        </Popup>
    );
};

export default EntryContextMenuBase;
