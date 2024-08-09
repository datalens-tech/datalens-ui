import React from 'react';

import {CircleQuestion, Gear, Sliders} from '@gravity-ui/icons';
import type {AsideHeaderProps, AsideHeaderTopAlertProps, MenuItem} from '@gravity-ui/navigation';
import {AsideHeader, FooterItem} from '@gravity-ui/navigation';
import {List} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n, i18n as baseI18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {Link, useLocation} from 'react-router-dom';
import {DlNavigationQA, Feature} from 'shared';
import {DL, PRODUCT_NAME} from 'ui/constants';
import {selectAsideHeaderIsCompact} from 'ui/store/selectors/asideHeader';
import Utils from 'ui/utils';

import {setAsideHeaderData, updateAsideHeaderIsCompact} from '../../store/actions/asideHeader';
import type {AsideHeaderData} from '../../store/typings/asideHeader';
import {UserAvatar} from '../UserMenu/UserAvatar';
import {UserMenu} from '../UserMenu/UserMenu';

import {Settings as SettingsPanel} from './Settings/Settings';

import iconNavigationDefault from '../../assets/icons/logo.svg';
import iconCollection from '../../assets/icons/mono-collection.svg';

import './AsideHeaderAdapter.scss';

const b = block('dl-aside-header');
const i18n = I18n.keyset('component.aside-header.view');

const COLLECTIONS_PATH = '/collections';
const SERVICE_SETTINGS_PATH = '/settings';

const LOGO_DEFAULT_SIZE = 32;
const FOOTER_ITEM_DEFAULT_SIZE = 18;
const PROMO_SITE_DOMAIN = 'https://datalens.tech';
const PROMO_DOC_PATH = '/docs';
const GITHUB_URL = 'https://github.com/datalens-tech/datalens';

export const DOCUMENTATION_LINK = `${PROMO_SITE_DOMAIN}${PROMO_DOC_PATH}/${DL.USER_LANG}/`;

export const ITEMS_NAVIGATION_DEFAULT_SIZE = 18;

type AsideHeaderAdapterProps = {
    renderContent?: AsideHeaderProps['renderContent'];
};

enum Panel {
    Settings = 'settings',
}

enum PopupName {
    Main = 'main',
    Account = 'account',
}

const getLinkWrapper = (node: React.ReactNode, path: string) => {
    return (
        <Link to={path} className={b('item-link')} data-qa={DlNavigationQA.AsideMenuItem}>
            <div className={b('item-wrap')}>{node}</div>
        </Link>
    );
};

const getLogoWrapper = (node: React.ReactNode) => {
    return (
        <a href="/" className={b('logo-link')}>
            {node}
        </a>
    );
};

type DocsItem = {
    text: React.ReactNode;
    hint?: string;
    url?: string;
    itemWrapper?: (item: DocsItem) => React.ReactNode;
};

const renderDocsItem = (item: DocsItem) => {
    const {text, url, hint, itemWrapper} = item;
    const title = hint ?? (typeof text === 'string' ? text : undefined);
    if (typeof itemWrapper === 'function') {
        return itemWrapper(item);
    } else if (url) {
        return (
            <a
                className={b('docs-link')}
                rel="noopener noreferrer"
                target="_blank"
                href={url}
                title={title}
            >
                {text}
            </a>
        );
    } else {
        return text;
    }
};

export const AsideHeaderAdapter = ({renderContent}: AsideHeaderAdapterProps) => {
    const dispatch = useDispatch();
    const {pathname} = useLocation();
    const isCompact = useSelector(selectAsideHeaderIsCompact);
    const [visiblePanel, setVisiblePanel] = React.useState<Panel>();
    const [currentPopup, setCurrentPopup] = React.useState<PopupName | null>(null);

    const renderAsideHeaderContent = React.useCallback(
        (asideHeaderData: AsideHeaderData) => {
            // Cause it's dispatch moving it to next tick to prevent render race warnings
            window.requestAnimationFrame(() => {
                dispatch(setAsideHeaderData(asideHeaderData));
            });

            return renderContent?.(asideHeaderData);
        },
        [renderContent, dispatch],
    );

    const onChangeCompact = React.useCallback(
        (compact: boolean) => {
            dispatch(updateAsideHeaderIsCompact(compact));
        },
        [dispatch],
    );

    const handleClosePanel = React.useCallback(() => {
        setVisiblePanel(undefined);
    }, []);

    const isReadOnly = Utils.isEnabledFeature(Feature.ReadOnlyMode);
    const topAlert: AsideHeaderTopAlertProps | undefined = isReadOnly
        ? {
              message: baseI18n('common.read-only', 'toast_editing-warning'),
          }
        : undefined;

    const menuItems: MenuItem[] = React.useMemo(
        () => [
            {
                id: 'collections',
                title: i18n('label_collections'),
                icon: iconCollection,
                iconSize: 16,
                current: pathname.includes(COLLECTIONS_PATH),
                itemWrapper: (params, makeItem) => {
                    return getLinkWrapper(makeItem(params), COLLECTIONS_PATH);
                },
            },
            {
                id: 'settings',
                title: i18n('switch_service-settings'),
                icon: Sliders,
                iconSize: ITEMS_NAVIGATION_DEFAULT_SIZE,
                current: pathname.includes(SERVICE_SETTINGS_PATH),
                itemWrapper: (params, makeItem) => {
                    return getLinkWrapper(makeItem(params), SERVICE_SETTINGS_PATH);
                },
            },
        ],
        [pathname],
    );

    const panelItems = React.useMemo(
        () => [
            {
                id: Panel.Settings,
                content: <SettingsPanel />,
                visible: visiblePanel === Panel.Settings,
            },
        ],
        [visiblePanel],
    );

    const renderFooter = () => {
        return (
            <React.Fragment>
                <FooterItem
                    compact={isCompact}
                    item={{
                        id: Panel.Settings,
                        icon: Gear,
                        iconSize: FOOTER_ITEM_DEFAULT_SIZE,
                        title: i18n('label_settings'),
                        tooltipText: i18n('label_settings'),
                        current: visiblePanel === Panel.Settings,
                        onItemClick: () =>
                            setVisiblePanel(
                                visiblePanel === Panel.Settings ? undefined : Panel.Settings,
                            ),
                    }}
                />
                <FooterItem
                    compact={isCompact}
                    item={{
                        id: PopupName.Main,
                        icon: CircleQuestion,
                        iconSize: FOOTER_ITEM_DEFAULT_SIZE,
                        title: i18n('label_main'),
                        tooltipText: i18n('label_main'),
                        current: currentPopup === PopupName.Main,
                        onItemClick: () => {
                            setVisiblePanel(undefined);
                            setCurrentPopup(
                                currentPopup === PopupName.Main ? null : PopupName.Main,
                            );
                        },
                    }}
                    enableTooltip={false}
                    popupVisible={currentPopup === PopupName.Main}
                    popupOffset={[0, 8]}
                    onClosePopup={() => setCurrentPopup(null)}
                    renderPopupContent={() => {
                        return (
                            <List
                                size="s"
                                items={[
                                    {
                                        text: i18n('label_github'),
                                        url: GITHUB_URL,
                                    },
                                    {
                                        text: i18n('label_about'),
                                        url: PROMO_SITE_DOMAIN,
                                    },
                                    {
                                        text: i18n('label_docs'),
                                        url: DOCUMENTATION_LINK,
                                    },
                                ]}
                                filterable={false}
                                virtualized={false}
                                renderItem={renderDocsItem}
                            />
                        );
                    }}
                />
                {DL.ZITADEL_ENABLED && (
                    <FooterItem
                        compact={isCompact}
                        item={{
                            id: PopupName.Account,
                            itemWrapper: (params, makeItem) =>
                                makeItem({...params, icon: <UserAvatar size="m" />}),
                            title: i18n('label_account'),
                            tooltipText: i18n('label_account'),
                            current: currentPopup === PopupName.Account,
                            onItemClick: () => {
                                setVisiblePanel(undefined);
                                setCurrentPopup(
                                    currentPopup === PopupName.Account ? null : PopupName.Account,
                                );
                            },
                        }}
                        enableTooltip={false}
                        popupVisible={currentPopup === PopupName.Account}
                        popupOffset={[0, 8]}
                        onClosePopup={() => setCurrentPopup(null)}
                        renderPopupContent={() => <UserMenu />}
                    />
                )}
            </React.Fragment>
        );
    };

    return (
        <AsideHeader
            compact={isCompact}
            logo={{
                text: PRODUCT_NAME,
                icon: iconNavigationDefault,
                iconSize: LOGO_DEFAULT_SIZE,
                iconClassName: b('logo-icon'),
                wrapper: getLogoWrapper,
            }}
            topAlert={topAlert}
            menuItems={menuItems}
            panelItems={panelItems}
            headerDecoration={false}
            onChangeCompact={onChangeCompact}
            renderFooter={renderFooter}
            renderContent={renderAsideHeaderContent}
            onClosePanel={handleClosePanel}
        />
    );
};
