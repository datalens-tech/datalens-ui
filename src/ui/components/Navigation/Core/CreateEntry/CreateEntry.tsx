import React from 'react';

import type {DropdownMenuItem, DropdownMenuItemMixed, PopupPlacement} from '@gravity-ui/uikit';
import {Button, DropdownMenu} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Feature} from 'shared';
import {EntityIcon} from 'ui/components/EntityIcon/EntityIcon';

import Utils from '../../../../utils';
import {PLACE} from '../../constants';

import './CreateEntry.scss';

const i18n = I18n.keyset('component.navigation.view');
const b = block('dl-navigation-create-entry');
const popupPlacement: PopupPlacement = [
    'bottom-end',
    'bottom-start',
    'top-end',
    'left-start',
    'left-end',
];

export enum CreateMenuValue {
    Folder = 'folder',
    Script = 'script',
    Widget = 'widget',
    QL = 'ql',
    SQL = 'sql',
    PromQL = 'promql',
    MonitoringQL = 'monitoringql',
    Dashboard = 'dashboard',
    Connection = 'connection',
    Dataset = 'dataset',
}

const Title: React.FC<{title: string}> = ({title}) => (
    <div className={b('item-title')}>{title}</div>
);

const getButtonText = (place: string) => {
    switch (place) {
        case PLACE.CONNECTIONS:
            return i18n('button_create-connection');
        case PLACE.DASHBOARDS:
            return i18n('button_create-dashboard');
        case PLACE.DATASETS:
            return i18n('button_create-dataset');
        case PLACE.WIDGETS:
            return i18n('button_create-widget');
        default:
            return i18n('button_create');
    }
};

export interface CreateEntryProps {
    place: string;
    onClick: (value: CreateMenuValue, options?: Record<string, unknown>) => void;
    isOnlyCollectionsMode?: boolean;
}

export const CreateEntry: React.FC<CreateEntryProps> = ({
    place,
    onClick,
    isOnlyCollectionsMode = false,
}) => {
    const withMenu =
        place === PLACE.ROOT ||
        place === PLACE.FAVORITES ||
        (Utils.isEnabledFeature(Feature.ShowCreateEntryWithMenu) && place === PLACE.WIDGETS) ||
        (Utils.isEnabledFeature(Feature.ShowCreateEntryWithMenu) &&
            place === PLACE.WIDGETS &&
            Utils.isEnabledFeature(Feature.Ql));

    const items = React.useMemo(() => {
        let menuItems: DropdownMenuItemMixed<() => void>[] = [];

        if (!withMenu) {
            return menuItems;
        }

        let menuChartItems: DropdownMenuItem<() => void>[] = [];
        let menuOtherItems: DropdownMenuItem<() => void>[] = [];

        if (Utils.isEnabledFeature(Feature.EntryMenuEditor)) {
            // Chart creation elements subset
            menuChartItems = [
                // Editor
                {
                    action: () => onClick(CreateMenuValue.Script),
                    icon: <EntityIcon type="editor" />,
                    text: <Title title={i18n('value_create-editor')} />,
                },

                // Wizard
                {
                    action: () => onClick(CreateMenuValue.Widget),
                    icon: <EntityIcon type="chart-wizard" />,
                    text: <Title title={i18n('value_create-wizard')} />,
                },
            ];

            if (Utils.isEnabledFeature(Feature.Ql)) {
                menuChartItems = [
                    ...menuChartItems,

                    // QL-charts
                    {
                        action: () => onClick(CreateMenuValue.QL),
                        icon: <EntityIcon type="chart-ql" />,
                        text: <Title title={i18n('value_create-ql')} />,
                    },
                ];
            }

            // If current menu contains Charts only then return Charts creation subset
            if (place === PLACE.WIDGETS) {
                return menuChartItems;
            }

            // Other Items - subsets with Dashboards, Datasets, Connections and other independent entity types
            menuOtherItems = [
                {
                    action: () => onClick(CreateMenuValue.Dashboard),
                    icon: <EntityIcon type="dashboard" />,
                    text: <Title title={i18n('value_create-dashboard')} />,
                },
            ];

            menuOtherItems = menuOtherItems.concat([
                {
                    action: () => onClick(CreateMenuValue.Connection),
                    icon: <EntityIcon type="connection" />,
                    text: <Title title={i18n('value_create-connection')} />,
                },
                {
                    action: () => onClick(CreateMenuValue.Dataset),
                    icon: <EntityIcon type="dataset" />,
                    text: <Title title={i18n('value_create-dataset')} />,
                },
            ]);

            if (isOnlyCollectionsMode === false) {
                menuItems = [
                    [
                        {
                            action: () => onClick(CreateMenuValue.Folder),
                            icon: <EntityIcon type="folder" iconSize={18} />,
                            text: <Title title={i18n('value_create-folder')} />,
                        },
                    ],
                ];
            }

            menuItems.push(menuChartItems, menuOtherItems);

            return menuItems;
        } else {
            // Wizard charts only - by default
            menuChartItems = [
                {
                    action: () => onClick(CreateMenuValue.Widget),
                    icon: <EntityIcon type="chart-wizard" />,
                    text: <Title title={i18n('value_create-widget')} />,
                },
            ];

            if (Utils.isEnabledFeature(Feature.Ql)) {
                menuChartItems = [
                    ...menuChartItems,

                    // QL-charts
                    {
                        action: () => onClick(CreateMenuValue.SQL),
                        icon: <EntityIcon type="chart-ql" />,
                        text: <Title title={i18n('value_create-ql')} />,
                    },
                ];
            }

            // If current menu contains Charts only then return Charts creation subset
            if (place === PLACE.WIDGETS) {
                return menuChartItems;
            }

            menuOtherItems = [
                {
                    action: () => onClick(CreateMenuValue.Connection),
                    icon: <EntityIcon type="connection" />,
                    text: <Title title={i18n('value_create-connection')} />,
                },
                {
                    action: () => onClick(CreateMenuValue.Dataset),
                    icon: <EntityIcon type="dataset" />,
                    text: <Title title={i18n('value_create-dataset')} />,
                },
                {
                    action: () => onClick(CreateMenuValue.Dashboard),
                    icon: <EntityIcon type="dashboard" />,
                    text: <Title title={i18n('value_create-dashboard')} />,
                },
            ];

            if (isOnlyCollectionsMode === false) {
                menuItems = [
                    [
                        {
                            action: () => onClick(CreateMenuValue.Folder),
                            icon: <EntityIcon type="folder" iconSize={18} />,
                            text: <Title title={i18n('value_create-folder')} />,
                        },
                    ],
                ];
            }

            menuItems.push(menuChartItems, menuOtherItems);

            return menuItems;
        }
    }, [withMenu, place, onClick, isOnlyCollectionsMode]);

    const onClickButton = React.useCallback(() => {
        switch (place) {
            case PLACE.CONNECTIONS:
                onClick(CreateMenuValue.Connection);
                break;
            case PLACE.DASHBOARDS:
                onClick(CreateMenuValue.Dashboard);
                break;
            case PLACE.DATASETS:
                onClick(CreateMenuValue.Dataset);
                break;
            case PLACE.WIDGETS:
                onClick(CreateMenuValue.Widget);
                break;
        }
    }, [place, onClick]);

    return (
        <DropdownMenu
            size="s"
            items={items}
            switcherWrapperClassName={b('switcher-wrapper')}
            disabled={!withMenu}
            popupProps={{
                contentClassName: b('popup'),
                placement: popupPlacement,
            }}
            menuProps={{className: b('popup-menu')}}
            switcher={
                <Button
                    view="action"
                    qa="create-entry-button"
                    className={b('button-create')}
                    onClick={withMenu ? undefined : onClickButton}
                >
                    {getButtonText(place)}
                </Button>
            }
        />
    );
};
