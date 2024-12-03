import React from 'react';

import type {ConfigItem, DashKitProps, ItemState} from '@gravity-ui/dashkit';
import {DashKit} from '@gravity-ui/dashkit';
import {MenuItems} from '@gravity-ui/dashkit/helpers';
import {Copy, Pencil, TrashBin} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {DashChartRequestContext, StringParams} from 'shared';
import {DashTabItemControlSourceType, DashTabItemType} from 'shared';
import {DashKitOverlayMenuQa} from 'shared/constants/qa/dash';
import {ExtendedDashKitContext} from 'ui/units/dash/utils/context';

import {getEndpointForNavigation} from '../../libs/DatalensChartkit/modules/navigation';
import URI from '../../libs/DatalensChartkit/modules/uri/uri';

import './DashKit.scss';

const i18n = I18n.keyset('component.dashkit.view');
const b = block('dashkit-plugin-menu');

type TabData = {id: string; chartId: string; params: StringParams; state: ItemState};

const removeEmptyParams = (params: StringParams) => {
    return Object.entries(params).reduce((result, [key, value]) => {
        if (value !== null && value !== undefined) {
            result[key] = value;
        }
        return result;
    }, {} as StringParams);
};

export function getEditLink(configItem: ConfigItem, params: StringParams, state: ItemState) {
    const {type, data} = configItem;

    let entryId: string | undefined;

    if (type === DashTabItemType.Control) {
        const source = data?.source as {chartId?: string} | undefined;
        if (source) {
            entryId = source?.chartId;
        }
    } else {
        const itemTabs = data?.tabs as Array<TabData> | undefined;
        if (itemTabs) {
            const stateTabId: string | undefined = state?.tabId;
            const itemTab = itemTabs.find((iTab) => iTab.id === stateTabId) || itemTabs[0];
            entryId = itemTab.chartId;
        }
    }

    if (!entryId) {
        return null;
    }

    // does not work properly in DEV mode without navigator
    const endpoint = getEndpointForNavigation();

    const linkParams = removeEmptyParams(params);

    const queryPrams = URI.makeQueryString(linkParams);

    return `${endpoint}/${entryId}${queryPrams}`;
}

export function getDashKitMenu() {
    return [
        {
            id: 'edit',
            title: i18n('label_edit'),
            icon: <Icon data={Pencil} size={16} />,
            handler: (configItem: ConfigItem, params: StringParams, state: ItemState) => {
                const link = getEditLink(configItem, params, state);

                if (link) {
                    window.open(link, '_blank');
                }
            },
            visible: (configItem: ConfigItem) => {
                const {type, data} = configItem;

                return (
                    type === DashTabItemType.Widget ||
                    (type === DashTabItemType.Control &&
                        data?.sourceType === DashTabItemControlSourceType.External)
                );
            },
        },
        {
            id: MenuItems.Copy,
            title: i18n('label_copy'),
            icon: <Icon data={Copy} size={16} />,
            qa: DashKitOverlayMenuQa.CopyButton,
        },
        {
            id: MenuItems.Delete,
            title: i18n('label_delete'),
            icon: <Icon data={TrashBin} size={16} />,
            className: b('item', {danger: true}),
            qa: DashKitOverlayMenuQa.RemoveButton,
        },
    ];
}

interface DashkitWrapperProps extends DashKitProps {
    // ref object
    ref?: React.ForwardedRef<DashKit>;
    // Make noOverlay partial
    noOverlay?: boolean;
    // Extended Controls props
    skipReload?: boolean;
    isNewRelations?: boolean;
    hideErrorDetails?: boolean;
    // Extended headers context for widgets
    dataProviderContextGetter?: () => DashChartRequestContext;
    setWidgetCurrentTab?: (payload: {widgetId: string; tabId: string}) => void;
}

export const DashkitWrapper: React.FC<
    Omit<DashkitWrapperProps, 'onItemEdit' | 'editMode'> & // Making edit props optional when editMode === false
        (
            | {editMode: true; onItemEdit: DashkitWrapperProps['onItemEdit']}
            | {editMode: false; onItemEdit?: DashkitWrapperProps['onItemEdit']}
        )
> = React.forwardRef(
    (
        {
            skipReload = false,
            isNewRelations = false,
            dataProviderContextGetter,
            setWidgetCurrentTab,
            ...props
        },
        ref: React.ForwardedRef<DashKit>,
    ) => {
        const contextValue = React.useMemo(() => {
            return {
                config: props.config,
                defaultGlobalParams: props.defaultGlobalParams,
                skipReload,
                isNewRelations,
                setWidgetCurrentTab,
                dataProviderContextGetter,
                hideErrorDetails: props.hideErrorDetails,
            };
        }, [
            props.config,
            props.defaultGlobalParams,
            skipReload,
            isNewRelations,
            setWidgetCurrentTab,
            dataProviderContextGetter,
            props.hideErrorDetails,
        ]);

        return (
            <ExtendedDashKitContext.Provider value={contextValue}>
                <DashKit {...props} ref={ref} />
            </ExtendedDashKitContext.Provider>
        );
    },
);

DashkitWrapper.displayName = 'DashkitContainer';
