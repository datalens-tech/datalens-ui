import React from 'react';

import {Menu, Popup} from '@gravity-ui/uikit';
import type {MenuItemProps, PopupAnchorElement, PopupPlacement} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {ActionPanelEntryContextMenuQa} from 'shared/constants/qa/action-panel';

import type {MenuClickHandler} from '../EntryContextMenu';
import type {
    EntryContextMenuItem,
    EntryContextMenuItems,
    ShortEntry,
    WrapperParams,
} from '../helpers';

import './EntryContextMenuBase.scss';

const b = block('dl-entry-context-menu-base');
export const ICONS_ENTRY_MENU_DEFAULT_CLASSNAME = b('icon');
export const ICONS_ENTRY_MENU_DEFAULT_SIZE = 16;

const defaultPopupPlacement: PopupPlacement = ['left-start', 'left', 'left-end'];

// Base is used in navigation

type EntryContextMenuBaseItemProps<T extends ShortEntry> = {
    icon?: React.ReactNode;
    text: string;
    action: EntryContextMenuItem['action'];
    entry?: T;
    wrapper?: (args: WrapperParams) => JSX.Element;
    onClick: (action: EntryContextMenuItem['action']) => void;
    qa?: string;
    theme?: MenuItemProps['theme'];
};

const EntryContextMenuBaseItem = <T extends ShortEntry>(
    props: EntryContextMenuBaseItemProps<T>,
) => {
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

type EntryContextMenuBaseProps<T> = {
    visible?: boolean;
    hasTail?: boolean;
    anchorElement?: PopupAnchorElement;
    items?: EntryContextMenuItems;
    popupPlacement?: PopupPlacement;
    entry?: T;
    onMenuClick: MenuClickHandler<T>;
    onClose: () => void;
};

export const EntryContextMenuBase = <T extends ShortEntry>(props: EntryContextMenuBaseProps<T>) => {
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
            if (entry) {
                onMenuClick({entry, action});
            }
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
