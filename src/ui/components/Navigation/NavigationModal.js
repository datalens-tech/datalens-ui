import React from 'react';

import PropTypes from 'prop-types';

import NavigationBase from './Base/NavigationBase';
import NavigationModal from './Core/NavigationModal';
import {PLACE} from './constants';
import {resolveNavigationPath} from './hoc/resolveNavigationPath';

class ServiceNavigationModal extends React.PureComponent {
    static propTypes = {
        path: PropTypes.string,
        root: PropTypes.string,
        sdk: PropTypes.object,
        visible: PropTypes.bool,
        onClose: PropTypes.func,
        onUpdate: PropTypes.func,
        onChangeFavorite: PropTypes.func,
        currentPageEntry: PropTypes.object,
    };

    static defaultProps = {
        root: PLACE.ROOT,
    };

    state = {};

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

    onNavigate = (entry, event) => {
        if (entry.scope === 'folder' || entry.place) {
            event.preventDefault();
            this.setState({
                path: entry.key,
                root: entry.place,
            });
        }
    };

    onChangeLocation = (place, path) => {
        this.setState({path, root: place});
    };

    onPermissionError = () => {
        this.setState({
            path: undefined,
            root: PLACE.ROOT,
        });
    };

    render() {
        const {path, root} = this.state;
        return (
            <NavigationBase
                {...this.props}
                path={path}
                root={root}
                onNavigate={this.onNavigate}
                navConstructor={NavigationModal}
                onChangeLocation={this.onChangeLocation}
                onPermissionError={this.onPermissionError}
            />
        );
    }
}

export default resolveNavigationPath(ServiceNavigationModal);
