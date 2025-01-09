import React from 'react';

import PropTypes from 'prop-types';
import {registry} from 'ui/registry';

import {DL} from '../../../constants/common';
import logger from '../../../libs/logger';
import {getSdk} from '../../../libs/schematic-sdk';
import {PLACE, PLACE_VALUES} from '../constants';

async function getEntryKey(entryId, defaultPath) {
    try {
        const {key} = await getSdk().sdk.us.getEntry({entryId});
        return key;
    } catch (error) {
        logger.logError('resolveNavigationPath: getEntry failed', error);
        return defaultPath;
    }
}

export const resolveNavigationPath = (Component) => {
    function ResolveNavigationPath(props) {
        const {startFrom, visible, resolvePathMode} = props;

        const [state, setState] = React.useState({});

        React.useEffect(() => {
            async function setPath(origin = DL.USER_FOLDER) {
                let path = '';
                let root = PLACE.ROOT;

                const {extractEntryId} = registry.common.functions.getAll();

                const possibleEntryId = extractEntryId(origin);

                if (resolvePathMode) {
                    switch (resolvePathMode) {
                        case 'place':
                            root = origin;
                            break;
                        case 'key':
                            path = origin;
                            break;
                        case 'id':
                            path = await getEntryKey(resolvePathMode, path);
                            break;
                        default:
                            throw new Error('unknown resolvePathMode');
                    }
                } else if (possibleEntryId && !startFrom.endsWith('/')) {
                    path = await getEntryKey(possibleEntryId, path);
                } else if (PLACE_VALUES.includes(origin)) {
                    root = origin;
                } else {
                    path = origin;
                }

                setState({...state, resolvedPath: path, resolvedRoot: root});
            }
            setPath(startFrom);
        }, [startFrom, resolvePathMode]);

        return 'resolvedPath' in state && visible ? (
            <Component {...props} path={state.resolvedPath} root={state.resolvedRoot} />
        ) : null;
    }

    ResolveNavigationPath.propTypes = {
        startFrom: PropTypes.string,
        sdk: PropTypes.object,
        visible: PropTypes.bool,
        resolvePathMode: PropTypes.string,
    };

    return ResolveNavigationPath;
};
