import React from 'react';

import noop from 'lodash/noop';
import PropTypes from 'prop-types';

import {registry} from '../../registry';
import {EntryDialogName, EntryDialogResolveStatus, EntryDialogues} from '../EntryDialogues';

import {getPlaceConfig} from './Base/configure';
import NavigationMinimal from './Core/NavigationMinimal';
import PlaceSelect from './PlaceSelect/PlaceSelect';
import {PLACE} from './constants';
import {resolveNavigationPath} from './hoc/resolveNavigationPath';
import {checkEntryActivity} from './util';

class NavigationMinimalService extends React.PureComponent {
    static propTypes = {
        path: PropTypes.string,
        root: PropTypes.string,
        sdk: PropTypes.object,
        onClose: PropTypes.func,
        anchor: PropTypes.any,
        onEntryClick: PropTypes.func,
        clickableScope: PropTypes.string,
        includeClickableType: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.string),
        ]),
        excludeClickableType: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.string),
        ]),
        placeSelectParameters: PropTypes.shape({
            items: PropTypes.array.isRequired,
            quickItems: PropTypes.array,
        }),
        inactiveEntryIds: PropTypes.arrayOf(PropTypes.string),
        ignoreWorkbookEntries: PropTypes.bool,
        canCreateFolder: PropTypes.bool,
    };

    static defaultProps = {
        onClose: noop,
        onEntryClick: noop,
        root: PLACE.ROOT,
    };

    static getDerivedStateFromProps(props, state) {
        const {path, root} = props;
        if (path === state.initialPath && root === state.initialRoot) {
            return null;
        } else {
            return {
                path,
                root,
                initialPath: path,
                initialRoot: root,
            };
        }
    }

    state = {};

    refDialogues = React.createRef();
    refNavigation = React.createRef();
    preventClose = false;

    refresh() {
        if (this.refNavigation.current) {
            this.refNavigation.current.refresh();
        }
    }

    onClose = (event) => {
        const {anchor} = this.props;
        if (this.preventClose) {
            return;
        }
        if (
            (anchor.current && !anchor.current.contains(event.target)) ||
            (event instanceof KeyboardEvent && event.code === 'Escape')
        ) {
            this.props.onClose(event);
        }
    };

    onEntryClick = (entry, event) => {
        if (entry.isLocked) {
            this.unlockEntry(entry);
            return;
        }
        if (entry.scope !== 'folder') {
            this.props.onEntryClick(entry, event);
            return;
        }
        this.setState({
            path: entry.key,
            root: PLACE.ROOT,
        });
    };

    onEntryParentClick = (entry) => {
        this.onCrumbClick({path: entry.key});
    };

    onCrumbClick = (crumb, event, last) => {
        if (last) {
            this.refresh();
        } else {
            this.setState({
                path: crumb.path,
                root: PLACE.ROOT,
            });
        }
    };

    onPlaceSelectChange = ({path, root}) => {
        this.setState({
            path,
            root,
        });
    };

    onPermissionError = () => {
        this.setState({
            path: undefined,
            root: PLACE.ROOT,
        });
    };

    async unlockEntry(entry) {
        // TODO: move to Core/NavigationMinimal
        this.preventClose = true;
        await this.refDialogues.current.open({
            dialog: EntryDialogName.Unlock,
            dialogProps: {entry},
        });
        this.preventClose = false;
    }

    getInitialCreateDestination = () => {
        const {path} = this.state;

        const {getInitDestination} = registry.common.functions.getAll();

        return getInitDestination(path);
    };

    createFolderClick = async () => {
        this.preventClose = true;

        const response = await this.refDialogues.current.open({
            dialog: EntryDialogName.CreateFolder,
            dialogProps: {
                initDestination: this.getInitialCreateDestination(),
            },
        });

        if (response.status === EntryDialogResolveStatus.Success) {
            this.refNavigation.current.refresh();
        }

        this.preventClose = false;
    };

    render() {
        const {includeClickableType, excludeClickableType, placeSelectParameters, ...props} =
            this.props;

        const placeSelectNode = placeSelectParameters ? (
            <PlaceSelect
                place={this.state.root}
                path={this.state.path}
                items={placeSelectParameters.items}
                quickItems={placeSelectParameters.quickItems}
                onChange={this.onPlaceSelectChange}
            />
        ) : null;

        const {getNavigationPlacesConfig} = registry.common.functions.getAll();

        const getPlaceParameters = (place) => {
            return getPlaceConfig({place, placesConfig: getNavigationPlacesConfig()});
        };

        return (
            <React.Fragment>
                <NavigationMinimal
                    {...props}
                    checkEntryActivity={checkEntryActivity(
                        this.props.clickableScope,
                        includeClickableType,
                        excludeClickableType,
                    )}
                    onClose={this.onClose}
                    path={this.state.path}
                    place={this.state.root}
                    onCreateFolderClick={
                        this.props.canCreateFolder ? this.createFolderClick : undefined
                    }
                    onEntryClick={this.onEntryClick}
                    onEntryParentClick={this.onEntryParentClick}
                    onCrumbClick={this.onCrumbClick}
                    ref={this.refNavigation}
                    getPlaceParameters={getPlaceParameters}
                    placeSelectNode={placeSelectNode}
                    ignoreWorkbookEntries={this.props.ignoreWorkbookEntries}
                    onPermissionError={this.onPermissionError}
                />
                <EntryDialogues ref={this.refDialogues} sdk={this.props.sdk} />
            </React.Fragment>
        );
    }
}

export default resolveNavigationPath(NavigationMinimalService);
