import React from 'react';

import {Loader, SegmentedRadioGroup as RadioButton} from '@gravity-ui/uik, SegmentedRadioGroupit';
import cn from 'bem-cn-lite';
import {I18n} from 'i18n';
import debounce from 'lodash/debounce';
import noop from 'lodash/noop';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {filterUsersIds, makeUserId, normalizeDestination} from 'shared';
import {showToast} from 'store/actions/toaster';
import Tabs from 'ui/components/Tabs/Tabs';
import {DL} from 'ui/constants/common';
import {getResolveUsersByIdsAction} from 'ui/store/actions/usersByIds';
import {MOBILE_SIZE} from 'ui/utils/mobile';

import logger from '../../../libs/logger';
import {getSdk} from '../../../libs/schematic-sdk';
import Utils from '../../../utils';
import {EntryContextMenuBase} from '../../EntryContextMenu';
import {EmptyState} from '../components/EmptyState/EmptyState';
import {MAP_PLACE_TO_SCOPE, MODE_FULL, MODE_MINIMAL, OWNERSHIP, PLACE} from '../constants';
import {NavigationSettings} from '../settings';

import ErrorView from './ErrorView/ErrorView';
import OrderSelect from './OrderSelect/OrderSelect';
import SearchInput from './SearchInput/SearchInput';
import {TableView} from './TableView/TableView';

import './NavigationEntries.scss';

const b = cn('dl-core-navigation');
const i18n = I18n.keyset('component.navigation.view');

const mobileTabsItems = [
    {id: OWNERSHIP.ALL, title: i18n('label_mobile-navigation-filters-all')},
    {id: OWNERSHIP.ONLY_MINE, title: i18n('label_mobile-navigation-filters-mine')},
    {id: OWNERSHIP.FAVORITES, title: i18n('label_mobile-navigation-filters-favorites')},
];

const MOBILE_PLACES = [MAP_PLACE_TO_SCOPE[PLACE.DASHBOARDS], MAP_PLACE_TO_SCOPE[PLACE.WIDGETS]];

class NavigationEntries extends React.Component {
    static propTypes = {
        scope: PropTypes.string,
        path: PropTypes.string,
        place: PropTypes.string,
        mode: PropTypes.string,
        // used only in mobile navigation
        defaultPlace: PropTypes.string,

        clickableScope: PropTypes.string,
        inactiveEntryKeys: PropTypes.arrayOf(PropTypes.string),
        currentPageEntry: PropTypes.object,
        checkEntryActivity: PropTypes.func,

        linkWrapper: PropTypes.func,
        onEntryClick: PropTypes.func,
        onEntryParentClick: PropTypes.func,
        onChangeFavorite: PropTypes.func,
        onPlaceChange: PropTypes.func,
        setBreadCrumbs: PropTypes.func,

        getContextMenuItems: PropTypes.func,
        onContextMenuClick: PropTypes.func,
        focusSearchInput: PropTypes.func,
        clearSearchInput: PropTypes.func,

        onItemSelect: PropTypes.func,

        getPlaceParameters: PropTypes.func.isRequired,
        inactiveEntryIds: PropTypes.arrayOf(PropTypes.string),
        isMobileNavigation: PropTypes.bool,
        isOnlyCollectionsMode: PropTypes.bool,
        ignoreWorkbookEntries: PropTypes.bool,
        onChangeLocation: PropTypes.func,

        resolveUsersByIds: PropTypes.func,

        onPermissionError: PropTypes.func,

        renderEmptyStateAction: PropTypes.func,
    };
    static defaultProps = {
        mode: MODE_FULL,
        place: PLACE.ROOT,
        setBreadCrumbs: noop,
        onChangeLocation: noop,
        renderEmptyStateAction: noop,
    };
    static getDerivedStateFromProps(nextProps, prevState) {
        const {scope, path, place} = nextProps;
        const needUpdate = !(
            scope === prevState.scope &&
            path === prevState.path &&
            place === prevState.place
        );
        let {searchValue, hasNextPage, page, ownership} = prevState;

        if (needUpdate) {
            searchValue = '';
            hasNextPage = false;
            page = null;
        }
        if (scope !== prevState.scope && scope !== MAP_PLACE_TO_SCOPE[PLACE.FAVORITES]) {
            ownership = OWNERSHIP.ONLY_MINE;
        }

        return {
            scope,
            path,
            place,
            needUpdate,
            searchValue,
            hasNextPage,
            page,
            ownership,
        };
    }
    constructor(props) {
        super(props);
        const settings = new NavigationSettings();
        const createdBy = settings.getCreatedBy();

        this.state = {
            settings,
            entries: [],
            filteredEntries: [],
            orderBy: settings.getOrderBy(),
            ownership: createdBy ? OWNERSHIP.ONLY_MINE : OWNERSHIP.ALL,
            currentEntryContextButton: React.createRef(),
            breadCrumbs: [],
            isEmptyFolder: false,
        };
        this.debounceGetListDirectory = debounce(this.debounceGetListDirectory, 300);
        this.showHidden = Boolean(Utils.restore('dlShowHiddenEntries'));
    }
    componentDidMount() {
        this._isMounted = true;
        this.getListDirectory();
    }
    componentDidUpdate() {
        if (this.state.needUpdate) {
            if (this.props.clearSearchInput) {
                this.props.clearSearchInput();
            }

            this.getListDirectory();
        }
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    refSearchInput = React.createRef();
    getFilteredEntries(entries = []) {
        return entries.filter((entry) => {
            const showEntry = !entry.hidden || this.showHidden;

            return this.props.isMobileNavigation
                ? showEntry && MOBILE_PLACES.includes(entry.scope)
                : showEntry;
        });
    }
    refresh = () => {
        this.setState(
            {
                searchValue: '',
                hasNextPage: false,
                page: null,
            },
            () => {
                this.getListDirectory();
            },
        );
    };
    onLoadMore = () => {
        this.getListDirectory();
    };
    changeFavorite(entryId, isFavorite) {
        const {entries: stateEntries} = this.state;
        const entryIndex = stateEntries.findIndex((entry) => entry.entryId === entryId);
        if (entryIndex !== -1) {
            const entries = [
                ...stateEntries.slice(0, entryIndex),
                {...stateEntries[entryIndex], isFavorite},
                ...stateEntries.slice(entryIndex + 1),
            ];
            const filteredEntries = this.getFilteredEntries(entries);
            this.setState({entries, filteredEntries});
        }
    }
    requestList({isSearch}) {
        const {scope, path = '', place, getPlaceParameters, ignoreWorkbookEntries} = this.props;
        const {page: currentPage, searchValue, orderBy} = this.state;
        const placeParameters = getPlaceParameters(place);

        let page = currentPage === null ? 0 : currentPage + 1;
        if (isSearch) {
            page = 0;
        }
        this.setState({page});

        return getSdk().sdk.mix.getNavigationList(
            {
                place,
                scope,
                path: normalizeDestination(path),
                orderBy,
                createdBy:
                    this.state.ownership === OWNERSHIP.ONLY_MINE && place !== PLACE.ROOT
                        ? [DL.USER_LOGIN, makeUserId(DL.USER_ID)]
                        : undefined,
                pageSize: placeParameters.pageSize || 100,
                page,
                filters: {
                    name: searchValue,
                },
                ignoreWorkbookEntries,
            },
            {concurrentId: 'getNavigationList'},
        );
    }

    handlePermissionDenied = () => {};

    async getListDirectory({isSearch, ignoreEmpty, isPermissionRetry} = {}) {
        const {path, place, setBreadCrumbs, onPermissionError} = this.props;
        const {isEmptyFolder, searchValue} = this.state;

        if (ignoreEmpty && isEmptyFolder) {
            return;
        }

        this.setState({
            error: null,
            loading: true,
            hasNextPage: isSearch ? false : this.state.hasNextPage,
        });

        try {
            const {
                hasNextPage,
                entries: requestEntries,
                breadCrumbs,
            } = await this.requestList({
                isSearch,
            });
            if (requestEntries.length) {
                const ids = filterUsersIds(requestEntries.map((entry) => entry.createdBy));
                this.props.resolveUsersByIds(ids);
            }
            if (hasNextPage && requestEntries.length === 0) {
                this.getListDirectory();
                return;
            }
            if (!isSearch) {
                setBreadCrumbs(breadCrumbs);
            }
            const entries =
                this.state.hasNextPage && !isSearch
                    ? [...this.state.entries, ...requestEntries]
                    : requestEntries;
            const filteredEntries = this.getFilteredEntries(entries);
            if (path === this.props.path && place === this.props.place && this._isMounted) {
                this.setState({
                    loading: false,
                    entries,
                    filteredEntries,
                    hasNextPage,
                    breadCrumbs,
                    isEmptyFolder: searchValue ? isEmptyFolder : filteredEntries.length === 0,
                });
            }
            if (this.refSearchInput.current) {
                this.refSearchInput.current.focus();
            }
            if (this.props.focusSearchInput) {
                this.props.focusSearchInput();
            }
        } catch (error) {
            if (getSdk().sdk.isCancel(error)) {
                return;
            }
            if (error.status === 403 && !isPermissionRetry) {
                onPermissionError?.();
                this.setState({page: null});
                this.getListDirectory({isPermissionRetry: true});
                return;
            }
            logger.logError('NavigationEntries: getListDirectory failed', error);

            if (this._isMounted) {
                this.setState({
                    loading: false,
                    error,
                    breadCrumbs: this.cutBreadCrubms(path, place),
                });
            }
        }
    }
    cutBreadCrubms(path, place) {
        const {breadCrumbs} = this.state;
        if (place !== PLACE.ROOT) {
            return breadCrumbs;
        }
        const normalizedPath = normalizeDestination(path).toLowerCase();
        const index = breadCrumbs.findIndex(
            (breadCrumb) => breadCrumb.path.toLowerCase() === normalizedPath,
        );
        if (index === -1) {
            return breadCrumbs;
        } else {
            const result = breadCrumbs.slice(0, index + 1);
            this.props.setBreadCrumbs(result);
            return result;
        }
    }

    onChangeFavorite = async (entry) => {
        const {path} = this.props;
        const {entryId, isFavorite} = entry;
        this.changeFavorite(entryId, !isFavorite);
        try {
            if (isFavorite) {
                await getSdk().sdk.us.deleteFavorite({entryId});
            } else {
                await getSdk().sdk.us.addFavorite({entryId});
            }
            if (this.props.onChangeFavorite) {
                this.props.onChangeFavorite({entryId, isFavorite: !isFavorite});
            }
        } catch (error) {
            logger.logError('NavigationEntries: onChangeFavorite failed', error);
            if (path === this.props.path) {
                // rollback
                this.changeFavorite(entryId, isFavorite);

                this.props.showToast({
                    title: isFavorite
                        ? i18n('toast_failed-remove-favorite')
                        : i18n('toast_failed-add-favorite'),
                    name: 'ChangeFavoriteFailed',
                    error,
                });
            }
        }
    };
    onEntryContextClick = ({entry, buttonRef}) => {
        const isVisible =
            !this.state.currentEntryContext ||
            this.state.currentEntryContext.entryId !== entry.entryId;

        this.setState({
            currentEntryContextButton: isVisible ? buttonRef : React.createRef(),
            currentEntryContext: isVisible ? entry : null,
        });
    };
    closeEntryContextMenu = () => {
        this.setState({
            currentEntryContextButton: React.createRef(),
            currentEntryContext: null,
        });
    };
    debounceGetListDirectory({isSearch, ignoreEmpty}) {
        this.getListDirectory({isSearch, ignoreEmpty});
    }
    onChangeFilter = (searchValue) => {
        const filteredEntries = this.getFilteredEntries(this.state.entries);
        this.setState(
            {
                searchValue,
                filteredEntries,
            },
            () => {
                this.debounceGetListDirectory({isSearch: true, ignoreEmpty: true});
            },
        );
    };
    onChangeOrderBy = (orderBy) => {
        if (this.props.mode !== MODE_MINIMAL) {
            this.state.settings.setOrderBy(orderBy.field, orderBy.direction);
        }
        this.setState(
            {
                orderBy,
                hasNextPage: false,
                page: null,
            },
            () => {
                this.getListDirectory({ignoreEmpty: true});
            },
        );
    };
    onChangeOwnership = (ownership) => {
        if (this.props.mode !== MODE_MINIMAL) {
            this.state.settings.setCreatedBy(
                ownership === OWNERSHIP.ONLY_MINE ? DL.USER_LOGIN : '',
            );
        }

        this.setState(
            {
                ownership,
                hasNextPage: false,
                page: null,
            },
            () => {
                this.getListDirectory();
            },
        );
    };

    onAllDashboardsFilterClick = () => {
        this.setState(
            {
                ownership: OWNERSHIP.ALL,
                hasNextPage: false,
                page: null,
            },
            () => {
                if (this.props.place !== PLACE.DASHBOARDS) {
                    this.props.onPlaceChange(PLACE.DASHBOARDS);
                } else {
                    this.getListDirectory();
                }
            },
        );
    };
    onOnlyMineDashboardsFilterClick = () => {
        this.setState(
            {
                ownership: OWNERSHIP.ONLY_MINE,
                hasNextPage: false,
                page: null,
            },
            () => {
                if (this.props.place !== PLACE.DASHBOARDS) {
                    this.props.onPlaceChange(PLACE.DASHBOARDS);
                } else {
                    this.getListDirectory();
                }
            },
        );
    };
    onFavoritesDashboardsFilterClick = () => {
        this.setState(
            {
                ownership: OWNERSHIP.ALL,
                hasNextPage: false,
                page: null,
            },
            () => {
                this.props.onPlaceChange(PLACE.FAVORITES);
            },
        );
    };

    onSelectTab = (tabId) => {
        const {onPlaceChange, defaultPlace} = this.props;
        this.setState(
            {
                ownership: tabId,
                hasNextPage: false,
                page: null,
            },
            () => {
                if (tabId === OWNERSHIP.ONLY_MINE || tabId === OWNERSHIP.ALL) {
                    onPlaceChange(defaultPlace || PLACE.DASHBOARDS);
                    this.getListDirectory();
                    return;
                }
                onPlaceChange(PLACE.FAVORITES);
            },
        );
    };

    renderEntriesHeader() {
        const {mode} = this.props;
        const {place} = this.state;
        const {filters} = this.props.getPlaceParameters(place);
        const isMinimalMode = mode === MODE_MINIMAL;

        if (!filters && isMinimalMode) {
            return null;
        }

        return (
            <div className={b('entries-header')}>
                <div className={b('search')}>
                    <SearchInput
                        ref={this.refSearchInput}
                        text={this.state.searchValue}
                        placeholder={i18n('label_placeholder-filter-by-name')}
                        onChange={this.onChangeFilter}
                    />
                </div>
                {filters && (
                    <div className={b('filters')}>
                        {filters.order && (
                            <div className={b('filters-item')}>
                                <OrderSelect
                                    orderBy={this.state.orderBy}
                                    onChange={this.onChangeOrderBy}
                                />
                            </div>
                        )}
                        {filters.ownership && (
                            <div className={b('filters-item')}>
                                <RadioButton
                                    value={this.state.ownership}
                                    onUpdate={this.onChangeOwnership}
                                    options={[
                                        {
                                            value: OWNERSHIP.ALL,
                                            content: i18n('value_ownership-all'),
                                        },
                                        {
                                            value: OWNERSHIP.ONLY_MINE,
                                            content: i18n('value_ownership-only-mine'),
                                        },
                                    ]}
                                />
                            </div>
                        )}
                    </div>
                )}
                <div className={b('custom')}>{this.props.children}</div>
            </div>
        );
    }
    renderFiltersForMobileNavigationPage() {
        const {ownership} = this.state;

        return (
            <div>
                <div className={b('mobile-filters', {mobile: DL.IS_MOBILE})}>
                    <Tabs
                        items={mobileTabsItems}
                        activeTab={ownership}
                        size={MOBILE_SIZE.TABS}
                        onSelectTab={this.onSelectTab}
                    />
                </div>
            </div>
        );
    }
    renderLoader() {
        return (
            <div className={b('spinner')}>
                <Loader size="l" />
            </div>
        );
    }
    renderContextMenu() {
        return (
            this.state.currentEntryContextButton.current && (
                <EntryContextMenuBase
                    visible={true}
                    entry={this.state.currentEntryContext}
                    anchorRef={this.state.currentEntryContextButton}
                    items={this.props.getContextMenuItems({
                        entry: this.state.currentEntryContext,
                        place: this.state.place,
                    })}
                    onMenuClick={this.props.onContextMenuClick}
                    onClose={this.closeEntryContextMenu}
                />
            )
        );
    }
    renderView() {
        const {place, entries, filteredEntries, currentEntryContext, isEmptyFolder} = this.state;
        const {mode} = this.props;

        const filteredEntriesEmpty = filteredEntries.length === 0;
        const entriesEmpty = entries.length === 0;
        const showEmpty = filteredEntriesEmpty || entriesEmpty;

        if (showEmpty) {
            return (
                <EmptyState
                    className={b('empty-entries')}
                    mode={mode}
                    isEmptyFolder={isEmptyFolder}
                    place={place}
                    renderAction={this.props.renderEmptyStateAction}
                />
            );
        }

        const {displayParentFolder} = this.props.getPlaceParameters(place);

        return (
            <div className={b('table-view')}>
                <TableView
                    linkWrapper={this.props.linkWrapper}
                    mode={this.props.mode}
                    place={place}
                    clickableScope={this.props.clickableScope}
                    inactiveEntryKeys={this.props.inactiveEntryKeys}
                    currentPageEntry={this.props.currentPageEntry}
                    checkEntryActivity={this.props.checkEntryActivity}
                    entries={filteredEntries}
                    inactiveEntryIds={this.props.inactiveEntryIds}
                    currentEntryContext={currentEntryContext}
                    displayParentFolder={!this.props.isMobileNavigation && displayParentFolder}
                    onChangeFavorite={this.onChangeFavorite}
                    onEntryContextClick={this.onEntryContextClick}
                    onCloseEntryContextMenu={this.closeEntryContextMenu}
                    onEntryParentClick={this.props.onEntryParentClick}
                    onEntryClick={this.props.onEntryClick}
                    loading={this.state.loading}
                    hasNextPage={this.state.hasNextPage}
                    onLoadMore={this.onLoadMore}
                    isMobileNavigation={this.props.isMobileNavigation}
                    isOnlyCollectionsMode={this.props.isOnlyCollectionsMode}
                    refreshNavigation={this.refresh}
                    onChangeLocation={this.props.onChangeLocation}
                    onMenuClick={this.props.onContextMenuClick}
                    onItemSelect={this.props.onItemSelect}
                />
            </div>
        );
    }
    render() {
        const {isMobileNavigation} = this.props;
        const {loading, error, hasNextPage} = this.state;
        if (error) {
            return <ErrorView error={error} onRetryClick={this.refresh} />;
        }
        return (
            <div className={b('entries')}>
                {isMobileNavigation
                    ? this.renderFiltersForMobileNavigationPage()
                    : this.renderEntriesHeader()}
                <div className={b('view')}>
                    {loading && !hasNextPage ? this.renderLoader() : this.renderView()}
                    {this.renderContextMenu()}
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = {
    // need to be wrapped in additional function because the registry function does not have time to register
    resolveUsersByIds: (ids) => getResolveUsersByIdsAction()(ids),
    showToast,
};

export default connect(null, mapDispatchToProps, null, {forwardRef: true})(NavigationEntries);
