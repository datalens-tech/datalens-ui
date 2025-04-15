import React from 'react';

import cn from 'bem-cn-lite';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import {registry} from 'ui/registry';

import {getIsAsideHeaderEnabled} from '../../AsideHeaderAdapter';

import {CreateEntry} from './CreateEntry/CreateEntry';
import {NavigationBreadcrumbs} from './NavigationBreadcrumbs/NavigationBreadcrumbs';
import NavigationEntries from './NavigationEntries';
import Sidebar from './Sidebar/Sidebar';

import './NavigationInline.scss';

const b = cn('dl-core-navigation');

class NavigationInline extends React.Component {
    static propTypes = {
        path: PropTypes.string,
        place: PropTypes.string,
        linkWrapper: PropTypes.func,
        quickItems: PropTypes.array,
        onCrumbClick: PropTypes.func,
        onCreateMenuClick: PropTypes.func,
        onSidebarItemClick: PropTypes.func,
        getPlaceParameters: PropTypes.func.isRequired,
        hideSidebar: PropTypes.bool,
        isOnlyCollectionsMode: PropTypes.bool,
    };
    state = {
        breadCrumbs: [],
        isSomeItemSelected: false,
    };
    refEntries = React.createRef();
    setBreadCrumbs = (breadCrumbs) => {
        if (!isEqual(this.state.breadCrumbs, breadCrumbs)) {
            this.setState({breadCrumbs});
        }
    };
    onItemSelect = ({selectedItemsIds}) => {
        this.setState({isSomeItemSelected: selectedItemsIds.size > 0});
    };
    refresh = () => {
        if (this.refEntries.current) {
            this.refEntries.current.refresh();
        }
    };
    renderHeader() {
        const {place, onCrumbClick, onCreateMenuClick, getPlaceParameters} = this.props;

        const shouldRenderEntrySelect = getIsAsideHeaderEnabled();

        const {ActionPanelEntrySelect} = registry.common.components.getAll();

        return (
            <div className={b('header', {'with-cloud-tree-select': shouldRenderEntrySelect})}>
                {shouldRenderEntrySelect && <ActionPanelEntrySelect />}
                <NavigationBreadcrumbs
                    breadCrumbs={this.state.breadCrumbs}
                    place={place}
                    getPlaceParameters={getPlaceParameters}
                    onClick={onCrumbClick}
                    enableMenu={!this.state.isSomeItemSelected}
                    getContextMenuItems={this.props.getContextMenuItems}
                    refresh={this.refresh}
                    onChangeLocation={this.props.onChangeLocation}
                    currentPageEntry={this.props.currentPageEntry}
                />
                <CreateEntry
                    place={place}
                    isOnlyCollectionsMode={this.props.isOnlyCollectionsMode}
                    onClick={onCreateMenuClick}
                />
            </div>
        );
    }
    renderEmptyStateAction = () => (
        <CreateEntry
            place={this.props.place}
            onClick={this.props.onCreateMenuClick}
            isOnlyCollectionsMode={this.props.isOnlyCollectionsMode}
            buttonView="normal"
        />
    );
    render() {
        const {linkWrapper, quickItems, onSidebarItemClick, ...props} = this.props;
        return (
            <div className={b({inline: true})}>
                {!this.props.hideSidebar && (
                    <div className={b('sidebar')}>
                        <Sidebar
                            path={this.props.path}
                            currentPlace={this.props.place}
                            quickItems={quickItems}
                            linkWrapper={linkWrapper}
                            onItemClick={onSidebarItemClick}
                            getPlaceParameters={this.props.getPlaceParameters}
                        />
                    </div>
                )}
                <div className={b('content')}>
                    {this.renderHeader()}
                    <NavigationEntries
                        ref={this.refEntries}
                        {...props}
                        linkWrapper={linkWrapper}
                        getPlaceParameters={this.props.getPlaceParameters}
                        setBreadCrumbs={this.setBreadCrumbs}
                        onItemSelect={this.onItemSelect}
                        renderEmptyStateAction={this.renderEmptyStateAction}
                    />
                </div>
            </div>
        );
    }
}

export default NavigationInline;
