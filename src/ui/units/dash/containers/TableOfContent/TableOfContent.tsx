import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Icon, Sheet} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {Hash} from 'history';
import {useShallowEqualSelector} from 'hooks';
import {I18n} from 'i18n';
import type {DatalensGlobalState} from 'index';
import throttle from 'lodash/throttle';
import {useDispatch, useSelector} from 'react-redux';
import {Link, useHistory, useLocation} from 'react-router-dom';
import {TableOfContentQa} from 'shared';
import {MarkdownHelpPopover} from 'ui/components/MarkdownHelpPopover/MarkdownHelpPopover';
import {DL} from 'ui/constants';
import {selectAsideHeaderIsCompact} from 'ui/store/selectors/asideHeader';
import {isEmbeddedEntry} from 'ui/utils/embedded';
import {
    selectHashStates,
    selectShowTableOfContent,
    selectTabId,
    selectTabs,
} from 'units/dash/store/selectors/dashTypedSelectors';

import {
    appendSearchQuery,
    dispatchResize,
    getHashStateParam,
    memoizedGetLocalTabs,
} from '../../modules/helpers';
import type {DashDispatch} from '../../store/actions';
import {setPageTab, toggleTableOfContent} from '../../store/actions/dashTyped';

import {getUpdatedOffsets} from './helpers';

import './TableOfContent.scss';

const i18n = I18n.keyset('dash.table-of-content.view');

const b = block('table-of-content');

const DISPATCH_RESIZE_TIMEOUT = 200;
const THROTTLE_TIMEOUT = 100;

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

const TableOfContent = React.memo(
    ({
        disableHashNavigation,
        onItemClick,
    }: {
        disableHashNavigation?: boolean;
        onItemClick: (itemTitle: string) => void;
    }) => {
        const dispatch = useDispatch<DashDispatch>();
        const location = useLocation();
        const history = useHistory();

        const isAsideHeaderCompact = useSelector(selectAsideHeaderIsCompact);

        const containerRef = React.useRef<HTMLDivElement | null>(null);
        const {opened, tabs, currentTabId, hashStates} = useShallowEqualSelector(selectState);
        const [offsets, setOffsets] = React.useState({top: '0px', bottom: '0px', left: '0px'});

        const isSelectedTab = React.useCallback(
            (tabId: string) => tabId === currentTabId,
            [currentTabId],
        );

        const handleToggleTableOfContent = React.useCallback(() => {
            dispatch(toggleTableOfContent());
        }, [dispatch]);

        const handleTabClick = React.useCallback(
            async (event: React.MouseEvent<Element, MouseEvent>, tabId: string) => {
                // clicking on the tab with the meta-key pressed - opening the tab in a new window, and not switching to it
                if (event && event.metaKey) {
                    return;
                }

                // use history instead of link for correct work of logic in setPageTab until it's not metaKey
                event.preventDefault();

                const tabHashState = await dispatch(setPageTab(tabId));

                const searchParams = {
                    tab: tabId,
                    state: tabHashState?.hash ?? '',
                };

                history.push({
                    ...location,
                    search: appendSearchQuery(location.search, searchParams),
                    hash: isEmbeddedEntry() ? location.hash : '',
                });

                if (DL.IS_MOBILE) {
                    handleToggleTableOfContent();
                }
            },
            [dispatch, handleToggleTableOfContent, history, location],
        );

        const handleItemClick = React.useCallback(
            async (
                event: React.MouseEvent<Element, MouseEvent>,
                tabId: string,
                itemTitle: string,
            ) => {
                // clicking on the tab with the meta-key pressed - opening the tab in a new window, and not switching to it
                if (event && event.metaKey) {
                    return;
                }

                if (!isSelectedTab(tabId)) {
                    // use history instead of link for correct work of logic in setPageTab until it's not metaKey
                    event.preventDefault();

                    const tabHashState = await dispatch(setPageTab(tabId));

                    const searchParams = {
                        tab: tabId,
                        state: tabHashState?.hash ?? '',
                    };

                    history.push({
                        ...location,
                        search: appendSearchQuery(location.search, searchParams),
                        hash: getHash({itemTitle, hash: location.hash, disableHashNavigation}),
                    });
                }
                if (DL.IS_MOBILE) {
                    handleToggleTableOfContent();
                }
                onItemClick(itemTitle);
            },
            [
                isSelectedTab,
                onItemClick,
                dispatch,
                history,
                location,
                disableHashNavigation,
                handleToggleTableOfContent,
            ],
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

        const setUpdatedOffsets = React.useCallback(() => {
            const updatedOffsets = getUpdatedOffsets(containerRef);
            if (!updatedOffsets) {
                return;
            }
            const {topOffset, bottomOffset, leftOffset} = updatedOffsets;

            setOffsets((state) => {
                if (
                    state.top !== topOffset ||
                    state.bottom !== bottomOffset ||
                    state.left !== leftOffset
                ) {
                    return {top: topOffset, bottom: bottomOffset, left: leftOffset};
                }

                return state;
            });
        }, []);

        React.useEffect(() => {
            // to recalculate ReactGridLayout
            dispatchResize(DISPATCH_RESIZE_TIMEOUT);
        }, [opened]);

        React.useEffect(() => {
            if (DL.IS_MOBILE || !opened) {
                return;
            }

            const handler = throttle(() => {
                setUpdatedOffsets();
            }, THROTTLE_TIMEOUT);

            window.addEventListener('scroll', handler);
            handler();

            const resizeObserver = new ResizeObserver(() => {
                handler();
            });

            if (containerRef?.current) {
                resizeObserver.observe(containerRef?.current || undefined);
            }

            // eslint-disable-next-line consistent-return
            return () => {
                window.removeEventListener('scroll', handler);
                resizeObserver.disconnect();
            };
        }, [opened, setUpdatedOffsets]);

        React.useEffect(() => {
            requestAnimationFrame(setUpdatedOffsets);
        }, [isAsideHeaderCompact, setUpdatedOffsets]);

        const localTabs = memoizedGetLocalTabs(tabs);

        const tabsItems = React.useMemo(
            () =>
                localTabs.map((tab) => (
                    <div className={b('tab-item')} key={tab.id}>
                        <Link
                            to={getLinkTo(tab.id)}
                            className={b('title', {selected: isSelectedTab(tab.id)})}
                            onClick={(event) => handleTabClick(event, tab.id)}
                        >
                            {tab.title}
                        </Link>
                        <div className={b('items')}>
                            {tab.items.map((item) => (
                                <Link
                                    to={getLinkTo(tab.id, item.title)}
                                    className={b('title', {item: true})}
                                    onClick={(event) => handleItemClick(event, tab.id, item.title)}
                                    key={item.id}
                                >
                                    {item.title}
                                    {item.hint && (
                                        <MarkdownHelpPopover
                                            className={b('hint')}
                                            markdown={item.hint}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                        />
                                    )}
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
                        className={b('sheet')}
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
