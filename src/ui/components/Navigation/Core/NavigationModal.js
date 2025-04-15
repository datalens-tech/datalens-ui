import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import isEqual from 'lodash/isEqual';
import noop from 'lodash/noop';
import PropTypes from 'prop-types';

import {MODE_MODAL} from '../constants';

import {CreateEntry} from './CreateEntry/CreateEntry';
import {NavigationBreadcrumbs} from './NavigationBreadcrumbs/NavigationBreadcrumbs';
import NavigationEntries from './NavigationEntries';
import Sidebar from './Sidebar/Sidebar';

import './NavigationModal.scss';

const b = cn('dl-core-navigation');

class NavigationModal extends React.Component {
    static propTypes = {
        path: PropTypes.string,
        place: PropTypes.string,
        linkWrapper: PropTypes.func,
        quickItems: PropTypes.array,
        onSidebarItemClick: PropTypes.func,
        onClose: PropTypes.func,
        onNavigate: PropTypes.func,
        getPlaceParameters: PropTypes.func.isRequired,
        onCreateMenuClick: PropTypes.func,
        onCrumbClick: PropTypes.func,
        visible: PropTypes.bool,
        aside: PropTypes.bool,
        hideSidebar: PropTypes.bool,
        isOnlyCollectionsMode: PropTypes.bool,
    };
    static defaultProps = {
        onCrumbClick: noop,
        onEntryClick: noop,
        onEntryParentClick: noop,
        onEntryContextClick: noop,
        onSidebarItemClick: noop,
    };
    state = {
        breadCrumbs: [],
        isSomeItemSelected: false,
    };
    static getDerivedStateFromProps(props, state) {
        const {path, place} = props;
        if (path === state.initialPath && place === state.initialPlace) {
            return null;
        } else {
            return {
                path,
                place,
                initialPath: path,
                initialPlace: place,
            };
        }
    }
    refEntries = React.createRef();
    navigate(entry, event) {
        if (this.props.onNavigate) {
            this.props.onNavigate(entry, event);
        } else if (entry.scope === 'folder') {
            event.preventDefault();
            this.setState({
                path: entry.key,
                place: entry.place,
            });
        }
    }
    onCrumbClick = (item, event, last) => {
        if (!last) {
            this.navigate(
                {
                    scope: 'folder',
                    key: item.path,
                },
                event,
            );
        }
        this.props.onCrumbClick(item, event, last);
    };
    onEntryClick = (entry, event) => {
        if (!entry.isLocked) {
            this.navigate(entry, event);
        }
        this.props.onEntryClick(entry, event);
    };
    onEntryParentClick = (entry, event) => {
        this.navigate(entry, event);
        this.props.onEntryParentClick(entry, event);
    };
    onSidebarItemClick = (entry, event) => {
        this.navigate(entry, event);
        this.props.onSidebarItemClick(entry, event);
    };
    refresh = () => {
        if (this.refEntries.current) {
            this.refEntries.current.refresh();
        }
    };
    setBreadCrumbs = (breadCrumbs) => {
        if (!isEqual(this.state.breadCrumbs, breadCrumbs)) {
            this.setState({breadCrumbs});
        }
    };
    onItemSelect = ({selectedItemsIds}) => {
        this.setState({isSomeItemSelected: selectedItemsIds.size > 0});
    };
    renderEmptyStateAction = () => (
        <CreateEntry
            place={this.props.place}
            onClick={this.props.onCreateMenuClick}
            isOnlyCollectionsMode={this.props.isOnlyCollectionsMode}
            buttonView="normal"
        />
    )
    render() {
        const {
            linkWrapper,
            onCrumbClick, // eslint-disable-line no-unused-vars
            onSidebarItemClick, // eslint-disable-line no-unused-vars
            quickItems,
            onClose,
            onCreateMenuClick,
            visible,
            hideSidebar,
            aside,
            ...props
        } = this.props;
        const {path, place} = this.state;
        const asideMode = Boolean(aside);

        const body = (
            <div className={b({modal: !asideMode, aside: asideMode})}>
                {!hideSidebar && (
                    <div className={b('sidebar')}>
                        <Sidebar
                            path={path}
                            currentPlace={place}
                            quickItems={quickItems}
                            linkWrapper={linkWrapper}
                            onItemClick={this.onSidebarItemClick}
                            getPlaceParameters={this.props.getPlaceParameters}
                        />
                    </div>
                )}
                <div className={b('content')}>
                    <div className={b('header')}>
                        <NavigationBreadcrumbs
                            breadCrumbs={this.state.breadCrumbs}
                            place={place}
                            getPlaceParameters={this.props.getPlaceParameters}
                            onClick={this.onCrumbClick}
                            enableMenu={!this.state.isSomeItemSelected}
                            getContextMenuItems={this.props.getContextMenuItems}
                            refresh={this.refresh}
                            onChangeLocation={this.props.onChangeLocation}
                            currentPageEntry={this.props.currentPageEntry}
                        />
                    </div>
                    <NavigationEntries
                        ref={this.refEntries}
                        {...props}
                        path={path}
                        place={place}
                        linkWrapper={linkWrapper}
                        onEntryClick={this.onEntryClick}
                        onEntryParentClick={this.onEntryParentClick}
                        getPlaceParameters={this.props.getPlaceParameters}
                        mode={MODE_MODAL}
                        setBreadCrumbs={this.setBreadCrumbs}
                        onItemSelect={this.onItemSelect}
                        renderEmptyStateAction={this.renderEmptyStateAction}
                    >
                        <CreateEntry
                            place={place}
                            onClick={onCreateMenuClick}
                            isOnlyCollectionsMode={this.props.isOnlyCollectionsMode}
                        />
                    </NavigationEntries>
                </div>
            </div>
        );
        return asideMode ? (
            body
        ) : (
            <Dialog open={visible} onClose={onClose} disableFocusTrap={true}>
                {body}
            </Dialog>
        );
    }
}

export default NavigationModal;
