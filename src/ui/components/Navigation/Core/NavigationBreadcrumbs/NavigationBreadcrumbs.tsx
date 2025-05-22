import React from 'react';

import {Breadcrumbs} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {EntryDialogues} from 'components/EntryDialogues';

import type {ListDirectoryBreadCrumb} from '../../../../../shared/schema';
import type {ChangeLocation, CurrentPageEntry, PlaceParameterItem} from '../../types';
import {isRootPlace} from '../../util';

import {BreadcrumbMenu} from './BreadcrumbMenu';

import './NavigationBreadcrumbs.scss';

const b = block('dl-core-navigation-breadcrumbs');

type ClickedItem = {
    path: string;
    name: string;
    entryId?: string;
};

type Props = {
    breadCrumbs: ListDirectoryBreadCrumb[];
    getPlaceParameters: (place: string) => PlaceParameterItem;
    place: string;
    enableMenu: boolean;
    onClick: (
        item: ClickedItem,
        event: React.MouseEvent<HTMLElement, MouseEvent> | KeyboardEvent,
        last: boolean,
    ) => void;
    getContextMenuItems: (data: {entry: unknown}) => unknown;
    refresh?: () => void;
    onChangeLocation?: ChangeLocation;
    className?: string;
    currentPageEntry?: CurrentPageEntry;
};

type Item = {
    qa?: string;
    item: {
        path: string;
        name: string;
    };
    text: string;
    action?: (event: React.MouseEvent<HTMLElement, MouseEvent> | KeyboardEvent) => void;
};

export const NavigationBreadcrumbs = ({
    breadCrumbs,
    place,
    getPlaceParameters,
    onClick,
    enableMenu,
    className,
    getContextMenuItems,
    currentPageEntry,
    refresh,
    onChangeLocation,
}: Props) => {
    const entryDialoguesRef = React.useRef<EntryDialogues>(null);

    const items: Item[] = React.useMemo(() => {
        const isRoot = isRootPlace(place);
        const {text} = getPlaceParameters(place);
        const firstClickedItem = {
            path: '',
            name: text,
        };

        const isFirstLast = !isRoot || breadCrumbs.length === 0;

        const breadCrumbsItems: Item[] = [
            {
                action: (event: React.MouseEvent<HTMLElement, MouseEvent> | KeyboardEvent) => {
                    onClick(firstClickedItem, event, isFirstLast);
                },
                text,
                qa: 'breadcrumbs-item-root',
                item: firstClickedItem,
            },
        ];

        if (isRoot) {
            breadCrumbsItems.push(
                ...breadCrumbs.map((item, index) => {
                    const last = breadCrumbs.length - 1 === index;
                    const clickedItem = {
                        path: item.path,
                        name: item.title,
                        entryId: item.entryId,
                    };
                    return {
                        action: (
                            event: React.MouseEvent<HTMLElement, MouseEvent> | KeyboardEvent,
                        ) => {
                            onClick(clickedItem, event, last);
                        },
                        qa: `breadcrumbs-item-${item.title}`,
                        text: item.title,
                        item: clickedItem,
                    };
                }),
            );
        }

        return breadCrumbsItems;
    }, [place, getPlaceParameters, breadCrumbs, onClick]);

    const showMenu = React.useMemo(() => {
        if (enableMenu && isRootPlace(place) && breadCrumbs.length > 0) {
            const breadCrumb = breadCrumbs[breadCrumbs.length - 1];
            return !breadCrumb.isLocked;
        } else {
            return false;
        }
    }, [enableMenu, place, breadCrumbs]);

    return (
        <div className={b(null, className)}>
            <EntryDialogues ref={entryDialoguesRef} />
            <div className={b('wrapper')}>
                <div className={b('line')}>
                    <Breadcrumbs className={b('component', {showMenu})}>
                        {items.map((item, index) => {
                            const last = index === items.length - 1;
                            return (
                                <Breadcrumbs.Item
                                    key={index}
                                    data-qa={item.qa}
                                    className={b('item', {last})}
                                    onClick={(event) => {
                                        onClick(item.item, event, last);
                                    }}
                                >
                                    {item.text}
                                </Breadcrumbs.Item>
                            );
                        })}
                    </Breadcrumbs>
                    {showMenu && Boolean(getContextMenuItems) && (
                        <BreadcrumbMenu
                            breadCrumbs={breadCrumbs}
                            getContextMenuItems={getContextMenuItems}
                            entryDialoguesRef={entryDialoguesRef}
                            currentPageEntry={currentPageEntry}
                            refresh={refresh}
                            onChangeLocation={onChangeLocation}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
