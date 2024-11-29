import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Icon, Sheet} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {Hash} from 'history';
import {useShallowEqualSelector} from 'hooks';
import {I18n} from 'i18n';
import type {DatalensGlobalState} from 'index';
import throttle from 'lodash/throttle';
import {useDispatch} from 'react-redux';
import {Link, useLocation} from 'react-router-dom';
import {TableOfContentQa} from 'shared';
import {DL} from 'ui/constants';
import {
    selectHashStates,
    selectShowTableOfContent,
    selectTabId,
    selectTabs,
} from 'units/dash/store/selectors/dashTypedSelectors';
import {scrollIntoView} from 'utils';

import {
    appendSearchQuery,
    dispatchResize,
    getHashStateParam,
    memoizedGetLocalTabs,
} from '../../modules/helpers';
import {setPageTab, toggleTableOfContent} from '../../store/actions/dashTyped';

import './TableOfContent.scss';

const i18n = I18n.keyset('dash.table-of-content.view');

const b = block('table-of-content');

const scrollIntoViewOptions: ScrollIntoViewOptions = {behavior: 'smooth'};
const dispatchResizeTimeout = 200;
const scrollDelay = 300;

const getHash = ({
    itemTitle,
    hash,
    disableHashNavigation,
}: {
    itemTitle?: string;
    hash: Hash;
    disableHashNavigation?: boolean;
}) => {
    if (disableHashNavigation) {
        return hash;
    }

    return itemTitle ? `#${encodeURIComponent(itemTitle)}` : '';
};

const scrollIntoViewWithTimeout = (itemId: string) => {
    setTimeout(
        () => scrollIntoView(itemId, scrollIntoViewOptions),
        // to have time to change the height of the react-grid-layout (200ms)
        // DashKit rendering ended after location change (with manual page refresh) (50-70ms)
        // small margin
        scrollDelay,
    );
};

const TableOfContent: React.FC<{disableHashNavigation?: boolean}> = React.memo(
    ({disableHashNavigation}) => {
        const dispatch = useDispatch();
        const location = useLocation();

        const containerRef = React.useRef<HTMLDivElement | null>(null);
        const {opened, tabs, currentTabId, hashStates} = useShallowEqualSelector(selectState);
        const [offsets, setOffsets] = React.useState({top: '0px', bottom: '0px'});

        const isSelectedTab = React.useCallback(
            (tabId: string) => tabId === currentTabId,
            [currentTabId],
        );

        const handleToggleTableOfContent = React.useCallback(() => {
            dispatch(toggleTableOfContent());
        }, [dispatch]);

        const handleTabClick = React.useCallback(
            (tabId: string) => () => {
                dispatch(setPageTab(tabId));
                if (DL.IS_MOBILE) {
                    handleToggleTableOfContent();
                }
            },
            [dispatch, handleToggleTableOfContent],
        );

        const handleItemClick = React.useCallback(
            (tabId: string, itemTitle: string) => () => {
                if (!isSelectedTab(tabId)) {
                    dispatch(setPageTab(tabId));
                }
                if (DL.IS_MOBILE) {
                    handleToggleTableOfContent();
                }
                if (disableHashNavigation) {
                    scrollIntoViewWithTimeout(encodeURIComponent(itemTitle));
                }
            },
            [isSelectedTab, disableHashNavigation, dispatch, handleToggleTableOfContent],
        );

        const handleSheetClose = () => {
            if (opened) {
                handleToggleTableOfContent();
            }
        };

        const getLinkTo = React.useCallback(
            (tabId: string, itemTitle?: string) => ({
                ...location,
                search:
                    itemTitle && isSelectedTab(tabId)
                        ? location.search
                        : appendSearchQuery(location.search, {
                              tab: tabId,
                              state: getHashStateParam(hashStates, tabId),
                          }),
                hash: getHash({itemTitle, hash: location.hash, disableHashNavigation}),
            }),
            [disableHashNavigation, hashStates, isSelectedTab, location],
        );

        React.useEffect(() => {
            if (location.hash && !disableHashNavigation) {
                scrollIntoViewWithTimeout(location.hash.replace('#', ''));
            }
        }, [location.hash, disableHashNavigation]);
        React.useEffect(() => {
            // to recalculate ReactGridLayout
            dispatchResize(dispatchResizeTimeout);
        }, [opened]);

        React.useEffect(() => {
            if (DL.IS_MOBILE || !opened) {
                return;
            }

            const handler = throttle(() => {
                const containerEl = containerRef.current;

                if (!containerEl) {
                    return;
                }

                const containerRect = containerEl.getBoundingClientRect();
                const scrollTop = document.documentElement.scrollTop;
                const windowHeight = window.innerHeight;

                const topOffset = `${containerRect.top + scrollTop}px`;
                const bottomOffset = `${Math.max(0, windowHeight - containerRect.bottom)}px`;

                setOffsets((state) => {
                    if (state.top !== topOffset || state.bottom !== bottomOffset) {
                        return {top: topOffset, bottom: bottomOffset};
                    }

                    return state;
                });
            });

            window.addEventListener('scroll', handler);
            window.addEventListener('resize', handler);
            handler();

            // eslint-disable-next-line consistent-return
            return () => {
                window.removeEventListener('scroll', handler);
                window.removeEventListener('resize', handler);
            };
        }, [opened]);

        const localTabs = memoizedGetLocalTabs(tabs);

        const tabsItems = React.useMemo(
            () =>
                localTabs.map((tab) => (
                    <div className={b('tab-item')} key={tab.id}>
                        <Link
                            to={getLinkTo(tab.id)}
                            className={b('title', {selected: isSelectedTab(tab.id)})}
                            onClick={handleTabClick(tab.id)}
                        >
                            {tab.title}
                        </Link>
                        <div className={b('items')}>
                            {tab.items.map((item) => (
                                <Link
                                    to={getLinkTo(tab.id, item.title)}
                                    className={b('title', {item: true})}
                                    onClick={handleItemClick(tab.id, item.title)}
                                    key={item.id}
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                )),
            [getLinkTo, handleTabClick, handleItemClick, isSelectedTab, localTabs],
        );

        if (localTabs.length === 1 && !localTabs[0].items.length) {
            return null;
        }

        return (
            <React.Fragment>
                {DL.IS_MOBILE ? (
                    <Sheet
                        title={i18n('label_table-of-content')}
                        visible={opened}
                        id="dash-table-of-content"
                        allowHideOnContentScroll={false}
                        onClose={handleSheetClose}
                    >
                        <div className={b('tabs')}>{tabsItems}</div>
                    </Sheet>
                ) : (
                    <div
                        className={b()}
                        ref={containerRef}
                        data-qa={TableOfContentQa.TableOfContent}
                    >
                        <div className={b('wrapper', {opened})}>
                            <div className={b('sidebar', {opened})} style={offsets}>
                                <div className={b('header')}>
                                    <span className={b('header-title')}>
                                        {i18n('label_table-of-content')}
                                    </span>
                                    <span
                                        className={b('header-close', null)}
                                        data-qa={TableOfContentQa.CloseBtn}
                                        onClick={handleToggleTableOfContent}
                                    >
                                        <Icon data={Xmark} width="20" />
                                    </span>
                                </div>
                                <div className={b('tabs')}>{tabsItems}</div>
                            </div>
                        </div>
                    </div>
                )}
            </React.Fragment>
        );
    },
);

function selectState(state: DatalensGlobalState) {
    return {
        opened: selectShowTableOfContent(state),
        tabs: selectTabs(state),
        currentTabId: selectTabId(state),
        hashStates: selectHashStates(state),
    };
}

TableOfContent.displayName = 'TableOfContent';

export default TableOfContent;
