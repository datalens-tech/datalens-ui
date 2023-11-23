import React from 'react';

import {Ellipsis} from '@gravity-ui/icons';
import {Button, DropdownMenu, Icon, Portal} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {ChartkitMenuDialogsQA} from 'shared';

import {getVisibleItems} from '../../../../helpers';

import './Menu.scss';

const b = block('chartkit-menu');

export class Menu extends React.PureComponent {
    static propTypes = {
        items: PropTypes.array,
        /**
         * config for generate menu (not ready component as items), used instead of items
         */
        configMenu: PropTypes.array,
        widget: PropTypes.object,
        widgetDataRef: PropTypes.object,
        loadedData: PropTypes.object,
        error: PropTypes.object,
        propsData: PropTypes.object.isRequired,
        requestId: PropTypes.string.isRequired,
        widgetRendering: PropTypes.number,
        yandexMapAPIWaiting: PropTypes.number,
        hideComments: PropTypes.func,
        drawComments: PropTypes.func,
        onChange: PropTypes.func.isRequired,
        widgetRenderTimeRef: PropTypes.object,
        callbackOnCommentsChanged: PropTypes.func,
        commentsLength: PropTypes.number,
        /**
         * extra prop for rerender chart after show/hide comments menu
         * because it doesn't trigger any callbacks (and it should not trigger it)
         * but we need to toggle show/hide comments menu
         */
        hideChartComments: PropTypes.bool,
    };

    modalRef = React.createRef();

    isVisibleItem = ({isVisible, data}) => {
        try {
            return isVisible(data);
        } catch (error) {
            console.error('MENU_ITEM_IS_VISIBLE', error);
            return false;
        }
    };

    prepareItem = (item, data, onChange, index) => {
        const {title, icon, action, id, items} = item;
        const titleStr = typeof title === 'function' ? title(data) : title.toString();
        const itemIcon = typeof icon === 'function' ? icon(data) : icon;
        const subItems =
            items &&
            items.map((subitem, itemIndex) => this.prepareItem(subitem, data, onChange, itemIndex));

        return {
            key: `ch-menu-item-${id}-${index}`,
            qa: id,
            extraProps: {
                'data-qa': id,
            },
            action: async (event) => {
                const component = await action({
                    ...data,
                    event,
                    onChange,
                    anchorNode: this.modalRef.current,
                });

                this.setState({modal: component});
            },
            text: titleStr,
            items: subItems,
            icon: itemIcon,
            className: b('popup-item'),
        };
    };

    prepareItems = (items, data, onChange) => {
        return items.map((item, index) => {
            if (Array.isArray(item)) {
                return item.map((menu, itemIndex) =>
                    this.prepareItem(menu, data, onChange, `${index}-${itemIndex}`),
                );
            }
            return this.prepareItem(item, data, onChange, index);
        });
    };

    getVisibleSubItems = (data, items) => {
        const visibleItems = [];
        items.forEach((item) => {
            if (this.isVisibleItem({isVisible: item.isVisible, data})) {
                visibleItems.push(item);
            }
        });

        return visibleItems;
    };

    getFilteredItem = (item, data) => {
        const visibleSubItems = this.getVisibleSubItems(data, item.items || []);
        if (!this.isVisibleItem({isVisible: item.isVisible, data})) {
            return null;
        }
        return {...item, items: visibleSubItems};
    };

    getFilteredVisibleItems = (items, data) => {
        const visibleItems = [];

        for (const item of items) {
            if (Array.isArray(item)) {
                const itemsGroup = [];
                item.forEach((subMenuItem) => {
                    const filteredItem = this.getFilteredItem(subMenuItem, data);
                    if (filteredItem) {
                        itemsGroup.push(filteredItem);
                    }
                });
                visibleItems.push(itemsGroup);
                continue;
            }

            const filteredItem = this.getFilteredItem(item, data);
            if (filteredItem) {
                visibleItems.push(filteredItem);
            }
        }

        return visibleItems;
    };

    render() {
        const {
            items,
            widget,
            widgetDataRef,
            loadedData,
            requestId,
            widgetRendering,
            yandexMapAPIWaiting,
            propsData,
            error,
            hideComments,
            drawComments,
            onChange,
            widgetRenderTimeRef,
            callbackOnCommentsChanged,
            chartsDataProvider,
            configMenu,
            commentsLength,
        } = this.props;

        const data = {
            widget,
            widgetDataRef,
            loadedData,
            propsData,
            requestId,
            widgetRendering,
            yandexMapAPIWaiting,
            error,
            hideComments,
            drawComments,
            widgetRenderTimeRef,
            callbackOnCommentsChanged,
            chartsDataProvider,
        };

        if (!items && !configMenu) {
            return null;
        }

        const initialItems = configMenu
            ? getVisibleItems(configMenu, {
                  loadedData,
                  widgetDataRef,
                  widget,
                  chartsDataProvider,
                  widgetRenderTimeRef,
                  callbackOnCommentsChanged,
                  updatedCommentsLength: commentsLength,
                  error,
              })
            : items;

        const visibleItems = this.getFilteredVisibleItems(initialItems, data);

        if (!visibleItems.length) {
            return null;
        }

        const menuItems = this.prepareItems(visibleItems, data, onChange);
        const ModalComponent = this.state?.modal;

        return (
            <div
                className={b('switcher-button')}
                data-qa={ChartkitMenuDialogsQA.chartMenuDropDownSwitcher}
            >
                <DropdownMenu
                    size="s"
                    switcher={
                        <Button view="flat-secondary" size="l" className={b('switcher')}>
                            <Icon data={Ellipsis} size={16} />
                        </Button>
                    }
                    items={menuItems}
                    menuProps={{
                        qa: ChartkitMenuDialogsQA.chartMenuDropDown,
                    }}
                />
                <div className={b('modal-anchor')} ref={this.modalRef} />
                {ModalComponent && (
                    <Portal>
                        <ModalComponent onClose={() => this.setState({modal: null})} />
                    </Portal>
                )}
            </div>
        );
    }
}
