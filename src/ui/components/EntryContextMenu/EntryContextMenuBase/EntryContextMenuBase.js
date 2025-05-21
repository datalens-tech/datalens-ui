import React from 'react';

import {Menu, Popup} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {ActionPanelEntryContextMenuQa} from 'shared/constants/qa/action-panel';

import './EntryContextMenuBase.scss';

const b = block('dl-entry-context-menu-base');
export const ICONS_ENTRY_MENU_DEFAULT_CLASSNAME = b('icon');
export const ICONS_ENTRY_MENU_DEFAULT_SIZE = 16;

const defaultPopupPlacement = ['left-start', 'left', 'left-end'];

// Base is used in navigation

class EntryContextMenuBaseItem extends React.Component {
    static propTypes = {
        icon: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        text: PropTypes.string,
        action: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        entry: PropTypes.object,
        wrapper: PropTypes.func,
        onClick: PropTypes.func,
        theme: PropTypes.string,
        qa: PropTypes.string,
    };
    onClick = () => {
        const {action} = this.props;
        this.props.onClick(action);
    };
    render() {
        const {icon, text, theme, qa} = this.props;
        const node = (
            <Menu.Item
                qa={qa}
                onClick={this.onClick}
                iconStart={icon}
                className={b('item', {danger: theme === 'danger'})}
                theme={theme}
            >
                {text}
            </Menu.Item>
        );
        return this.props.wrapper
            ? this.props.wrapper({entry: this.props.entry, children: node})
            : node;
    }
}

class EntryContextMenuBase extends React.Component {
    static propTypes = {
        visible: PropTypes.bool,
        hasTail: PropTypes.bool,
        anchorRef: PropTypes.any,
        items: PropTypes.array,
        popupPlacement: PropTypes.array,

        entry: PropTypes.object,
        onMenuClick: PropTypes.func,
        onClose: PropTypes.func,
    };
    static defaultProps = {
        items: [],
        popupPlacement: defaultPopupPlacement,
    };
    onMenuClick = (action) => {
        const {entry} = this.props;
        this.props.onClose();
        this.props.onMenuClick({entry, action});
    };
    render() {
        const {items, entry} = this.props;
        return (
            <Popup
                hasArrow={this.props.hasTail}
                placement={this.props.popupPlacement}
                open={this.props.visible}
                anchorRef={this.props.anchorRef}
                onClose={this.props.onClose}
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
                                            onClick={this.onMenuClick}
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
                                onClick={this.onMenuClick}
                            />
                        );
                    })}
                </Menu>
            </Popup>
        );
    }
}

export default EntryContextMenuBase;
