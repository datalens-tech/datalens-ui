import React from 'react';

import {Ellipsis} from '@gravity-ui/icons';
import {Button, DropdownMenu, Icon, Menu as ListMenu, Portal, Sheet} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import {ChartkitMenuDialogsQA, Feature, MenuItemsIds} from 'shared';
import {DL, SHEET_IDS} from 'ui/constants';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {getVisibleItems} from '../../../../helpers';

import './Menu.scss';

const i18n = I18n.keyset('chartkit.menu');

const b = block('chartkit-menu');

const SwitcherButton = (props) => {
    const showFlatControls = isEnabledFeature(Feature.DashFloatControls);
    const buttonSize = showFlatControls ? 'm' : 'l';

    return (
        <Button
            {...props}
            view="flat-secondary"
            size={buttonSize}
            className={b('switcher', {flat: showFlatControls})}
        >
            <Icon data={Ellipsis} size={16} />
        </Button>
    );
};

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
        chartsDataProvider: PropTypes.object,
        /**
         * extra prop for rerender chart after show/hide comments menu
         * because it doesn't trigger any callbacks (and it should not trigger it)
         * but we need to toggle show/hide comments menu
         */
        hideChartComments: PropTypes.bool,
    };

    state = {
        modal: null,
        isSheetVisible: false,
        sheetCloseCb: null,
        isMenuOpened: false,
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
            id,
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
            iconStart: itemIcon,
            className: b('popup-item'),
        };
    };

    prepareItems = (items, data, onChange) => {
        return items
            .map((item, index) => {
                if (Array.isArray(item)) {
                    return item.map((menu, itemIndex) =>
                        this.prepareItem(menu, data, onChange, `${index}-${itemIndex}`),
                    );
                }
                return this.prepareItem(item, data, onChange, index);
            })
            .filter((item) => !isEmpty(item));
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

    handleMobileSwitchClick = () => this.setState({isSheetVisible: true});
    handleSheetClose = () => {
        const {isSheetVisible, sheetCloseCb} = this.state;
        // for a late start of the callback, so that the sheet has time to close before rerenders of fullscreen
        if (!isSheetVisible && sheetCloseCb) {
            sheetCloseCb();
            this.setState({sheetCloseCb: null});
            return;
        }
        this.setState({isSheetVisible: false});
    };
    handleModalClose = () => this.setState({modal: null, isSheetVisible: false});
    handleFullscreenOpen = (itemAction) => {
        return () => {
            this.setState({isSheetVisible: false, sheetCloseCb: itemAction});
        };
    };

    handleMenuBtnCLick = (isOpened) => {
        this.setState({isMenuOpened: Boolean(isOpened)});
    };

    renderSheet = (menuItems) => (
        <React.Fragment>
            <SwitcherButton onClick={this.handleMobileSwitchClick} />
            <Sheet
                onClose={this.handleSheetClose}
                visible={this.state.isSheetVisible}
                title={i18n('title_select-action')}
                contentClassName={b('sheet-content')}
                allowHideOnContentScroll={false}
                id={SHEET_IDS.CHART_MENU}
            >
                <ListMenu size="xl" className={b('sheet-menu')}>
                    {menuItems.flat().map((item) => (
                        <ListMenu.Item
                            key={item.key}
                            qa={item.qa}
                            onClick={
                                item.id === MenuItemsIds.FULLSCREEEN
                                    ? this.handleFullscreenOpen(item.action)
                                    : item.action
                            }
                            iconStart={item.icon}
                        >
                            {item.text}
                        </ListMenu.Item>
                    ))}
                </ListMenu>
            </Sheet>
        </React.Fragment>
    );

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

        const {modal: ModalComponent} = this.state;

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

        return (
            <div
                className={b('switcher-button', {['opened']: this.state.isMenuOpened})}
                data-qa={ChartkitMenuDialogsQA.chartMenuDropDownSwitcher}
            >
                {DL.IS_MOBILE ? (
                    this.renderSheet(menuItems)
                ) : (
                    <DropdownMenu
                        size="s"
                        renderSwitcher={(props) => <SwitcherButton {...props} />}
                        items={menuItems}
                        menuProps={{
                            qa: ChartkitMenuDialogsQA.chartMenuDropDown,
                        }}
                        onOpenToggle={this.handleMenuBtnCLick}
                    />
                )}
                <div className={b('modal-anchor')} ref={this.modalRef} />
                {ModalComponent && (
                    <Portal>
                        <ModalComponent onClose={this.handleModalClose} />
                    </Portal>
                )}
            </div>
        );
    }
}
