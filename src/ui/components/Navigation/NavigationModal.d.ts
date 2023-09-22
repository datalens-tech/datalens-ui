import React from 'react';

import SDK from '../../libs/sdk';

import {ResolvePathMode} from './types';
import type {CurrentPageEntry} from './types';

export interface NavigationModalProps {
    sdk: SDK;
    startFrom?: string;
    onClose: () => void;
    visible: boolean;
    currentPageEntry?: CurrentPageEntry;
    resolvePathMode?: ResolvePathMode;
}

export default class NavigationModal extends React.PureComponent<NavigationModalProps> {}
