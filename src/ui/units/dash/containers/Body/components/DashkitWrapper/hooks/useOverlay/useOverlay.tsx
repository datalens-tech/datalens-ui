import React from 'react';

import {DashKit as GravityDashkit} from '@gravity-ui/dashkit';
import type {
    ConfigItem,
    ConfigLayout,
    DashKit as DashKitComponent,
    DashKitGroup,
    DashKitProps,
} from '@gravity-ui/dashkit';
import {DEFAULT_GROUP, MenuItems} from '@gravity-ui/dashkit/helpers';
import {Gear, Pin, PinSlash} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {ControlQA, DashKitOverlayMenuQa, DashTabItemType} from 'shared';
import type {DashTab, DashTabItem, DashTabLayout} from 'shared';
import {FIXED_GROUP_CONTAINER_ID, FIXED_GROUP_HEADER_ID} from 'ui/components/DashKit/constants';
import {getDashKitMenu} from 'ui/components/DashKit/helpers';
import {openDialogDefault} from 'ui/components/DialogDefault/DialogDefault';
import {useWidgetMetaContext} from 'ui/units/dash/contexts/WidgetMetaContext';

import {removeGlobalItems, setCurrentTabData} from '../../../../../../store/actions/dashTyped';
import {openDialogRelations} from '../../../../../../store/actions/relations/actions';
import {selectCurrentTab} from '../../../../../../store/selectors/dashTypedSelectors';
import {isItemGlobal} from '../../../../../../utils/selectors';

import {getGlobalIcon, isConfigItemGlobal} from './helpers';

import iconRelations from 'ui/assets/icons/relations.svg';

import './OverlayControls.scss';

const b = block('dash-body-overlay-controls');

// TODO: add issue
type OverlayControls = NonNullable<DashKitProps['overlayControls']>;
type OverlayControlItem = OverlayControls[keyof OverlayControls][0];

type Args = {
    dashKitRef: React.RefObject<DashKitComponent>;
    groupsRenderers: DashKitGroup[];
    hashStates: DashKitProps['itemsStateAndParams'];
    tabDataConfig: DashKitProps['config'] | null;
    getGroupsInsertCoords: (forSingleInsert?: boolean) => Record<string, {x: number; y: number}>;
    getWidgetLayoutById: (widgetId: string) => DashTabLayout;
    onChange: (args: {
        config: DashKitProps['config'];
        itemsStateAndParams: DashKitProps['itemsStateAndParams'];
    }) => void;
};

export const useOverlay = ({
    dashKitRef,
    groupsRenderers,
    hashStates,
    tabDataConfig,
    getGroupsInsertCoords,
    getWidgetLayoutById,
    onChange,
}: Args): {controls: DashKitProps['overlayControls']; menu: DashKitProps['overlayMenuItems']} => {
    const dispatch = useDispatch();

    const metaContext = useWidgetMetaContext();

    const rawTabDataConfig = useSelector(selectCurrentTab) as DashTab;

    const togglePinElement = React.useCallback(
        (widget: ConfigItem) => {
            const groupCoords = getGroupsInsertCoords(true);

            let movedItem: ConfigLayout | null = null;
            const newLayout = rawTabDataConfig.layout.reduce<ConfigLayout[]>((memo, item) => {
                if (item.i === widget.id) {
                    const {parent, ...itemCopy} = item;
                    const isFixed =
                        parent === FIXED_GROUP_CONTAINER_ID || parent === FIXED_GROUP_HEADER_ID;

                    if (isFixed) {
                        movedItem = {
                            ...itemCopy,
                            ...groupCoords[DEFAULT_GROUP],
                        };
                    } else {
                        const parentId = FIXED_GROUP_HEADER_ID;

                        movedItem = {
                            ...itemCopy,
                            parent: FIXED_GROUP_HEADER_ID,
                            ...groupCoords[parentId],
                        };
                    }
                } else {
                    memo.push(item);
                }

                return memo;
            }, []);

            if (movedItem) {
                dispatch(
                    setCurrentTabData({
                        ...rawTabDataConfig,
                        layout: GravityDashkit.reflowLayout({
                            newLayoutItem: movedItem,
                            layout: newLayout,
                            groups: groupsRenderers,
                        }),
                    }),
                );
            }
        },
        [dispatch, rawTabDataConfig, groupsRenderers, getGroupsInsertCoords],
    );

    const controls: DashKitProps['overlayControls'] = React.useMemo(() => {
        return {
            overlayControls: [
                {
                    id: 'pin',
                    title: i18n('dash.main.view', 'label_pin'),
                    icon: Pin,
                    handler: togglePinElement,
                    visible: (configItem) => {
                        const parent = getWidgetLayoutById(configItem.id)?.parent;
                        const isSelector =
                            configItem.type === DashTabItemType.GroupControl ||
                            configItem.type === DashTabItemType.Control;

                        return (
                            isSelector &&
                            parent !== FIXED_GROUP_HEADER_ID &&
                            parent !== FIXED_GROUP_CONTAINER_ID
                        );
                    },
                    qa: DashKitOverlayMenuQa.PinButton,
                },
                {
                    id: 'unpin',
                    title: i18n('dash.main.view', 'label_unpin'),
                    icon: PinSlash,
                    handler: togglePinElement,
                    visible: (configItem) => {
                        const parent = getWidgetLayoutById(configItem.id)?.parent;

                        return (
                            parent === FIXED_GROUP_HEADER_ID || parent === FIXED_GROUP_CONTAINER_ID
                        );
                    },
                    qa: DashKitOverlayMenuQa.UnpinButton,
                },
                {
                    id: MenuItems.Settings,
                    title: i18n('dash.settings-dialog.edit', 'label_settings'),
                    icon: Gear,
                    qa: ControlQA.controlSettings,
                    visible: (configItem) => {
                        return !isConfigItemGlobal(configItem);
                    },
                },
                {
                    id: MenuItems.Settings,
                    title: i18n('dash.settings-dialog.edit', 'label_settings'),
                    className: b('global-icon'),
                    iconSize: 20,
                    renderIcon: (widget) => {
                        const dashItem = widget as DashTabItem;
                        return getGlobalIcon(dashItem);
                    },
                    qa: ControlQA.controlSettings,
                    visible: (configItem) => {
                        return isConfigItemGlobal(configItem);
                    },
                },
                {
                    allWidgetsControls: true,
                    title: i18n('dash.main.view', 'button_links'),
                    excludeWidgetsTypes: [
                        DashTabItemType.Text,
                        DashTabItemType.Title,
                        DashTabItemType.Image,
                    ],
                    icon: iconRelations,
                    qa: ControlQA.controlLinks,
                    handler: (widget: DashTabItem) => {
                        dispatch(
                            openDialogRelations({
                                widget,
                                dashKitRef,
                                onClose: () => {},
                                loadHiddenWidgetMeta: metaContext?.loadHiddenWidgetMeta,
                            }),
                        );
                    },
                } as OverlayControlItem,
            ],
        };
    }, [
        togglePinElement,
        getWidgetLayoutById,
        dispatch,
        dashKitRef,
        metaContext?.loadHiddenWidgetMeta,
    ]);

    const removeItemManual = React.useCallback(
        (itemId: string, isGlobal?: boolean) => {
            const currentItemsStateAndParams =
                hashStates && 'state' in hashStates ? hashStates.state : {};

            const {itemsStateAndParams, config} = GravityDashkit.removeItem({
                id: itemId,
                config: tabDataConfig as DashKitProps['config'],
                itemsStateAndParams: currentItemsStateAndParams,
            });
            onChange({
                config,
                itemsStateAndParams,
            });

            // if the widget was deleted and it was in globalItems, we need to remove it from other places manually
            if (isGlobal) {
                dispatch(removeGlobalItems({itemId}));
            }
        },
        [dispatch, hashStates, tabDataConfig, onChange],
    );

    const onRemoveDashkitItem = React.useCallback(
        (configItem: ConfigItem) => {
            const dashItem = configItem as unknown as DashTabItem;
            if (
                (dashItem.type === DashTabItemType.Control ||
                    dashItem.type === DashTabItemType.GroupControl) &&
                isItemGlobal(dashItem)
            ) {
                dispatch(
                    openDialogDefault({
                        caption: i18n('dash.main.view', 'title_remove-global-selector'),
                        message: i18n('dash.main.view', 'label_remove-global-selector'),
                        onApply: () => {
                            removeItemManual(configItem.id, true);
                        },
                        textButtonApply: i18n('dash.main.view', 'button_apply-remove-global-item'),
                        textButtonCancel: i18n('dash.main.view', 'button_cancel'),
                        size: 's',
                    }),
                );
                return;
            }
            removeItemManual(configItem.id, true);
        },
        [dispatch, removeItemManual],
    );

    const menu: DashKitProps['overlayMenuItems'] = React.useMemo(() => {
        const dashkitMenu = getDashKitMenu(onRemoveDashkitItem);

        return [
            ...dashkitMenu.slice(0, -1),
            {
                id: 'pin',
                title: i18n('dash.main.view', 'label_pin'),
                icon: <Icon data={Pin} size={16} />,
                handler: togglePinElement,
                visible: (configItem) => {
                    const parent = getWidgetLayoutById(configItem.id)?.parent;
                    const isSelector =
                        configItem.type === DashTabItemType.GroupControl ||
                        configItem.type === DashTabItemType.Control;

                    return (
                        !isSelector &&
                        parent !== FIXED_GROUP_HEADER_ID &&
                        parent !== FIXED_GROUP_CONTAINER_ID
                    );
                },
                qa: DashKitOverlayMenuQa.PinButton,
            },

            ...dashkitMenu.slice(-1),
        ];
    }, [getWidgetLayoutById, togglePinElement, onRemoveDashkitItem]);

    return {
        controls,
        menu,
    };
};
